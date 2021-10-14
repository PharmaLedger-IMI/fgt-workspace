//process.exit(0); // Uncomment to skip test ...

/*Test Setup*/
process.env.NO_LOGS = true; // Prevents from recording logs. 
process.env.PSK_CONFIG_LOCATION = process.cwd();

let domain = 'traceability';
let testName = 'StockManagerTest' // no spaces please. its used as a folder name (change for the unit being tested)

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

const utils = require('../../test-utils');
const Utils = require('../../../pdm-dsu-toolkit/model/Utils');

/*Specific Dependencies*/

const { getStockManager } = require('../../../fgt-dsu-wizard/managers'); //change for the manager you want to test
const {Stock, Batch } = require('../../../fgt-dsu-wizard/model');

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
    timeout: 2500000,
    fakeServer: true,
    useCallback: true
}

const TEST_CONF = argParser(defaultOps, process.argv);
/*Utils*/
/**
 * @param {Stock} stockOne
 * @param {Stock} stockTwo 
 * @param {function(err)} callback
 */

const compareStocks = function(stockOne, stockTwo, callback){

    assert.true(utils.isEqual(stockOne.name,stockTwo.name), 'Names dont match!');
    assert.true(utils.isEqual(stockOne.gtin,stockTwo.gtin), 'Gtins dont match!');
    assert.true(utils.isEqual(stockOne.manufName,stockTwo.manufName), 'Manufactor Names dont match!');
    assert.true(utils.isEqual(stockOne.description,stockTwo.description), 'Description dont match!');
    assert.true(utils.isEqual(stockOne.batches,stockTwo.batches), 'Batches dont match!');

    callback(undefined);
}


