
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

    beginBatch: () => {
        if(MockDB.batchInProgress === 0){
            console.log('Begin Batch');
            MockDB.batchInProgress = 1;
        } else {
            console.log('Batch Already in Progress!');
            throw new Error ('Batch Already in Progress!');
        }
    },

    commitBatch: (callback) => {
        setTimeout(() => {
            if(!(MockDB.batchInProgress > 0) && !MockDB.currentTable){
                return callback('No batch to commit');
            }

            console.log('Commiting Batch');
            MockDB.batchInProgress = 0;
            MockDB.currentTable = [];
            callback(undefined);
        }, MockDB.interval);
    },

    cancelBatch: (callback) => {
        setTimeout(() => {
            if(!(MockDB.batchInProgress > 0))
                return callback('Error canceling batch');
            

            console.log('Cancel Batch');
            MockDB.batchInProgress = 0;
            MockDB.currentTable = [];
            callback(undefined);
        }, MockDB.interval);
    }
}

const {DBLock} = require('../../pdm-dsu-toolkit/managers');


/*DB Methos*/

const beginTransaction = function(reference, operations, expectedOperations, dbLock, tableName, callback){

    let reschedule = false;

    const beginBatch = function(reference, operations, dbLock, tableName){
        operations.push(`${reference}.1: db lock`);
        return dbLock.beginBatch(tableName);
    }

    const dbAction = function (reference, operations, expectedOperations, dbLock, tableName, reschedule, callback){
        if(reschedule) 
            expectedOperations.push(`${reference}.1: db lock`);

        if(reschedule && !MockDB.batchInProgress)
            expectedOperations.push(`${reference}.1: ${tableName}: 1`);

        if(reschedule && MockDB.batchInProgress && MockDB.currentTable[0] === tableName)
            expectedOperations.push(`${reference}.1: ${tableName}: ${(dbLock._cache[tableName]+1)}`);
        
        if(reschedule && MockDB.batchInProgress && MockDB.currentTable[0] !== tableName)
            expectedOperations.push(`${reference}.1: ${tableName}: schedule`);

        try{
            beginBatch(reference, operations, dbLock, tableName);
            operations.push(`${reference}.1: ${tableName}: ${dbLock._cache[tableName]}`);
            MockDB.currentTable.push(tableName);
        }catch(e){
            console.log(e);
            operations.push(`${reference}.1: ${tableName}: schedule`);
            return dbLock.schedule(() => dbAction(reference, operations, expectedOperations, dbLock, tableName, true, callback)); 
        }

        callback(undefined);

    }

    dbAction(reference, operations, expectedOperations, dbLock, tableName, reschedule, callback);
}

