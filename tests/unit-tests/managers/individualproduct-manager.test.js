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

individualProductList = [];

const { IndividualProduct } = require('../../../fgt-dsu-wizard/model');
const { getIndividualProductManager } = require('../../../fgt-dsu-wizard/managers');


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
const getIndividualProduct = function(){
    
    return new IndividualProduct({

        name: utils.generateProductName() ,
            gtin: utils.generateGtin(),
            batchNumber: utils.generateBatchNumber(),
            serialNumber: Utils.generateSerialNumber(10),
            manufName:  utils.generateProductName(),
            expiry:utils.genDate(100), 

    });

}

const populateProductList = function(numOfProducts, list){

    for(let i = 0; i < numOfProducts; i++){

            list.push(getIndividualProduct());
    
    }
}

/**
 * @param itemOne // represents first item
 * @param ItemTwo  // represents second item
 * @param {function(err, product, record)} callback
 */

const compareItems = function(itemOne, itemTwo, callback){

    assert.true(utils.isEqual(itemOne, itemTwo));

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
    let key = manager._genCompostKey(item.gtin, item.batchNumber, item.serialNumber);

    if(!!list){
        const itemTwo = list.pop();
        console.log('Running test with extra parameter');

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

/*Tests*/

/**
 * @param manager // represents the manager being tested
 * @param item // represents the item you want to get
 * @param {function(err, product, record)} callback
 */

 const testCreate = function(manager , item, callback){

    const run = function(callback){
        manager.create(item, (err , keySSI , path) => {
            if(err)
                return callback(err);
                callback(undefined, item, keySSI, path);}
    )};

    const testAll = function(item, keySSI, path, callback){
        
        const testCreateBasic = function(){
            assert.notNull(keySSI, 'Key SSI is null!');
            assert.notNull(path, 'Path is null!');

        }();

        callback(undefined , keySSI);

          
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
    const key = manager._genCompostKey(item.gtin, item.batchNumber, item.serialNumber);

    const run = function(callback){
        manager.getOne(key, true, (err, product) => {
            if(err)
                return callback(err);
            
            callback(undefined,product);
        });
    };

    const testAll = function(product, callback){
        
        const testProductEquality = function (){
            assert.true(utils.isEqual(item , product), 'Products are not equal!');
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

    const run = function(callback){
        manager.getAll(readDSU,(err, results) =>{
            if(err)
                return callback(err);


            callback(undefined,results);
        })
    };

    const testAll = function(results, callback){
        
        const testResults = function (){
            testIterator(manager, compareItems , list,[], results, (err, results) => {
                if(err)
                    return  callback(err);

                callback(undefined, results);

            })
        }();

        callback(undefined, results);
        
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

 const testRemove = function(manager, item, callback){
    const key = manager._genCompostKey(item.gtin, item.batchNumber, item.serialNumber);

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
                    
                assert.false(utils.isEqual(item , product), 'Products are not equal!');
                
                callback(undefined,product);
            });       
        }();

        callback(undefined);

    };

    run((err, ...args) => {
        if(err)
            return callback(err);
        
        testAll(...args, callback);
    });
};

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
        let itemList = [];


        //Populate product list
        populateProductList(5,itemList);
        

        //Getting Individual Product Manager
        const manager = getIndividualProductManager(participantManager); 
        console.log(manager);

        //Test create with iterator and item
        testIterator(manager, testCreate, itemList,(err, list) => {

            if(err)
                return callback(err);

            console.log(list);

            testIterator(manager, testGetOne, list, (err, newList) => {

                if(err)
                    return callback(err);

                
                testGetAll(manager, true, newList, (err, results) => {
                    if(err)
                        return callback(err);

                    testIterator(manager, testRemove, results,(err) => {
                        if(err)
                            return callback(err);
                        
                        callback();

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