const populateStocks = function(numOfStocks){
    
    let stockList = [];

    for(let i = 0; i < numOfStocks; i++){

        stockList.push(getStock(getBatches(Math.ceil(Math.random()* 100))));
    }
    
    return stockList;    
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

// /*Tests*/

/**
 * @param {StockManager} manager 
 * @param {Stock} stock 
 * @param {function(err, Stock)} callback
 */

 const testCreate = function(manager , stock, callback){

    const run = function(callback){
        manager.create(stock, (err , createdStock, path) => {
            if(err)
                return callback(err);

            callback(undefined, stock, createdStock, path);
                
        })
    }                   

    const testAll = function(stock, createdStock, path, callback){
        
        const testCreateBasic = function(){
            assert.notNull(stock, 'Stock is null!');
            assert.notNull(path, 'Path is null!');
            assert.true(utils.isEqual(stock, createdStock), 'Stocks are not equal');

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
 * @param {StockManager} manager
 * @param {boolean} readDSU 
 * @param {Array} stockList 
 * @param {function(err, stockListFromDB)} callback
 */

 const testGetAll = function(manager, readDSU, stockList, callback){
    let options = {
                query:['gtin > 0'],
                sort: "asc",
                limit: undefined,
            }

    const run = function(callback){
        manager.getAll(readDSU, options, (err, stockListFromDB) => {
            if(err)
                return callback(err);
            
            manager.getAll(false, options,(err, recordsFromDB) => {
                if(err)
                    return callback(err);

                callback(undefined, stockListFromDB, recordsFromDB);
            }) 
        })
    };

    const testAll = function(stockListFromDB, recordsFromDB, callback){
        
        const testResults = function (){
            assert.notNull(recordsFromDB);
            assert.notNull(stockListFromDB);
            assert.true(stockListFromDB.length === stockList.length);
            assert.true(stockList.length === recordsFromDB.length);
            
            const filteredResults = stockList.filter((item) => item.gtin > 0).sort((a, b) => {
                if(a.gtin < b.gtin)
                    return -1;
                
                if(a.gtin > b.gtin)
                    return 1;
                
                if(a.gtin === b.gtin)
                    return 0;
                
            });
           
            utils.testIterator(manager, compareStocks , filteredResults, [], stockListFromDB, (err, stockListAfterCompareFromDB) => {
                if(err)
                    return  callback(err);

                callback(undefined, stockListAfterCompareFromDB);
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
 * @param {StockManager} manager 
 * @param {Stock} stock 
 * @param {function(err)} callback
 */

 const testGetOne = function(manager, stock, callback){
    const key = stock.gtin;

    const run = function(callback){
        manager.getOne(key, true, (err, stockFromDB) => {
            if(err)
                return callback(err);

            manager.getOne(key, false, (err, record) => {
                if(err)
                    return callback(err);         

                callback(undefined, stockFromDB, record);
            })     
        });
    };

    const testAll = function(stockFromDB, record, callback){
        
        const testProductEquality = function (){
            compareStocks(stock , stockFromDB, (err) => {
                if(err)
                    return callback(err);

                assert.true(!!record, 'Failed to get the record!');

                callback(undefined);
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
 * @param {StockManager} manager 
 * @param {Stock} stock 
 * @param {function(err, product, record)} callback
 */

const testUpdate = function (manager, stock, callback){
    const key = stock.gtin;
    const stockForUpdate = stock;

    stockForUpdate.name = utils.generateProductName();
    stockForUpdate.description = utils.generateProductName();
    stockForUpdate.batches.push(getBatch(30));

    const run = function(callback){
        manager.update(key, stockForUpdate, (err, updatedStock) => {
            if(err)
                return callback(err);

            manager.getOne(key, true, (err, updatedStockFromDB) => {
                if(err)
                    return callback(err);         

                callback(undefined, updatedStockFromDB, updatedStock);

            })
            
        });
    };

    const testAll = function(updatedStockFromDB, updatedStock, callback){
        
        const testProductEquality = function (){
            assert.true(utils.isEqual(updatedStockFromDB, updatedStock), 'Updated Stocks are not equal!');
            compareStocks(updatedStockFromDB, updatedStock,(err) => {
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
 * @param {StockManager} manager 
 * @param {Stock} stock 
 * @param {function(err)} callback
 */

 const testRemove = function(manager, stock, callback){
    const key = stock.gtin;

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
                    return callback('Stock should be deleted!');
                
                assert.true(!product, 'Product should be undefined');
                
                callback(undefined);
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
 * @param {StockManager} manager 
 * @param {Array} stockList // represents the item list you want to get
 * @param {function(err)} callback
 * 
 */

 const testGetAllWithQueries = function(manager, stockList, callback){
    const readDSU = true;

    let options = {
        query:['name == '+ stockList[0].name],
        sort: "asc",
        limit: undefined,
    }

    const run = function(callback){

        manager.getAll(readDSU, options, (err, resultsQueryOne) => {
            if(err)
                return callback(err);
                
            const filteredResultsOne = stockList.filter((item) => stockList[0].name === item.name);

            options.query = ['gtin <= 55289538478425'];

            manager.getAll(readDSU, options, (err, resultsQueryTwo) => {
                if(err)
                    callback(err);
            
                const filteredResultsTwo = stockList.filter((item) => item.gtin <= 55289538478425).sort((a,b) => {
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
           
            utils.testIterator(manager, compareStocks,resultsQueryOne,[],filteredResultsOne, (err) => {
                if(err)
                    return callback(err);

                utils.testIterator(manager, compareStocks, resultsQueryTwo,[],filteredResultsTwo, (err) => {
                    if(err)
                        return callback(err);
                        
                    callback(undefined);
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


/*Chained Tests*/

/**
 * @param {StockManager} manager 
 * @param {Array} stockList 
 * @param {function(err)} callback
 */

const testOneFullCycle = function(manager, stockList, callback){
    utils.testIterator(manager, testCreate, stockList,(err, createdStockList) => {
        if(err)
            return callback(err);
        
        testGetAll(manager, true, createdStockList, (err, stockListFromDB) => {
            if(err)
                return callback(err);

            utils.testIterator(manager, testGetOne, stockListFromDB, (err, stockList) => {
                if(err)
                    return callback(err);
                
                utils.testIterator(manager, testUpdate, stockList, (err, updatedStockListFromDB) => {
                    if(err)
                        callback(err);
                    
                    utils.testIterator(manager, testRemove, updatedStockListFromDB, (err, results) => {
                        if(err)
                            return callback(err)

                        callback(undefined);
                    })
                })     
            })  
        })  
    })
}

/**
 * @param {StockManager} manager 
 * @param {Array} stockList 
 * @param {function(err)} callback
 */

const testAllCycle = function(manager, stockList, callback){

    utils.testIterator(manager, testCreate, stockList, (err, createdStockList) => {
        if(err)
            return callback(err);

        testGetAllWithQueries(manager, createdStockList, (err) => {
            if(err)
                return callback(err);

            callback(undefined);
        })

    })


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

        //Getting Stock Manager
        const manager = getStockManager(participantManager);

        let stockList = populateStocks(10);
        let queryStockList = populateStocks(10);

        testOneFullCycle(manager, stockList, (err) => {
            if(err)
                return callback(err);
            
            testAllCycle(manager, queryStockList, (err) => {
                if(err)
                    return callback(err);
                
                callback();

            })   
        })

        
       

        


        

        

    });     
};

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
