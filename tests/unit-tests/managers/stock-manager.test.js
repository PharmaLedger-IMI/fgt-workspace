//process.exit(0); // Uncommnent to skip test ...

/*Test Setup*/
process.env.NO_LOGS = true; // Prevents from recording logs. 
process.env.PSK_CONFIG_LOCATION = process.cwd();

const myTimeout = 250000;


/*General Dependencies*/
const path = require('path');

const test_bundles_path = path.join('../../../privatesky/psknode/bundles', 'testsRuntime.js');
require(test_bundles_path);
const {argParser} = require('../../../bin/environment/utils');

const {getCredentials, APPS} = require('../../../bin/environment/credentials/credentials3')

const {getMockParticipantManager} = require('../../getMockParticipant');

const dc = require("double-check");
const assert = dc.assert;
const tir = require("../../../privatesky/psknode/tests/util/tir");

let domain = 'traceability';
let testName = 'IndividualProductManagerTest' // no spaces please. its used as a folder name

const Utils = require('../../../pdm-dsu-toolkit/model/Utils');
const utils = require('../../../fgt-dsu-wizard/model/utils');

/*Specific Dependencies*/

const { getStockManager } = require('../../../fgt-dsu-wizard/managers');
const { Product , Stock, Batch } = require('../../../fgt-dsu-wizard/model');
const { AssertionError } = require('assert');


/*Fake Server Config*/

const DOMAIN_CONFIG = {
    anchoring: {
        type: "FS",
        option: {
            enableBricksLedger: false,
        },
        commands: {
            addAnchor: "anchor",
        },
    },
    enable: ["mq"],
};

const getBDNSConfig = function(folder){
    return {
        maxTries: 10,
        storageFolder: folder,
        domains: [
            {
                name: domain,
                config: DOMAIN_CONFIG,
            },
            {
                name: 'vault',
                config: DOMAIN_CONFIG,
            },
        ],
    }
}

const defaultOps = {
    timeout: myTimeout,
    fakeServer: true,
    useCallback: true
}

const TEST_CONF = argParser(defaultOps, process.argv);

/*Utilities*/ 
const updateStocks = function(list , callback){

    for(let i = 0; i < list.length; i++){

        list[i].name = utils.generateProductName();
        list[i].description = 'Description was changed!';
        list[i].batches.push(getBatch(30));
    }

    callback(undefined,list);

}

const getStock = function(batches){
    
    return new Stock({

            name: utils.generateProductName() ,
            gtin: utils.generateGtin(),
            manufName:  utils.generateProductName(),
            description: utils.generateProductName() + utils.generateProductName() + utils.generateProductName(),
            batches: batches,
            status: undefined,
                    
    }); 

}

const getBatch = function(quantity){
    let serials = [];

    for(let i = 0; i < quantity; i++){

        serials.push(Utils.generateSerialNumber());

    }

    return new Batch({
        batchNumber: utils.generateBatchNumber(),
        serialNumber: Utils.generateSerialNumber(),
        expiry: utils.genDate(100),
        quantity: quantity,
        serialNumbers: serials,
    });


}

const getBatches = function(numOfBatches){

    let batches = [];
    numOfBatches = 1;

    for(let i = 0; i < numOfBatches; i++){

            batches.push(getBatch(Math.ceil(Math.random()*100)));
    
    }

    return batches;
}

const populateStocks = function(numOfStocks, list){

    for(let i = 0; i < numOfStocks; i++){

            list.push(getStock(getBatches(Math.ceil(Math.random()* 100))));

    }
}

/**
 * @param itemOne // represents first item
 * @param ItemTwo  // represents second item
 * @param {function(err, product, record)} callback
 */

const compareItems = function(itemOne, itemTwo, callback){

    assert.true(utils.isEqual(itemOne.name,itemTwo.name), 'Names dont match!');
    assert.true(utils.isEqual(itemOne.gtin,itemTwo.gtin), 'Gtins dont match!');
    assert.true(utils.isEqual(itemOne.manufName,itemTwo.manufName), 'Manufactor Names dont match!');
    assert.true(utils.isEqual(itemOne.description,itemTwo.description), 'Description dont match!');
    assert.true(utils.isEqual(itemOne.batches,itemTwo.batches), 'Batches dont match!');

    callback(undefined);
}

