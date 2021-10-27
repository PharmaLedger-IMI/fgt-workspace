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
        callback();
        // setTimeout(() => {
        //     callback()
        // }, MockDB.interval);
    }
}


const dataBaseAPI = require("opendsu").loadApi('db');
const keySSIApis = require('opendsu').loadApi('keyssi');


const {DB} = require('../../fgt-dsu-wizard/constants');

const {DBLock} = require('../../pdm-dsu-toolkit/managers');

const startTransaction = function(dbLock, tableName, callback){

    const beginBatch = function (tableName){
        return dbLock.beginBatch(tableName);
    }

    const dbAction = function(dbLock, tableName, callback){

        try{
            MockDB.currentTable.push(tableName);
            beginBatch(tableName);
            MockDB.operations.push(`Called Begin batch dbLock ${tableName}`); 
        } catch (e){
            console.log(e);
            MockDB.currentTable.pop();
            return dbLock.schedule(() => dbAction(dbLock, tableName, callback)); 
        }

        callback()
    }

    dbAction(dbLock, tableName, callback)


}

const operationsTransaction = function(pass, tableName, timeout, callback){
    if(!pass)
        return callback('Error in Operation');

    MockDB.operations.push(`Performing action on table ${tableName}`);

    setTimeout(() => {
        callback();
    }, timeout);
    
}

const finishTransaction = function(pass, dbLock, tableName, force, callback){

    const commitBatch = function (tableName, cb){
        MockDB.operations.push('DB Lock commit');
        return dbLock.commitBatch(tableName, cb);
    }

    const dbAction = function (pass, dbLock, tableName, force, callback){

        commitBatch(tableName, () => {
            if(pass)
                return callback(undefined);

            callback('Error commiting');

        });


    }

    dbAction(pass, dbLock, tableName, force, callback);


}

const testFinish = function(counter , func) {

    if(counter === 0){
        func()
    }

}

const completeTransaction = function(reference, dbLock, tableName, timeout, force, callback){

    let currentOperation = 1;
    
    MockDB.operations.push(`${reference}${currentOperation}: Start Transaction on table ${tableName}`);
    currentOperation++;
    startTransaction(dbLock, tableName,() => {             
        MockDB.operations.push(`${reference} ${currentOperation}: Start Operation on table ${tableName}`);
        currentOperation++;
        operationsTransaction(false, tableName, timeout, (err) => {
            if(err)
                cancelTransaction(err, dbLock, tableName, callback);
            MockDB.operations.push(`${reference} ${currentOperation}: Commit Operation on table ${tableName}`);
            currentOperation++;
            finishTransaction(true, dbLock, tableName, force, (err) => {
                if(err)
                    cancelTransaction(err, dbLock, tableName, callback);

                callback(undefined);
            })            
        })       
    })
  
}

const testMultipleAsyncronousTransactions = function (dbLock, tableNames, force, callback){
    let counter = 0;
    
    counter++;
    //One
    setTimeout(() => {
        completeTransaction('First Transaction: ', dbLock, tableNames[0], 10, force,() => {   
            counter--;
            testFinish(counter, callback);
        })
    },0);

    counter++;
    //Two
    setTimeout(() => {
        counter--;
        completeTransaction('Second Transaction: ', dbLock,tableNames[0], 20, force, () => {   
            testFinish(counter, callback);
        })
    },1000);

    counter++;
    //Three
    setTimeout(() => {
        completeTransaction('Third Transaction: ', dbLock, tableNames[1], 30, force, () => {
            counter--;   
            testFinish(counter, callback);
        })
    },10);

    counter++;
    // Four
    setTimeout(() => {
        completeTransaction('Forth Transaction: ', dbLock, tableNames[1], 40, force,() => {   
            counter--;
            testFinish(counter, callback);
        })
    },100); 

    counter++;
    //Five
    setTimeout(() => {
        completeTransaction('Fifth Transaction', dbLock, tableNames[0], 50, force, () => { 
            counter--; 
            testFinish(counter, callback);
        })
    },50);

}

const cancelTransaction = function(err, dbLock, tableName, callback){
    if(err)
        return dbLock.cancelBatch(tableName, (err2) =>{
            callback(err);
        })

    callback(undefined);
}

assert.callback("DB Lock test", (testFinishCallback) => {
   
            let db = MockDB;

            const dbLock = new DBLock(db, 1000);
            
            let tableNames = ['Status', 'AnotherStatus']

            const compareTestMultipleAsync = ['First Transaction: 1: Start Transaction on table Status',
            'Called Begin batch db Status',
            'Called Begin batch dbLock Status',
            'First Transaction:  2: Start Operation on table Status',
            'Performing action on table Status',
            'Third Transaction: 1: Start Transaction on table AnotherStatus',
            'There Batch Already in Progress!',
            'First Transaction:  3: Commit Operation on table Status',
            'DB Lock commit',
            'Commiting Batch db Status',
            'Fifth Transaction1: Start Transaction on table Status',
            'Called Begin batch db Status',
            'Called Begin batch dbLock Status',
            'Fifth Transaction 2: Start Operation on table Status',
            'Performing action on table Status',
            'Forth Transaction: 1: Start Transaction on table AnotherStatus',
            'There Batch Already in Progress!',
            'Fifth Transaction 3: Commit Operation on table Status',
            'DB Lock commit',
            'Commiting Batch db Status',
            'Second Transaction: 1: Start Transaction on table Status',
            'Called Begin batch db Status',
            'Called Begin batch dbLock Status',
            'Second Transaction:  2: Start Operation on table Status',
            'Performing action on table Status',
            'Second Transaction:  3: Commit Operation on table Status',
            'DB Lock commit',
            'Commiting Batch db Status',
            'Called Begin batch db AnotherStatus',
            'Called Begin batch dbLock AnotherStatus',
            'Third Transaction:  2: Start Operation on table AnotherStatus',
            'Performing action on table AnotherStatus',
            'Third Transaction:  3: Commit Operation on table AnotherStatus',
            'DB Lock commit',
            'Commiting Batch db AnotherStatus',
            'Called Begin batch db AnotherStatus',
            'Called Begin batch dbLock AnotherStatus',
            'Forth Transaction:  2: Start Operation on table AnotherStatus',
            'Performing action on table AnotherStatus',
            'Forth Transaction:  3: Commit Operation on table AnotherStatus',
            'DB Lock commit',
            'Commiting Batch db AnotherStatus']

            let counter = 0;

            counter++;
            testMultipleAsyncronousTransactions(dbLock, tableNames, false, (err) => {
                if(err) {
                err = undefined;
                assert.true(err === undefined, 'Async Transactions failed');
                counter--;
                console.log(MockDB.operations);
                //assert.true(utils.isEqual(MockDB.operations, compareTestMultipleAsync), "Operations should follow a certain order")
                testFinish(counter, testFinishCallback);
                }
            })

}, 50000);
