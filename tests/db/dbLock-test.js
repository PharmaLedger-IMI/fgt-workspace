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
            MockDB.operations.push('Called Begin batch db');

        } else {

            MockDB.operations.push('There Batch Already in Progress!');
            throw new Error ('There Batch Already in Progress!');

        }

        // Aqui podes defidir quando das erro ou nao
        
    },

    commitBatch: (callback) => {
        console.log('Commiting Batch');
        MockDB.operations.push('Commiting Batch db')
        MockDB.batchInProgress = 0;
        MockDB.currentTable = [];
        
        setTimeout(() => {
            callback()
        }, this.interval);
    },

    cancelBatch: (callback) => {
        // Aqui podes variar o timeout e decidir quando retorna erro ou nao
        setTimeout(() => {
            callback()
        }, this.interval);
    }
}


const dataBaseAPI = require("opendsu").loadApi('db');
const keySSIApis = require('opendsu').loadApi('keyssi');


const {DB} = require('../../fgt-dsu-wizard/constants');
const {Product} = require('../../fgt-dsu-wizard/model');

const {DBLock} = require('../../pdm-dsu-toolkit/managers');
const { table } = require('console');
const { isGeneratorFunction } = require('util/types');

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
            MockDB.operations.push('Called Begin batch dbLock'); 
        } catch (e){
            console.log(e);
            MockDB.currentTable.pop();
            return dbLock.schedule(() => dbAction(mockDB, dbLock, tableName, timeout, callback));
        }

        callback()
    }

    dbAction(mockDB, dbLock, tableName, callback)


}

const operationsTransaction = function(callback){
    MockDB.operations.push('Performing action on table');
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






assert.callback("DB Lock test", (testFinishCallback) => {
   
            let db = MockDB;

            const dbLock = new DBLock(db, 1000);
            
            let tableNames = ['Status', 'AnotherStatus']

            let counter = 2;

            startTransaction(db , dbLock, tableNames[0], (err) => {
                console.log(db.operations);

                operationsTransaction(err => {
                    console.log(db.operations);

                    finishTransaction(dbLock,(err) =>{
                        console.log(db.operations);

                        setTimeout(() => {
                            counter--;
                            testFinish(counter, testFinishCallback)
                        }, 3000);

                    })
                })
            })

            

            

            


                       
             
}, 50000);