/***
 * 
 * @param manager
 * @param productList
 * @param test
 * @param accumulator
 * @param callback
 * @returns {*}
 */


const testIterator = function(manager, test, itemList, accumulator,...args){
    const callback = args.length > 0? args.pop(): accumulator;
    const list = args.pop();

    if(callback === accumulator){
        accumulator = [];
    }

    const item = itemList.shift();

    if(!item){
        return callback(undefined,accumulator); 
    }

    accumulator.push(item);

    if(!!list){
        const itemTwo = list.shift();

        test(item , itemTwo ,(err, result) => {
            if(err)
                return callback(err);

            testIterator(manager, test, itemList, accumulator, list, callback);
        })
    }
    if(!list){
        test(manager , item ,(err, result) => {
            if(err)
                return callback(err);

            testIterator(manager, test, itemList, accumulator, callback);

        })
    }

}

// /*Tests*/

/**
 * @param manager // represents the manager being tested
 * @param item // represents the item you want to create
 * @param {function(err, product, record)} callback
 */

 const testCreate = function(manager , item, callback){

    const run = function(callback){
        manager.create(item, (err , stock, path) => {
            if(err)
                return callback(err);

            callback(undefined, item, stock, path);
                
        })
    }                   

    const testAll = function(item, stock, path, callback){
        
        const testCreateBasic = function(){

            assert.notNull(stock, 'Stock is null!');
            assert.notNull(path, 'Path is null!');
            assert.true(utils.isEqual(stock,item), 'Stocks are not equal');

            callback(undefined , stock);

        }();

        

          
    };

    run((err, ...args) => {
        if(err)
            return callback(err);
        
        testAll(...args, callback);
    });

}


/**
 * @param manager // represents the manager being tested
 * @param item // represents the item you want to get
 * @param {function(err, product, record)} callback
 */

 const testGetOne = function(manager, item, callback){
    const key = item.gtin;

    const run = function(callback){
        manager.getOne(key, true, (err, stock) => {
            if(err)
                return callback(err);

            manager.getOne(key, false, (err, record) => {
                if(err)
                    return callback(err);         

                callback(undefined, stock, record);

            })
            
        });
    };

    const testAll = function(stock, record, callback){
        
        const testProductEquality = function (){
            assert.true(utils.isEqual(stock.name,item.name), 'Names dont match!');
            assert.true(utils.isEqual(stock.gtin,item.gtin), 'Gtins dont match!');
            assert.true(utils.isEqual(stock.manufName,item.manufName), 'Manufactor Names dont match!');
            assert.true(utils.isEqual(stock.description,item.description), 'Description dont match!');
            assert.true(utils.isEqual(stock.batches,item.batches), 'Batches dont match!');
        }();

        const testObtainedRecord = function (){
            assert.true(!!record, 'Failed to get the record!');
        }();

        callback(undefined);

    };

    run((err, ...args) => {
        if(err)
            return callback(err);
        
        testAll(...args, callback);
    });
};

/**
 * @param manager // represents the manager being tested
 * @param readDSU // represents a boolean
 * @param list // represents list to compare to get all
 * @param {function(err, product, record)} callback
 */

const testGetAll = function(manager, readDSU, list, callback){
    let options = {
                query:['gtin > 0'],
                sort: "asc",
                limit: undefined,
            }

    const run = function(callback){
        manager.getAll(readDSU,options,(err, results) =>{
            if(err)
                return callback(err);


            callback(undefined,results);
        })
    };

    const testAll = function(results, callback){
        
        const testResults = function (){
            assert.true(list.length === results.length);
            const filteredResults = list.filter((item) => item.gtin <= 55289538478425).sort((a,b) => {
            if(a.gtin < b.gtin){
                return -1;
            }
            if(a.gtin > b.gtin){
                return 1;
            }
            if(a.gtin === b.gtin){
                return 0;
            }
            });
           
            testIterator(manager, compareItems ,filteredResults , [], results, (err, results) => {
                if(err)
                    return  callback(err);

                callback(undefined, results);

            })
            
        }();
    };

    run((err, ...args) => {
        if(err)
            return callback(err);
        
        testAll(...args, callback);
    });
}

