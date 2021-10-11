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

// /**
//  * @param itemOne // represents first item
//  * @param ItemTwo  // represents second item
//  * @param {function(err, product, record)} callback
//  */

// const compareItems = function(itemOne, itemTwo, callback){

//     assert.true(utils.isEqual(itemOne, itemTwo));

//     callback(undefined);
// }

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
        const itemTwo = list.pop();

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

    const run = function(callback){
        manager.getAll(readDSU,(err, results) =>{
            if(err)
                return callback(err);


            callback(undefined,results);
        })
    };

    const testAll = function(results, callback){
        
        const testResults = function (){
            assert.true(list.length === results.length);

            console.log(results);

            callback(undefined, results);
            // testIterator(manager, compareItems , list,[], results, (err, results) => {
            //     if(err)
            //         return  callback(err);

            //     

            // })
        }();

        
    };

    run((err, ...args) => {
        if(err)
            return callback(err);
        
        testAll(...args, callback);
    });
}

// /**
//  * @param manager // represents the manager being tested
//  * @param itemList // represents the item list you want to get
//  * @param {function(err, product, record)} callback
//  * 
//  */

//  const testGetAllWithQueries = function(manager, itemList, callback){
//     const readDSU = true;

//     let options = {
//         query:['batchNumber == '+ itemList[0].batchNumber],
//         sort: "asc",
//         limit: undefined,
//     }

//     const run = function(callback){

//         manager.getAll(readDSU, options, (err, resultsQueryOne) => {
//             if(err)
//                 return callback(err);
            
//             const filteredResultsOne = itemList.filter((item) => itemList[0].batchNumber === item.batchNumber);

//             options.query = ['gtin <= 55289538478425'];

//             manager.getAll(readDSU, options, (err, resultsQueryTwo) => {

            
//                 const filteredResultsTwo = itemList.filter((item) => item.gtin <= 55289538478425).sort((a,b) => {
//                     if(a.gtin < b.gtin){
//                         return -1;
//                     }
//                     if(a.gtin > b.gtin){
//                         return 1;
//                     }
//                     if(a.gtin === b.gtin){
//                         return 0;
//                     }

//                 });

//                 console.log(resultsQueryTwo);
//                 console.log(filteredResultsTwo);


//                 callback(undefined, resultsQueryOne, filteredResultsOne, resultsQueryTwo, filteredResultsTwo);
//             })
          
//         })      
//     };

//     const testAll = function(resultsQueryOne, filteredResultsOne, resultsQueryTwo, filteredResultsTwo, callback){
        
//         const testItemRemoved = function (){
//            assert.true(utils.isEqual(resultsQueryOne,filteredResultsOne), 'Query doesnt match expected result');
//            assert.true(resultsQueryTwo.length,filteredResultsTwo.length, 'Query doesnt match expected result');
//            assert.true(utils.isEqual(resultsQueryTwo,filteredResultsTwo), 'Query doesnt match expected result');

//            callback(undefined,'complete');

//         }();

        

//     };

//     run((err, ...args) => {
//         if(err)
//             return callback(err);
        
//         testAll(...args, callback);
//     });
// };

// /**
//  * @param manager // represents the manager being tested
//  * @param item // represents the item you want to get
//  * @param {function(err, product, record)} callback
//  */

//  const testRemove = function(manager, item, callback){
//     const key = manager._genCompostKey(item.gtin, item.batchNumber, item.serialNumber);

//     const run = function(callback){

//         manager.remove(key, (err) => {
//             if(err)
//                 return callback(err);
            
//             callback(undefined, key);
//         })
        
//     };

//     const testAll = function(key, callback){
        
//         const testItemRemoved = function (){
//             manager.getOne(key, true, (err, product) => {
//                 if(!err)
//                     return callback(err);
                    
//                 assert.false(utils.isEqual(item , product), 'Products are not equal!');
                
//                 callback(undefined,product);
//             });       
//         }();

    

//     };

//     run((err, ...args) => {
//         if(err)
//             return callback(err);
        
//         testAll(...args, callback);
//     });
// };

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


        //Populate product list
        populateStocks(10,stockList);
        

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

                    callback();
                })
            })
        })

        // //Test create with iterator and item
        // testIterator(manager, testCreate, itemList,(err, list) => {

        //     if(err)
        //         return callback(err);

        //     console.log(list);

        //     //Test get one with iterator
        //     testIterator(manager, testGetOne, list, (err, newList) => {

        //         if(err)
        //             return callback(err);

        //         //Test get all
        //         testGetAll(manager, true, newList, (err, results) => {
        //             if(err)
        //                 return callback(err);
        //             //Test remove with iterator
        //             testIterator(manager, testRemove, results,(err) => {
        //                 if(err)
        //                     return callback(err);

        //                     //Populate DB for get ALL query tests
        //                     testIterator(manager, testCreate, queryList, (err, results) => {
        //                         if(err)
        //                             return callback(err);

        //                         testGetAllWithQueries(manager,results, (err, message) =>{
        //                             if(err)
        //                                 return callback(err);

        //                             console.log(message);


        //                             
        //                         } )
        //                     })
        //             })
        //         })   
        //     })
        // })

       
    
      
    
    
    
    
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



