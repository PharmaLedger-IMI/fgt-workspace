const path = require('path');

require(path.join('../../privatesky/psknode/bundles', 'testsRuntime.js'));     // test runtime
require(path.join('../../privatesky/psknode/bundles', 'pskruntime.js'));
const tir = require("../../privatesky/psknode/tests/util/tir");                // the test server framework

const dc = require("double-check");
const assert = dc.assert;

const utils = require('../test-utils');

const MockDB = {
    interval: 500,
    batchInProgress: 0,
    currentTable: [],
    operations: [],

    beginBatch: () => {
        if(MockDB.batchInProgress === 0 && MockDB.currentTable.length < 2){
            MockDB.batchInProgress = 1;
            console.log(MockDB.currentTable)
            console.log(`Called Begin batch `, MockDB.currentTable[0]);
            MockDB.operations.push(`Called Begin batch db ${MockDB.currentTable[0]}`);

        } else {

            MockDB.operations.push('There Batch Already in Progress!');
            throw new Error ('There Batch Already in Progress!');

        }

        // Aqui podes defidir quando das erro ou nao
        
    },

    commitBatch: (callback) => {
        console.log('Commiting Batch');
        MockDB.operations.push(`Commiting Batch db ${MockDB.currentTable[0]}`)
        MockDB.batchInProgress = 0;
        MockDB.currentTable = [];
        
        setTimeout(() => {
            callback()
        }, MockDB.interval);
    },

    cancelBatch: (callback) => {
        // Aqui podes variar o timeout e decidir quando retorna erro ou nao
        setTimeout(() => {
            callback()
        }, MockDB.interval);
    }
}


const dataBaseAPI = require("opendsu").loadApi('db');
const keySSIApis = require('opendsu').loadApi('keyssi');


const {DB} = require('../../fgt-dsu-wizard/constants');

const {DBLock} = require('../../pdm-dsu-toolkit/managers');


const cb = function(err, dbLock, ...results){
    if (err)
        return dbLock.cancelBatch(err2 => {
            callback(err);
        });
    callback(undefined, ...results);
}


const startTransaction = function(mockDB, dbLock, tableName, callback){

    const beginBatch = function (tableName){
        return dbLock.beginBatch(tableName);
    }

    const dbAction = function(mockDB, dbLock, tableName, callback){

        try{
            mockDB.currentTable.push(tableName);
            beginBatch(tableName);
            MockDB.operations.push(`Called Begin batch dbLock ${tableName}`); 
        } catch (e){
            console.log(e);
            MockDB.currentTable.pop();
            return dbLock.schedule(() => dbAction(mockDB, dbLock, tableName, callback)); //removed return
        }

        callback()
    }

    dbAction(mockDB, dbLock, tableName, callback)


}

const operationsTransaction = function(tableName, callback){
    MockDB.operations.push(`Performing action on table ${tableName}`);
    callback();
}

const finishTransaction = function(dbLock, tableName, force, callback){

    const commitBatch = function (tableName, cb){
        return dbLock.commitBatch(tableName, callback);
    }

    const dbAction = function (dbLock, tableName, force, callback){

        commitBatch(tableName, (err) => {

            MockDB.operations.push('DB Lock commit')
            callback();            

        })


    }

    dbAction(dbLock, tableName, force, callback);


}

const testFinish = function(counter , func) {

    if(counter === 0){
        console.log(MockDB.operations);
        func()
    }

}

const completeTransaction = function(db, dbLock, tableName, timeout1, timeout2, timeout3, callback){
    
    let currentOperation = 1;
    
    setTimeout(() => {
        MockDB.operations.push(`${currentOperation}: Start Transaction on table ${tableName}`);
        currentOperation++;
        startTransaction(db, dbLock, tableName,() => {             
            setTimeout(() => {
                MockDB.operations.push(`${currentOperation}: Start Operation on table ${tableName}`);
                currentOperation++;
                operationsTransaction(tableName, () => {
                    setTimeout(() => {
                        MockDB.operations.push(`${currentOperation}: Commit Operation on table ${tableName}`);
                        currentOperation++;
                        finishTransaction(dbLock, tableName, false, () => {
                            callback();
                        })
                    },timeout3);                   
                })
            }, timeout2);  
        })
    }, timeout1); 
}

assert.callback("DB Lock test", (testFinishCallback) => {
   
            let db = MockDB;

            const dbLock = new DBLock(db, 1000);
            
            let tableNames = ['Status', 'AnotherStatus']

            let counter = 0;

            counter++;
            setTimeout(() => {
                completeTransaction(db,dbLock,tableNames[0],10,20,100,() => {   
                    counter--;
                    testFinish(counter, testFinishCallback);
                })

            },0);

            counter++;
            setTimeout(() => {
                completeTransaction(db,dbLock,tableNames[0],10,20,150,() => { 
                    counter--; 
                    testFinish(counter, testFinishCallback);
                })

            },50);

            counter++;
            setTimeout(() => {
                counter--;
                completeTransaction(db,dbLock,tableNames[0],30,50,1000, () => {   
                    testFinish(counter, testFinishCallback);
                })

            },1000);

            counter++;
            setTimeout(() => {
                completeTransaction(db,dbLock,tableNames[1],10,20,150,() => {
                    counter--;   
                    testFinish(counter, testFinishCallback);
                })

            },10);

            counter++;
            setTimeout(() => {
                completeTransaction(db,dbLock,tableNames[1],50,10,200,() => {   
                    counter--;
                    testFinish(counter, testFinishCallback);
                })

            },100);        
}, 50000);