/**
 * @param manager // represents the manager being tested
 * @param itemList // represents the item list you want to get
 * @param {function(err, product, record)} callback
 * 
 */

 const testGetAllWithQueries = function(manager, itemList, callback){
    const readDSU = true;

    let options = {
        query:['name == '+ itemList[0].name],
        sort: "asc",
        limit: undefined,
    }

    const run = function(callback){

        manager.getAll(readDSU, options, (err, resultsQueryOne) => {
            if(err)
                return callback(err);
                
            const filteredResultsOne = itemList.filter((item) => itemList[0].name === item.name);

            options.query = ['gtin <= 55289538478425'];

            manager.getAll(readDSU, options, (err, resultsQueryTwo) => {

            
                const filteredResultsTwo = itemList.filter((item) => item.gtin <= 55289538478425).sort((a,b) => {
                    if(a.gtin < b.gtin){
                        return -1;
                    }
                    if(a.gtin > b.gtin){
                        return 1;
                    }
                    if(a.gtin === b.gtin){
                        return 0;
                    }

                });

                console.log(resultsQueryTwo);
                console.log(filteredResultsTwo);


                callback(undefined, resultsQueryOne, filteredResultsOne, resultsQueryTwo, filteredResultsTwo);
            })
          
        })      
    };

    const testAll = function(resultsQueryOne, filteredResultsOne, resultsQueryTwo, filteredResultsTwo, callback){
        
        const testItemRemoved = function (){
           
            testIterator(manager, compareItems,resultsQueryOne,[],filteredResultsOne, (err) => {
                if(err)
                    return callback(err);

                testIterator(manager, compareItems, resultsQueryTwo,[],filteredResultsTwo, (err) => {
                    if(err)
                        return callback(err);
                        
                    callback(undefined,'complete');
                })


            })

           

        }();

        

    };

    run((err, ...args) => {
        if(err)
            return callback(err);
        
        testAll(...args, callback);
    });
};

/**
 * @param manager // represents the manager being tested
 * @param item // represents the item you want to get
 * @param {function(err, product, record)} callback
 */

 const testRemove = function(manager, item, callback){
    const key = item.gtin;

    const run = function(callback){

        manager.remove(key, (err) => {
            if(err)
                return callback(err);
            
            callback(undefined, key);
        })
        
    };

    const testAll = function(key, callback){
        
        const testItemRemoved = function (){
            manager.getOne(key, true, (err, product) => {
                if(!err)
                    return callback(err);
                
                assert.true(!product, 'Product should be undefined');
                
                callback(undefined,product);
            });       
        }();
    };

    run((err, ...args) => {
        if(err)
            return callback(err);
        
        testAll(...args, callback);
    });
};

/**
 * @param manager // represents the manager being tested
 * @param item // represents the item list you want to get
 * @param {function(err, product, record)} callback
 * 
 */
const testUpdate = function (manager, item, callback){
    const key = item.gtin;

    const newItem = item;

    newItem.name = utils.generateProductName();
    newItem.description = 'Description was changed!';
    newItem.batches.push(getBatch(30));

    const run = function(callback){
        manager.update(key, newItem, (err, updatedItem) => {
            if(err)
                return callback(err);

            manager.getOne(key, true, (err, newStock) => {
                if(err)
                    return callback(err);         

                callback(undefined, updatedItem, newStock);

            })
            
        });
    };

    const testAll = function(updatedItem, newStock, callback){
        
        const testProductEquality = function (){
            assert.true(utils.isEqual(updatedItem, newStock), 'Updated Stocks are not equal!');
            compareItems(newStock, newItem,(err) => {
                if(err)
                    return callback(err);

                callback(undefined);
            });

            
        }();

     
        

    };

    run((err, ...args) => {
        if(err)
            return callback(err);
        
        testAll(...args, callback);
    });



}