const dbOperation = function(reference, operations, expectedOperations, pass, tableName,callback){
    
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
const cancelTransaction = function(err, reference, operations, expectedOperations, dbLock, tableName, callback){

    operations.push(`${reference}.4: db lock`);

    return dbLock.cancelBatch(tableName, (err2) =>{          
        expectedOperations.push(err2 ? `${reference}.4: ${tableName}: Cancel Error`:`${reference}.4: ${tableName}: Cancel Sucess`);
        operations.push(err2 ? `${reference}.4: ${tableName}: Cancel Error`:`${reference}.4: ${tableName}: Cancel Sucess`);
        
        callback(err2 ? `Could not cancelBatch over error:` : err);
    });
}

const singleTransaction = function (operations, expectedOperations, reference, dbLock, tableName, callback){

    let pass = true; // Later on refactor single transaction to receive this argument
    
    operations.push(`${reference}.1`);
    expectedOperations.push(`${reference}.1`);

    if(!dbLock._cache[tableName] && !MockDB.batchInProgress){
    expectedOperations.push(`${reference}.1: db lock`);
    expectedOperations.push(`${reference}.1: ${tableName}: 1`);
    }

    if(dbLock._cache[tableName] > 0 && !!MockDB.batchInProgress && MockDB.currentTable[0] === tableName){
    expectedOperations.push(`${reference}.1: db lock`);
    expectedOperations.push(`${reference}.1: ${tableName}: ${(dbLock._cache[tableName] + 1)}`);
    }

    if(!!MockDB.batchInProgress && MockDB.currentTable[0] !== tableName){
        expectedOperations.push(`${reference}.1: db lock`);
        expectedOperations.push(`${reference}.1: ${tableName}: schedule`);
    }
    
    beginTransaction(reference, operations, expectedOperations, dbLock, tableName,(err) => {
        assert.false(err, 'Start Transaction: Single Transaction cannot generate errors!'); // Cancel batch

        operations.push(`${reference}.2`);
        expectedOperations.push(`${reference}.2`);
        
        expectedOperations.push(pass ? `${reference}.2: ${tableName}` : `${reference}.2: ${tableName}: Error`);

        dbOperation(reference, operations, expectedOperations, pass, tableName, (err) => {
            if(err){
                expectedOperations.push(`${reference}.4: db lock`);
                cancelTransaction(err, reference, operations, expectedOperations, dbLock, tableName,callback);
            }

            operations.push(`${reference}.3`);
            expectedOperations.push(`${reference}.3`);

            if(MockDB.batchInProgress === 1 && MockDB.currentTable[0] === tableName && dbLock._cache[tableName] > 0){
                expectedOperations.push(`${reference}.3: db lock`);
                expectedOperations.push(`${reference}.3: ${tableName}`);
            }
            
            finishTransaction(reference, operations, dbLock, tableName,(err) => {
                if(err){
                    expectedOperations.push(`${reference}.4: db lock`);
                    cancelTransaction(err, reference, operations, expectedOperations, dbLock, tableName,callback);
                }

                callback(undefined);
            })
        })
    })
}

const resetDB = function(dbLock, callback){

    MockDB.batchInProgress = 0;
    MockDB.currentTable = [];
    
    dbLock = new DBLock(MockDB, 1000);

    callback(dbLock);

}

//utils

const testFinish = function(counter, operations, expectedOperations , func) {

    if(counter === 0){
        func(undefined, operations,expectedOperations);
    }

}

/*DB Lock Tests*/

const testSingleTransactionBySteps = function(reference, dbLock, tableName, callback){

    console.log('Test Single Transaction start ...')

    let operations = [];
    let expectedOperations = [];
    let pass = true; // refactor later

    operations.push(`${reference}.1`);
    expectedOperations.push(`${reference}.1`);
    beginTransaction(reference, operations, expectedOperations, dbLock, tableName,(err) => {
        expectedOperations.push(`${reference}.1: db lock`);
        expectedOperations.push(`${reference}.1: ${tableName}: 1`);

        assert.false(err,'Begin Transaction: Single Transaction cannot generate errors!');
        assert.true(utils.isEqual(operations, expectedOperations), 'Begin Transaction didnt work as expected!!');

        operations.push(`${reference}.2`);
        expectedOperations.push(`${reference}.2`);

        expectedOperations.push(pass ? `${reference}.2: ${tableName}` : `${reference}.2: ${tableName}: Error`);
        dbOperation(reference, operations, expectedOperations, pass, tableName, (err) => {           

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
    beginTransaction(references[0], operations,expectedOperations, dbLock, tableNames[0], (err) => {
        assert.false(err, 'Begin Transaction 1: Test Begin Batch cannot generate errors!');

        expectedOperations.push(`${references[0]}.1: db lock`);
        expectedOperations.push(`${references[0]}.1: ${tableNames[0]}: 1`);

        assert.true(utils.isEqual(operations, expectedOperations), 'Begin Transaction didnt work as expected!!');

        operations.push(`${references[1]}.1`);
        expectedOperations.push(`${references[1]}.1`);
        beginTransaction(references[1], operations, expectedOperations, dbLock, tableNames[0], (err) => {
            assert.false(err, 'Begin Transaction 2: Test Begin Batch cannot generate errors!');

            expectedOperations.push(`${references[1]}.1: db lock`);
            expectedOperations.push(`${references[1]}.1: ${tableNames[0]}: 2`);

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
                resetDB(dbLock, (dbLock) => {
                    assert.true(dbLock, 'DB didnt reset');

                    callback(undefined);


                });

            // })
        })
    })
}

/*DB Lock Chain Tests*/

const testMultipleTransactions = function(references, dbLock, tableNames, callback){

    let counter = 0;
    let operations = [];
    let expectedOperations = [];
    
    counter++;
    setTimeout(() => {
        singleTransaction (operations, expectedOperations, references[0], dbLock,tableNames[0], (err) => {
            counter--;
            testFinish(counter, operations, expectedOperations, callback);
        })
    },Math.floor(Math.random()*100));

    counter++;
    setTimeout(() => {
        singleTransaction (operations, expectedOperations, references[1], dbLock,tableNames[0], (err) => {
            counter--;
            testFinish(counter, operations, expectedOperations, callback);
        })
    },Math.floor(Math.random()*100));

    counter++;
    setTimeout(() => {
        singleTransaction (operations, expectedOperations, references[2], dbLock,tableNames[0], (err) => {
            counter--;
            testFinish(counter, operations, expectedOperations, callback);
        })
    },Math.floor(Math.random()*100));

    counter++;
    setTimeout(() => {
        singleTransaction (operations, expectedOperations, references[3], dbLock,tableNames[1], (err) => {
            counter--;
            testFinish(counter, operations, expectedOperations, callback);
        })
    },Math.floor(Math.random()*100));

    counter++;
    setTimeout(() => {
        singleTransaction (operations, expectedOperations, references[4], dbLock,tableNames[1], (err) => {
            counter--;
            testFinish(counter, operations, expectedOperations, callback);
        })
    },Math.floor(Math.random()*100));


}

const testMultipleAsyncTransactions = function(references, dbLock, tableNames, callback){

    let counter = 0;
    let operations = [];
    let expectedOperations = [];
    
    counter++;
    setTimeout(() => {
        singleTransaction (operations, expectedOperations, references[0], dbLock,tableNames[0], (err) => {
            counter--;
            testFinish(counter, operations, expectedOperations, callback);
        })
    },Math.floor(Math.random()*100));

    counter++;
    setTimeout(() => {
        singleTransaction (operations, expectedOperations, references[1], dbLock,tableNames[1], (err) => {
            counter--;
            testFinish(counter, operations, expectedOperations, callback);
        })
    },Math.floor(Math.random()*100));

    counter++;
    setTimeout(() => {
        singleTransaction (operations, expectedOperations, references[2], dbLock,tableNames[2], (err) => {
            counter--;
            testFinish(counter, operations, expectedOperations, callback);
        })
    },Math.floor(Math.random()*100));

    counter++;
    setTimeout(() => {
        singleTransaction (operations, expectedOperations, references[3], dbLock,tableNames[3], (err) => {
            counter--;
            testFinish(counter, operations, expectedOperations, callback);
        })
    },Math.floor(Math.random()*100));

    counter++;
    setTimeout(() => {
        singleTransaction (operations, expectedOperations, references[4], dbLock,tableNames[4], (err) => {
            counter--;
            testFinish(counter, operations, expectedOperations, callback);
        })
    },Math.floor(Math.random()*100));

    counter++;
    setTimeout(() => {
        singleTransaction (operations, expectedOperations, references[5], dbLock,tableNames[5], (err) => {
            counter--;
            testFinish(counter, operations, expectedOperations, callback);
        })
    },Math.floor(Math.random()*100));

    counter++;
    setTimeout(() => {
        singleTransaction (operations, expectedOperations, references[6], dbLock,tableNames[6], (err) => {
            counter--;
            testFinish(counter, operations, expectedOperations, callback);
        })
    },Math.floor(Math.random()*100));

    counter++;
    setTimeout(() => {
        singleTransaction (operations, expectedOperations, references[7], dbLock,tableNames[7], (err) => {
            counter--;
            testFinish(counter, operations, expectedOperations, callback);
        })
    },Math.floor(Math.random()*100));

    counter++;
    setTimeout(() => {
        singleTransaction (operations, expectedOperations, references[8], dbLock,tableNames[8], (err) => {
            counter--;
            testFinish(counter, operations, expectedOperations, callback);
        })
    },Math.floor(Math.random()*100));

    counter++;
    setTimeout(() => {
        singleTransaction (operations, expectedOperations, references[9], dbLock,tableNames[9], (err) => {
            counter--;
            testFinish(counter, operations, expectedOperations, callback);
        })
    },Math.floor(Math.random()*100));


}

/*Grouped Tests by category*/
const multiTests = function(references, dbLock, tableNames, callback){
    
    testMultipleTransactions(references, dbLock, tableNames, (err, operations, expectedOperations) => {
        assert.false(err);
        console.log(err)
        assert.true(utils.isEqual(operations, expectedOperations))

        testMultipleAsyncTransactions(references, dbLock, tableNames,(err, operations,expectedOperations) => {
            assert.false(err);

            console.log(operations)
            console.log(expectedOperations)
            assert.true(utils.isEqual(operations, expectedOperations))

            callback();


        })
    })
}

const singleTests = function(references, dbLock, tableNames, callback){

    testSingleTransactionBySteps(references[0], dbLock, tableNames[0], (err) => {
        assert.false(err, 'Test Single Transaction Failed');

        console.log('Test Single Transaction Passed');

        // testBeginBatch(references, dbLock, tableNames, (err) => {
        //     assert.false(err, 'Test Begin Batch Failed');

            // console.log('Test Begin Batch Passed');
            callback(undefined);
        // })
    });
}

/*Full Test*/ 
const fullTest = function(references, dbLock, tableNames, callback){
    
    singleTests(references, dbLock, tableNames,(err) => {
        assert.false(err);
        
        multiTests(references, dbLock, tableNames, (err) => {
            callback()
        })
           
    })
}

assert.callback("DB Lock test", (testFinishCallback) => {
   
            let db = MockDB;

            const dbLock = new DBLock(db, 1000);
            
            let tableNames = ['Status', 'AnotherStatus', 'Gtin', 'Product', 'Individualproduct', 'Batch', 'Order', 'Wholesaler', 'MAH','Pharmacy']

            let references = [1,2,3,4,5,6,7,8,9,10];

            fullTest(references, dbLock, tableNames, () =>{

                
                testFinishCallback()

            })

            


         

}, 100000);
