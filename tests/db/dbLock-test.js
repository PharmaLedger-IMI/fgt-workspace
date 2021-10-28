
const path = require('path');

require(path.join('../../privatesky/psknode/bundles', 'testsRuntime.js'));     // test runtime
require(path.join('../../privatesky/psknode/bundles', 'pskruntime.js'));

const dc = require("double-check");
const assert = dc.assert;

const utils = require('../test-utils');



const MockDB = {
    interval: 500,
    batchInProgress: 0,
    currentTable: [],
    operations: [],

    beginBatch: () => {
        if(MockDB.batchInProgress === 0){
            MockDB.batchInProgress = 1;
            MockDB.operations.push(`Called Begin batch on db ${MockDB.currentTable[0]}`);
        } else {
            MockDB.operations.push('Batch Already in Progress!');
            throw new Error ('Batch Already in Progress!');
        }
    },

    commitBatch: (callback) => {
        setTimeout(() => {
            if(!(MockDB.batchInProgress > 0) && !MockDB.currentTable){
                MockDB.operations.push('Error commiting no batch initiated');
                return callback('No batch to commit');
            }

            console.log('Commiting Batch');
            MockDB.operations.push(`Commiting Batch on db ${MockDB.currentTable[0]}`);
            MockDB.batchInProgress = 0;
            MockDB.currentTable = [];
            callback(undefined);
        }, MockDB.interval);
    },

    cancelBatch: (callback) => {
        setTimeout(() => {
            if(!(MockDB.batchInProgress > 0) && !MockDB.currentTable){
                MockDB.operations.push('Cancel batch failed no batch in progress');
                return callback('Error canceling batch');
            }

            console.log('Cancel Batch');
            MockDB.operations.push(`Cancel Batch on db ${MockDB.currentTable[0]}`);
            MockDB.batchInProgress = 0;
            MockDB.currentTable = [];
            callback(undefined);
        }, MockDB.interval);
    }
}

const {DBLock} = require('../../pdm-dsu-toolkit/managers');


/*DB Methos*/

const beginTransaction = function(reference, operations, dbLock, tableName, callback){

    const beginBatch = function(reference, operations, dbLock, tableName){
        operations.push(`${reference}.1: db lock`);
        return dbLock.beginBatch(tableName);
    }

    const dbAction = function (reference, operations, dbLock, tableName, callback){

        try{
            beginBatch(reference, operations, dbLock, tableName);
            operations.push(`${reference}.1: ${tableName}: ${dbLock._cache[tableName]}`);
            MockDB.currentTable.push(tableName);
        }catch(e){
            console.log(e);
            operations.push(`${reference}.1: ${tableName}: schedule`);
            return dbLock.schedule(() => dbAction(reference, operations, dbLock, tableName, callback)); 
        }

        callback(undefined);

    }

    dbAction(reference, operations, dbLock, tableName, callback);
}

const dbOperation = function(reference, operations, pass, tableName,callback){

    operations.push(pass ? `${reference}.2: ${tableName}`: `${reference}.2: ${tableName}: Error`);

    setTimeout(() => {  
            callback(pass ? undefined: 'Error in Operation');     
    },100);
}

const finishTransaction = function(reference, operations, dbLock, tableName, force, callback){

    if(!callback){
        callback = force;
        force = false;
    }

    const commitBatch = function(reference, operations, dbLock, tableName, callback){
        operations.push(`${reference}.3: db lock`);
        return dbLock.commitBatch(tableName, callback)
    }

    const dbAction = function (reference, operations, dbLock, tableName, force, callback){

        commitBatch(reference, operations, dbLock, tableName, (err) => {
            if(err) {
                operations.push(`${reference}.3: db lock: Error`)
                return callback(err);
            }

            operations.push(`${reference}.3: ${tableName}`)
            callback(undefined);
        });
    }

    dbAction(reference, operations, dbLock, tableName, force, callback);

}

