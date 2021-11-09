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
    assert.true(utils.isEqual(stockOne.description,stockTwo.description), 'Descriptions dont match!');
    assert.true(utils.isEqual(stockOne.batches,stockTwo.batches), 'Batches dont match!');

    callback(undefined);
}

/*Tests*/

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
            manager.getOne(stock.gtin, true, (err, stockFromDB) =>{
                if(err)
                    return callback(err);
                manager.getOne(stock.gtin, false, (err, record) =>{
                    if(err)
                        callback(err)

                    callback(undefined, stock, createdStock, stockFromDB, record, path);        
                })    
            })
        })
    }                   

    const testAll = function(stock, createdStock, stockFromDB,record, path, callback){
        
        const testCreateBasic = function(){
            assert.notNull(stock, 'Stock is null');
            assert.notNull(createdStock, 'Created Stock in null');
            assert.notNull(path , 'Path does not exist');
            compareStocks(stock, stockFromDB, ()=>{
                compareStocks(stock, record, ()=>{
                    compareStocks(createdStock, stockFromDB, ()=> {
                        compareStocks(createdStock, record, () => {
                            compareStocks(record, stockFromDB, () => {

                                callback(undefined, stockFromDB);
                            })
                        })
                    })
                })
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
        
        const testEquality = function (){    
            assert.notNull(stockFromDB, 'Get one stock is null');
            assert.notNull(record, 'Get one record is null');
            
            assert.true(utils.isEqual(stock, stockFromDB), 'Stock and StockFromDB are not equal');
            assert.true(utils.isEqual(stock, record), 'Stock and record are not equal');
            assert.true(utils.isEqual(stockFromDB, record), 'Record and StockFromDB are not equal')
            
            callback(undefined, stockFromDB);            
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
    

    const run = function(callback){
        manager.update(key, stockForUpdate, (err, updatedStock) => {
            if(err)
                return callback(err);

            manager.getOne(key, true, (err, updatedStockFromDB) => {
                if(err)
                    return callback(err);         

                manager.getOne(key, false, (err, updatedRecordFromDB) => {
                    if(err)
                        return callback(err);         
    
                    callback(undefined, stockForUpdate, updatedStock, updatedStockFromDB, updatedRecordFromDB);
                })
            })        
        });
    };

    const testAll = function(stockForUpdate, updatedStock, updatedStockFromDB, updatedRecordFromDB, callback){
        
        const testEquality = function (){

            assert.notNull(stockForUpdate, 'StockForUpdate is Null');
            assert.notNull(updatedStock, 'updatedStock is Null');
            assert.notNull(updatedStockFromDB, 'updatedStockFromDB is Null');
            assert.notNull(updatedRecordFromDB, 'updatedRecordFromDB is Null'); 

            assert.true(utils.isEqual(stockForUpdate, updatedStock), 'stockFotUpdate and updatedStock are not equal');
            assert.true(utils.isEqual(stockForUpdate, updatedStockFromDB), 'stockFotUpdate and updatedStockFromDB are not equal')
            assert.true(utils.isEqual(stockForUpdate, updatedRecordFromDB), 'stockFotUpdate and updatedRecordFromDB are not equal')
            assert.true(utils.isEqual(updatedStock, updatedStockFromDB), 'updatedStock aand updatedStockFromDB are not equal')
            assert.true(utils.isEqual(updatedStock, updatedRecordFromDB), 'updatedStock aand updatedRecordFromDB are not equal')
            assert.true(utils.isEqual(updatedRecordFromDB, updatedRecordFromDB), 'updatedRecordFromDB aand updatedRecordFromDB are not equal')

            callback(undefined, updatedStockFromDB);                
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

            manager.getOne(key, true, (err, stockFromDB) => {
                if(!err)
                    return callback('Should have error geting a removed item');
                
                manager.getOne(key, false, (err, record) => {
                    if(!err)
                        return callback('Should have error geting a removed item');
                    
                    callback(undefined, stockFromDB, record);
                })
            })    
        })
    };

    const testAll = function(stockFromDB, record, callback){
        
        const testItemRemoved = function (){
            assert.false(!!stockFromDB, 'Error retrieving removed data');
            assert.false(!!record, 'Error retrieving removed data');

            callback(undefined);      
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
 * @param {Array} stockList 
 * @param {function(err, stockListFromDB)} callback
 */
 const testGetAll = function(manager, stockList, callback){
    let options = {
                query:['gtin > 0'],
                sort: "asc",
                limit: undefined,
            }

    const run = function(callback){
        manager.getAll(true, options, (err, stocksFromDB) => {
            if(err)
                return callback(err);

            manager.getAll(false, options,(err, recordsFromDB) => {
                if(err)
                    return callback(err);

                callback(undefined, stocksFromDB, recordsFromDB);
            }) 
        })
    };

    const testAll = function(stocksFromDB, recordsFromDB, callback){
        
        const testResults = function (){
            assert.notNull(recordsFromDB, 'Records from db cannot be null');
            assert.notNull(stocksFromDB, 'Stocks from db cannot be null');

            assert.true(stocksFromDB.length === stockList.length, 'Stocks from db size doesnt match stock list size');
            assert.true(stockList.length === recordsFromDB.length, 'records from db size doesnt match stock list size');
            
            const filteredResults = stockList.filter((item) => item.gtin > 0).sort((a, b) => { return a.gtin - b.gtin});
            assert.true(utils.isEqual(filteredResults, stocksFromDB), 'Stocks From db is not equal to stock list provided')

            const filteredRecords = stockList.filter((item) => item.gtin > 0).sort((a, b) => { return a.gtin - b.gtin}).map(a => a.gtin);
            assert.true(utils.isEqual(filteredRecords, recordsFromDB, 'Record list from db is not equal to record list provided'))

            callback() 
        }();
    };

    run((err, ...args) => {
        if(err)
            return callback(err);
        
        testAll(...args, callback);
    });
}





/*Chain Tests*/

/**
 * @param {StockManager} manager 
 * @param {function(err)} callback
 */

 const testOneFullCycle = function(manager, callback){

    utils.generateStock((err, stock) => {
        if(err)
            return callback(err);

        testCreate(manager, stock, (err, stockFromCreate) => {
            if(err)
                return callback(err);
            
            testGetOne(manager, stockFromCreate, (err, stockFromGetOne)=> {
                if(err)
                    return callback(err);

                testUpdate(manager, stockFromGetOne, (err, updatedStockFromDB) => {
                    if(err)
                        return callback(err);
                    
                    console.log(updatedStockFromDB)
                    testRemove(manager, updatedStockFromDB, (err) => {
                        if(err)
                            return callback(err);

                        callback(undefined);
                    })
                })
            })
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

        const manager = getStockManager(participantManager);

        testOneFullCycle(manager, (err) => {
            if(err)
                return callback(err);

            utils.generateIterator(utils.generateStock, 10, (err, stockList) => {
                if(err)
                    return callback(err);
                
                utils.testIterator(manager, testCreate, stockList, (err, createdStockList) => {
                    if(err)
                        return callback(err);
                    
                    testGetAll(manager, createdStockList,(err, getAllStockList) => {

                        console.log(getAllStockList)
                    callback();

                    })

                })
                
                
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
