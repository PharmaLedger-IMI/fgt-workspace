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
            dbLock.schedule(() => dbAction(mockDB, dbLock, tableName, timeout, callback)); //removed return
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
    console.log(counter)
    counter--;

    if(counter === 0){
        console.log(MockDB.operations);
        func()
    }

}

const testTableLock = function (db, dblock, tableNames, counter, func, callback){
    MockDB.operations.push('Test Table Lock');

    let currentOperation = 1;

    MockDB.operations.push(`${currentOperation}: Start Transaction on table ${tableNames[0]}`);
    currentOperation++;
    startTransaction(db, dblock, tableNames[0],() => {
        MockDB.operations.push(`${currentOperation}: Start another Transaction on table ${tableNames[0]}`); 
        currentOperation++;
        startTransaction(db, dblock, tableNames[0],() => {
            MockDB.operations.push(`${currentOperation}: Start another Transaction on table ${tableNames[1]}`);
            currentOperation++;
            startTransaction(db, dblock, tableNames[1],() => {
            
            })  

            MockDB.operations.push(`${currentOperation}: Start Operation on table ${tableNames[0]}`);
            currentOperation++;
            operationsTransaction(tableNames[0], () => {
                MockDB.operations.push(`${currentOperation}: Start Operation on table ${tableNames[0]}`);
                currentOperation++;
                operationsTransaction(tableNames[0], () => {
                    MockDB.operations.push(`${currentOperation}: Commit Operation on table ${tableNames[0]}`);
                    currentOperation++;
                    finishTransaction(dblock, tableNames[0], false, () => {
                        MockDB.operations.push(`${currentOperation}: Start another Transaction on table ${tableNames[1]}`);
                        currentOperation++;
                        startTransaction(db, dblock, tableNames[1],() => {
                            MockDB.operations.push(`${currentOperation}: Start Operation on table ${tableNames[0]}`);
                            currentOperation++;
                            operationsTransaction(tableNames[0], () => {
                                MockDB.operations.push(`${currentOperation}: Commit Operation on table ${tableNames[0]}`);
                                currentOperation++;
                                finishTransaction(dblock, tableNames[0], false, () => {
            
                                    testFinish(counter, func);
            
                                })
                            })    
                        }) 
                    })             
                })                     
            }) 
            
        })
    })
}



assert.callback("DB Lock test", (testFinishCallback) => {
   
            let db = MockDB;

            const dbLock = new DBLock(db, 1000);
            
            let tableNames = ['Status', 'AnotherStatus']

            let counter = 1;

            // startTransaction(db , dbLock, tableNames[0], (err) => {
            //     console.log(db.operations);

            //     operationsTransaction(tableNames[0],err => {
            //         console.log(db.operations);

            //         finishTransaction(dbLock, tableNames[0], false, (err) =>{
            //             console.log(db.operations);

            //             setTimeout(() => {
            //                 counter--;
            //                 testFinish(counter, testFinishCallback)
            //             }, 3000);

            //         })
            //     })
            // })

            // startTransaction(db , dbLock, tableNames[0], (err) => {
            //     console.log(db.operations);

            //     operationsTransaction(tableNames[0],err => {
            //         console.log(db.operations);

            //         finishTransaction(dbLock, tableNames[0], false, (err) =>{
            //             console.log(db.operations);

            //             setTimeout(() => {
            //                 counter--;
            //                 testFinish(counter, testFinishCallback)
            //             }, 3000);

            //         })
            //     })
            // })

            // startTransaction(db , dbLock, tableNames[1], (err) => {
            //     console.log(db.operations);

            //     operationsTransaction(tableNames[0], err => {
            //         console.log(db.operations);

            //         finishTransaction(dbLock, tableNames[1], false, (err) =>{
            //             console.log(db.operations);

            //             setTimeout(() => {
            //                 counter--;
            //                 testFinish(counter, testFinishCallback)
            //             }, 3000);

            //         })
            //     })
            // })

            // startTransaction(db , dbLock, tableNames[1], (err) => {
            //     console.log(db.operations);

            //     operationsTransaction(tableNames[0], err => {
            //         console.log(db.operations);

            //         finishTransaction(dbLock, tableNames[1], false, (err) =>{
            //             console.log(db.operations);

            //             setTimeout(() => {
            //                 counter--;
            //                 testFinish(counter, testFinishCallback)
            //             }, 3000);

            //         })
            //     })
            // })

            // startTransaction(db , dbLock, tableNames[0], (err) => {
            //     console.log(db.operations);

            //     operationsTransaction(tableNames[0], err => {
            //         console.log(db.operations);

            //         finishTransaction(dbLock, tableNames[0], false, (err) =>{
            //             console.log(db.operations);

            //             setTimeout(() => {
            //                 counter--;
            //                 testFinish(counter, testFinishCallback)
            //             }, 3000);

            //         })
            //     })
            // })

            // setTimeout(() => {
                testTableLock(db, dbLock, tableNames, counter, testFinishCallback, () => {


                    console.log('Test table lock finished')

                })

            // }, 1000)
            
            
             
}, 50000);