const singleTransaction = function (operations, expectedOperations, reference, dbLock, tableName, callback){

    let pass = true; // Later on refactor single transaction to receive this argument
    
    operations.push(`${reference}.1`);
    expectedOperations.push(`${reference}.1`);

    if(!dbLock._cache[tableName] && !MockDB.beginTransaction){
    expectedOperations.push(`${reference}.1: db lock`);
    expectedOperations.push(`${reference}.1: ${tableName}: 1`);
    }

    if(dbLock._cache[tableName] > 0 && !!MockDB.beginTransaction && MockDB.currentTable[0] === tableName){
    expectedOperations.push(`${reference}.1: db lock`);
    expectedOperations.push(`${reference}.1: ${tableName}: ${(dbLock._cache[tableName] + 1)}`);
    }

    if(!!MockDB.beginTransaction && MockDB.currentTable[0] !== tableName){
        expectedOperations.push(`${reference}.1: db lock`);
        expectedOperations.push(`${reference}.1: ${tableName}: schedule`);
    }
    
    beginTransaction(reference, operations, dbLock, tableName,(err) => {
        assert.false(err, 'Start Transaction: Single Transaction cannot generate errors!'); // Cancel batch

        operations.push(`${reference}.2`);
        expectedOperations.push(`${reference}.2`);
        
        expectedOperations.push(pass ? `${reference}.2: ${tableName}` : `${reference}.2: ${tableName}: Error`);

        dbOperation(reference, operations, pass, tableName, (err) => {
            assert.false(err, 'DB Operation: Single Transaction cannot generate errors!'); // cancel Batch

            operations.push(`${reference}.3`);
            expectedOperations.push(`${reference}.3`);

            console.log(MockDB.batchInProgress)
            console.log(tableName + '/' + MockDB.currentTable[0])
            console.log(dbLock._cache[tableName])

            if(MockDB.batchInProgress === 1 && MockDB.currentTable[0] === tableName && dbLock._cache[tableName] > 0){
                expectedOperations.push(`${reference}.3: db lock`);
                expectedOperations.push(`${reference}.3: ${tableName}`);
            }
            
            finishTransaction(reference, operations, dbLock, tableName,(err) => {
                assert.false(err, 'Finish Transaction: Single Transaction cannot generate errors!'); // Cancel Batch

                callback();
            })
        })
    })
}

//utils

const testFinish = function(counter , func) {

    if(counter === 0){
        func()
    }

}



const cancelTransaction = function(err, dbLock, tableName, callback){
    if(err)
        return dbLock.cancelBatch(tableName, (err2) =>{
            callback(err);
        })

    callback(undefined);
}

/*DB Lock Tests*/

const testSingleTransactionBySteps = function(reference, dbLock, tableName, callback){

    console.log('Test Single Transaction start ...')

    let operations = [];
    let expectedOperations = [];

    operations.push(`${reference}.1`);
    expectedOperations.push(`${reference}.1`);
    beginTransaction(reference, operations, dbLock, tableName,(err) => {
        expectedOperations.push(`${reference}.1: db lock`);
        expectedOperations.push(`${reference}.1: ${tableName}: 1`);

        assert.false(err,'Begin Transaction: Single Transaction cannot generate errors!');
        assert.true(utils.isEqual(operations, expectedOperations), 'Begin Transaction didnt work as expected!!');

        operations.push(`${reference}.2`);
        expectedOperations.push(`${reference}.2`);
        dbOperation(reference, operations, true, tableName, (err) => {           
            expectedOperations.push(`${reference}.2: ${tableName}`);

            assert.false(err,'DB Operation: Single Transaction cannot generate errors!');
            assert.true(utils.isEqual(operations, expectedOperations), 'DB Operation didnt work as expected!!');

            operations.push(`${reference}.3`);
            expectedOperations.push(`${reference}.3`);
            finishTransaction(reference, operations, dbLock, tableName,(err) => {
                
                expectedOperations.push(`${reference}.3: db lock`);
                expectedOperations.push(`${reference}.3: ${tableName}`);

                assert.false(err,'Finish Transaction: Single Transaction cannot generate errors!');
                assert.true(utils.isEqual(operations, expectedOperations), 'Finish Transaction didnt work as expected!!');

                console.log('Test Single Transaction complete!');
                callback();
            })
        })
    })
}
//incomplete
const testBeginBatch = function(references, dbLock, tableNames, callback){

    let operations = [];
    let expectedOperations = [];

    console.log('Test Begin Batch start ...')

    operations.push(`${references[0]}.1`);
    expectedOperations.push(`${references[0]}.1`);
    beginTransaction(references[0], operations, dbLock, tableNames[0], (err) => {
        if(err)
            assert.false(err, 'Begin Transaction 1: Test Begin Batch cannot generate errors!');

        expectedOperations.push(`${references[0]}.1: db lock`);
        expectedOperations.push(`${references[0]}.1: ${tableNames[0]}: 1`);

        assert.false(err,'Begin Transaction 1: Test Begin Batch cannot generate errors!');
        assert.true(utils.isEqual(operations, expectedOperations), 'Begin Transaction didnt work as expected!!');

        operations.push(`${references[1]}.1`);
        expectedOperations.push(`${references[1]}.1`);
        beginTransaction(references[1], operations, dbLock, tableNames[0], (err) => {
            if(err)
                assert.false(err, 'Begin Transaction 2: Test Begin Batch cannot generate errors!');

            expectedOperations.push(`${references[1]}.1: db lock`);
            expectedOperations.push(`${references[1]}.1: ${tableNames[0]}: 2`);

            assert.false(err,'Begin Transaction 2: Test Begin Batch cannot generate errors!');
            assert.true(utils.isEqual(operations, expectedOperations), 'Begin Transaction didnt work as expected!!');

            operations.push(`${references[2]}.1`);
            expectedOperations.push(`${references[2]}.1`);
            // beginTransaction(references[2], operations, dbLock, tableNames[1], (err) => {
            //     if(err)
            //         assert.false(err, 'Begin Transaction 3: Test Begin Batch cannot generate errors!');

            //     expectedOperations.push(`${references[2]}.1: db lock`);
            //     expectedOperations.push(`${references[2]}.1: ${tableNames[1]}: schedule`);

            //     assert.false(err,'Begin Transaction 3: Test Begin Batch cannot generate errors!');
            //     assert.true(utils.isEqual(operations, expectedOperations), 'Begin Transaction didnt work as expected!!');

                callback(undefined);

            // })
        })
    })
}

