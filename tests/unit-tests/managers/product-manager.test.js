//process.exit(0); // Uncomment to skip test ...

/*Test Setup*/
process.env.NO_LOGS = true; // Prevents from recording logs. 
process.env.PSK_CONFIG_LOCATION = process.cwd();

let domain = 'traceability';
let testName = 'ProductManagerTest' // no spaces please. its used as a folder name (change for the unit being tested)

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

const { getProductManager } = require('../../../fgt-dsu-wizard/managers'); //change for the manager you want to test
const { Product } = require('../../../fgt-dsu-wizard/model');

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

/* Tests */

/**
     * @param {ProductManager} manager   
     * @param {Product} product
     * @param {function(err, keySSI, string)} callback where the string is the mount path relative to the main DSU
     */

const testCreate = function(manager, product, callback){

    const run = function(callback){
        manager.create(product, (err , productKeySSI, path) => {
            if(err)
                return callback(err);

            callback(undefined, product, productKeySSI, path);
                
        })
    }                   

    const testAll = function(product, productKeySSI, path, callback){
        
        const testCreateBasic = function(){
            assert.true(!!productKeySSI);
            assert.true(!!path);

            callback(undefined, productKeySSI);
        }();       
    };

    run((err, ...args) => {
        if(err)
            return callback(err);
        
        testAll(...args, callback);
    });
 
}

/**
     * @param {ProductManager} manager   
     * @param {Product|Array} productList
     * @param {function(err, dbProductList)} callback where the string is the mount path relative to the main DSU
     */

const testGetAll = function(manager, productList, callback){
    
    // Default options to be able to sort and test results
    let defaultOptions = {
                query:['gtin > 0'],
                sort: "asc",
                limit: undefined,
            }

    const run = function(callback){
        manager.getAll(true, defaultOptions, (err, productListFromDB) => {
            if(err)
                return callback(err);
            
            manager.getAll(false, defaultOptions,(err, productRecordsFromDB) => {
                if(err)
                    return callback(err);

                callback(undefined,productList, productListFromDB, productRecordsFromDB);
            }) 
        })
    };

    const testAll = function(productList,productListFromDB, productRecordsFromDB, callback){
        
        const testGetAllFromDB = function (){
            console.log('Product List from DB: ', productListFromDB);
            
            const filteredProductList = productList.filter((product) => product.gtin > 0).sort((a, b) => a.gtin - b.gtin);

            assert.notNull(productListFromDB, 'Product List must contain products!');
            assert.true(productListFromDB.length === productList.length, 'List Sizes dont match!');
            assert.true(utils.isEqual(filteredProductList, productListFromDB), 'List Products Dont Match!');

            const filteredRecordsList = productList.filter((product) => product.gtin > 0).sort((a, b) => a.gtin - b.gtin).map(product => product.gtin);
            console.log(productRecordsFromDB);

            assert.notNull(productRecordsFromDB, 'Records List must contain product records!');
            assert.true(productRecordsFromDB.length === productList.length, 'List sizes dont match!');
            assert.true(utils.isEqual(filteredRecordsList, productRecordsFromDB), 'Record Lists dont match!');

            callback(undefined, productListFromDB, productRecordsFromDB);  
        }();
    };

    run((err, ...args) => {
        if(err)
            return callback(err);
        
        testAll(...args, callback);
    });
}

/**
     * @param {ProductManager} manager   
     * @param {Product} product
     * @param {function(err, dbProductList)} callback where the string is the mount path relative to the main DSU
     */


const testGetOne = function(manager, product, callback){
    const key = product.gtin;

    const run = function(callback){
        manager.getOne(key, true, (err, productFromDB) => {
            if(err)
                return callback(err);

            manager.getOne(key, false, (err, recordFromDB) => {
                if(err)
                    return callback(err);
                
                callback(undefined, productFromDB, recordFromDB);
                })   
            });
    };

    const testAll = function(productFromDB, recordFromDB, callback){
        
        const testProductEquality = function (){
            manager.getRecord(key, (err, record) => {
                if(err)
                    return callback(err);
            
            assert.notNull(recordFromDB, 'Record should exist!');
            assert.true(recordFromDB === record.value, 'Record doesnt match product!');//assert.true(recordFromDB.gtin === product.gtin, 'Record doesnt match product!');
            //assert.true(recordFromDB.value === record, 'Record doesnt match product!')
             

            assert.notNull(productFromDB, 'Product should exist!');
            assert.true(utils.isEqual(productFromDB, product), 'Products dont match!')
              
            callback(err, productFromDB);
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
     * @param {ProductManager} manager 
     * @param {Product} product 
     * @param {function(err, product, record)} callback
     */

const testUpdate = function (manager, product, callback){
    const key = product.gtin;

    const productForUpdate = product;

    productForUpdate.name = utils.generateProductName();
    productForUpdate.description = utils.generateProductName();
    productForUpdate.manufName = utils.generateProductName();

    const run = function(callback){
        manager.update(key, productForUpdate, (err, updatedProduct) => {
            if(err)
                return callback(err);

            manager.getOne(key, true, (err, updatedProductFromDB) => {
                if(err)
                    return callback(err);         

                callback(undefined, updatedProductFromDB, updatedProduct);

            })
            
        });
    };

    const testAll = function(updatedStockFromDB, updatedStock, callback){
        
        const testProductEquality = function (){
            

                callback(undefined)
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

        //Getting Individual Product Manager
        const manager = getProductManager(participantManager);

        utils.generateSimpleIterator(utils.generateProduct, 10, (err, list) =>{
            if(err)
                return callback(err);
            utils.copyList(list, (err, copyList) => {
                if(err)
                    return callback(err);
            
                utils.testIterator(manager, testCreate, copyList,(err, keySSIList) => {
                    if(err)
                        return callback(err);
                      
                    testGetAll(manager, list,(err, productListFromDB, recordListFromDB) => {
                        if(err)
                            return callback(err);
                        
                        utils.testIterator(manager, testGetOne, productListFromDB,(err, getOneProductListFromDB) => {
                            if(err)
                                return callback(err);
                            
                            utils.testIterator(manager, testUpdate, getOneProductListFromDB, (err, updatedProductList) => {
                                if(err)
                                    return callback(err)

                                console.log(updatedProductList)
                                
                                callback();

                            })
                            
                           
    
                        })
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
