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
            MockDB.operations.push('Called Begin batch');

        } else {

            MockDB.operations.push('There Batch Already in Progress!');
            throw new Error ('There Batch Already in Progress!');

        }

        // Aqui podes defidir quando das erro ou nao
        
    },

    commitBatch: (callback) => {
        console.log('Commiting Batch');
        // Aqui podes variar o timeout e decidir quando retorna erro ou nao
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

const beginTransaction = function (db, tableName, force, callback){
    
    if(!callback){
        callback = force;
        force = false;
    }

    

    const commitBatch = function (tableName, force, callback){
    
        return db.commitBatch(tableName, force, callback);

    }
    
    const dbAction = function(db, tableName, force, callback){

        console.log(db);

        try{
            setTimeout(() => beginBatch(tableName) ,Math.round(Math.random()* 1000));
        } catch (e){
            console.log(e);
            return db.schedule(() => dbAction(db, tableName, force, callback));
        }

        console.log("Performing actions on ", tableName);

        setTimeout(() => commitBatch(tableName, force, () =>{

            callback();

        }), Math.round(Math.random()* 1000))
    }

    dbAction(db, tableName, force, callback)

} 

const startTransaction = function(mockDB, dbLock, tableName, timeout, callback){

    const beginBatch = function (tableName){
        return dbLock.beginBatch(tableName);
    }

    const dbAction = function(mockDB, dbLock, tableName, timeout, callback){

        try{
            if(timeout === 0){
                beginBatch(tableName);
                mockDB.currentTable.push(tableName);
                callback()
            }

            if(timeout !== 0)    
                setTimeout(() =>{ 
                    mockDB.currentTable.push(tableName);
                    beginBatch(tableName);
                    callback()
                }, timeout);

        } catch (e){
            console.log(e);
            MockDB.currentTable.pop();
            return dbLock.schedule(() => dbAction(mockDB, dbLock, tableName, timeout, callback));
        }
    }

    dbAction(mockDB, dbLock, tableName, timeout, callback)


}

const testFinish = function(counter , func) {

    if(counter === 0)
        func()

}






assert.callback("DB Lock test", (testFinishCallback) => {
   
            let db = MockDB;

            const dbLock = new DBLock(db, 1000);
            
            let tableNames = ['Status', 'Status', 'Status', 'AnotherStatus', 'AnotherStatus']

            let counter = 2;

            startTransaction(db , dbLock,tableNames[0],0,(err)=>{
                console.log(db.operations)

                setTimeout(() => {
                    counter--;
                    testFinish(counter, testFinishCallback)
                }, 3000);
                

            })

            startTransaction(db , dbLock,tableNames[1],100,(err)=>{
                console.log(db.operations)
         

                setTimeout(() => {
                    counter--;
                    testFinish(counter, testFinishCallback)
                }, 3000);
                

            })

            


                       
             
}, 10000);