/*DB Lock Chain Tests*/

const testMultipleAsyncTransactions = function(references, dbLock, tableNames, callback){

    let counter = 0;
    let operations = [];
    let expectedOperations = [];

    const compareOperations = function (operations, expectedOperations){

        assert.true(utils.isEqual(operations, expectedOperations));

    }
    
    counter++;
    setTimeout(() => {
        singleTransaction (operations, expectedOperations, references[0], dbLock,tableNames[0], (err) => {
            counter--;
            console.log(operations);
            console.log(expectedOperations)
            compareOperations(operations,expectedOperations);
            testFinish(counter, callback);
        })
    },0);

    counter++;
    setTimeout(() => {
        singleTransaction (operations, expectedOperations, references[1], dbLock,tableNames[0], (err) => {
            counter--;
            console.log(operations);
            console.log(expectedOperations)
            testFinish(counter, callback);
        })
    },10);

    counter++;
    setTimeout(() => {
        singleTransaction (operations, expectedOperations, references[2], dbLock,tableNames[0], (err) => {
            counter--;
            console.log(operations);
            console.log(expectedOperations)
            testFinish(counter, callback);
        })
    },40);

    counter++;
    setTimeout(() => {
        singleTransaction (operations, expectedOperations, references[3], dbLock,tableNames[1], (err) => {
            counter--;
            console.log(operations);
            console.log(expectedOperations)
            testFinish(counter, callback);
        })
    },20);

    counter++;
    setTimeout(() => {
        singleTransaction (operations, expectedOperations, references[4], dbLock,tableNames[1], (err) => {
            counter--;
            console.log(operations);
            console.log(expectedOperations)
            testFinish(counter, callback);
        })
    },30);


}

const singleTests = function(references, dbLock, tableNames, callback){

    testSingleTransactionBySteps(references[0], dbLock, tableNames[0], (err) => {
        if(err)
            assert.false(err, 'Test Single Transaction Failed');

        console.log('Test Single Transaction Passed');

        // testBeginBatch(references, dbLock, tableNames, (err) => {
        //     if(err)
        //         assert.false(err, 'Test Begin Batch Failed');

            // console.log('Test Begin Batch Passed');
            callback(undefined);
        // })
    });
}

assert.callback("DB Lock test", (testFinishCallback) => {
   
            let db = MockDB;

            const dbLock = new DBLock(db, 1000);
            
            let tableNames = ['Status', 'AnotherStatus']

            let references = [1,2,3,4,5,6,7,8,9,10];

            singleTests(references, dbLock, tableNames,(err) => {
                assert.false(err);
                
                testMultipleAsyncTransactions(references, dbLock, tableNames, (err) => {
                        assert.false(err);
                    testFinishCallback()
                })
                
            })


         

}, 100000);