/**
 * @param manager // represents the manager being tested
 * @param list // represents list to compare to get all
 * @param {function(err, product, record)} callback
 */

 const testUpdateAll = function(manager, list, callback){

    const run = function(callback){
        manager.updateAll(list,(err, newStocks) => {
            if(err)
                return callback(err);
            
            manager.getAll(true,(err, results) => {
                if(err)
                    return callback(err);

                callback(undefined,newStocks,results);
            })
        })
    };

    const testAll = function(newStocks, results, callback){
        
        const testResults = function (){
            assert.true(list.length === results.length);
            assert.true(newStocks.length === results.length);
            // const filteredResults = list.filter((item) => item.gtin <= 55289538478425).sort((a,b) => {
            // if(a.gtin < b.gtin){
            //     return -1;
            // }
            // if(a.gtin > b.gtin){
            //     return 1;
            // }
            // if(a.gtin === b.gtin){
            //     return 0;
            // }
            // });
           
            // testIterator(manager, compareItems ,filteredResults , [], results, (err, results) => {
            //     if(err)
            //         return  callback(err);

                callback(undefined, results);

            // })
            
        }();
    };

    run((err, ...args) => {
        if(err)
            return callback(err);
        
        testAll(...args, callback);
    });
}

/*Run Tests*/

const runTest = function(callback){
    const mahCredentials = getCredentials(APPS.MAH);
    const credentials = Object.keys(mahCredentials).reduce((accum, key) => {
        if (mahCredentials[key].public)
            accum[key] = mahCredentials[key].secret;
        return accum;
    }, {})
    getMockParticipantManager(domain, credentials, (err, participantManager) => {
        if (err)
            return callback(err);

        console.log(participantManager);

        //Declare needed variables
        let stockList = [];
        let queryList = [];


        //Populate product list
        populateStocks(10,stockList);
        populateStocks(10,queryList);

        
        

        //Getting Individual Product Manager
        const manager = getStockManager(participantManager); 
        console.log(manager);

        assert.notNull(manager);

        console.log(stockList);

        testIterator(manager, testCreate, stockList,(err, list) => {
            if(err)
                return callback(err);
            
            testIterator(manager, testGetOne, list, (err, newList) => {
                if(err)
                    return callback(err);
                testGetAll(manager,true,newList,(err, results) => {
                    if(err)
                        return callback(err);

                    testIterator(manager, testUpdate, newList, (err , updatedList) => {
                        if(err)
                            return callback(err);
                        
                        testIterator(manager, testRemove, results,(err) =>{
                            if(err)
                                return callback(err);
                                
                            //Populate db for query tests
                            testIterator(manager, testCreate, queryList,(err, validatingList) => {
                                if(err)
                                    return callback(err);
                                
                                updateStocks(validatingList, (err , newUpdatedList) => {
                                    if(err)
                                        return callback(err)

                                    console.log('###################################################################');
                                    console.log(newUpdatedList);


                                    testUpdateAll(manager, newUpdatedList, (err, updatedList) => {
                                        if(err)
                                            return callback(err);
                                        
                                        testGetAllWithQueries(manager, updatedList, (err, message) => {
                                            if(err)
                                                return callback(err);
                    
                                            console.log(message);    
                                            callback();
                                        })
                                    })
                                });   
                            })               
                        })  
                    })                                     
                })
            })
        })
    }) 
}

const testFinishCallback = function(callback){
    console.log(`Test ${testName} finished successfully`);
    if (callback)
        return callback();
    setTimeout(() => {
        process.exit(0);
    }, 1000)
}

const launchTest = function(callback){
    const testRunner = function(callback){
        runTest((err) => {
            if (err)
                throw err;
            testFinishCallback(callback);
        });
    }

    const runWithFakeServer = function(callback){
        dc.createTestFolder(testName, async (err, folder) => {
            await tir.launchConfigurableApiHubTestNodeAsync(getBDNSConfig(folder));

            if (!callback)
                assert.begin(`Running test ${testName}`, undefined, TEST_CONF.timeout);
            testRunner(callback);
        });
    }

    if (TEST_CONF.fakeServer)
        return runWithFakeServer(callback);

    if (!callback)
        assert.begin(`Running test ${testName}`, undefined, TEST_CONF.timeout);
    testRunner(callback);
}

if (!TEST_CONF.useCallback)
    return launchTest();
assert.callback(testName, (testFinished) => {
    launchTest(testFinished);
}, TEST_CONF.timeout)



