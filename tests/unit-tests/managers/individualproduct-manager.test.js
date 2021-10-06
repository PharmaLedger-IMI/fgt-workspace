//process.exit(0); //Uncomment to skip test ...

/*Test Variables*/

let keySSIList = [];

/*
*Test Setup 
*/
process.env.NO_LOGS = true; //Prevents from recording logs.
process.env.PSK_CONFIG_LOCATION = process.cwd();

/*
* General dependencies
*/

const path = require('path');
const test_bundles_path = path.join('../../../privatesky/psknode/bundles', 'testsRuntime.js');
require(test_bundles_path);

const {argParser} = require('../../../bin/environment/utils');

const dc = require("double-check");
const assert = dc.assert;
const tir = require('../../../privatesky/psknode/tests/util/tir');

const { APPS } = require('../../../bin/environment/credentials/credentials3'); // Using credentials3 Migth Swap for Test Credentials
const {create} = require('../../../bin/environment/setupEnvironment'); // Setup environment function

const wizard = require('../../../fgt-dsu-wizard');
const {Services, Model} = wizard;

let domain = 'traceability';
let testName = 'IndividualProductManagerTest';

const Utils = require('../../../pdm-dsu-toolkit/model/Utils');
const utils = require('../../../fgt-dsu-wizard/model/utils');

const pathToApps = '../../../'

/*
* Specific dependencies
*/

const {IndividualProduct} = require('../../../fgt-dsu-wizard/model');

/*
*Test Options Config
*/

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
        ],
    }
}


const defaultOps = {
    timeout: 250000,
    fakeServer: true,
    useCallback: true
}

const testOpts = {
    app: APPS.SIMPLE_TRACEABILITY,                              // defines the mode of the setup
    credentials: undefined,                     // allows for the setup of predefined credentials
    products: './products/productsRandom.js',   // allows for pre-generated product data
    batchCount: 11,
    pathToApps: "../",
    serialQuantity: 100,
    expiryOffset: 100,
    trueStock: true,                           // makes stock managers actually remove products from available for others down the line,
    exportCredentials: false,                   // export credentials for use in the Api-hubs front page
    attachLogic: true,                         // attaches listeners to the proper managers to replicate business logic
    statusUpdateTimeout: 5000,                   // When attachLogic is true, sets the timeout between status updates
    timeoutMultiplier: 5                        // If attach logic is true, will wait x times the status update timeout until it ends the process
}

const TEST_CONF = argParser(defaultOps, process.argv);

/*Tests*/ 
//Create a Individual Product DSU
const createIndividualProductDSU = function (participantManager, callback){

    console.log(`Create Individual Product DSU Test...`);

    //Individual Product manager
    let individualProductManager;

    try{

        console.log('Attempting to get Individual Product Manager...');
        individualProductManager = participantManager.getManager('IndividualProductManager');
        console.log('Individual Product Manager sucessfully obtained!', individualProductManager);




    } catch(e) {


    }

    
}

/*
const createBatchDSU = function (participantManager){

    createCounter++;

    try{   

    }catch(e){

        return cb(e);

    }

    //Setup for Create test

    const product = new IndividualProduct({

        name: utils.generateProductName() ,
            gtin: utils.generateGtin(),
            batchNumber: utils.generateBatchNumber(),
            serialNumber: Utils.generateSerialNumber(10),
            manufName:  utils.generateProductName(),
            expiry:utils.genDate(100), 

    });

    const batch = new Batch({

        batchNumber: utils.generateBatchNumber(),
        expiry: product.expiry,
        serialNumbers: [product.serialNumber],
        quantity: 1,
        

    });

    batchManager.create(product,batch, cb);

    console.log('Create test Passed');



};


*/

/*
*Utilities
*/ 
const saveKeySSI = function(err, keySSI, callback){

    keySSIList.push(keySSI);

}

const cb = function(err, ...results){
    
    if (err) {

        console.log('cb function throws error' , err);
        throw err;

    };
        
    console.log(`Results:`, ...results);
    process.exit(1)
}



/*Run tests*/ 

const runTest = function(callback){

    console.log('entrei');

    /*Create test Environment*/

    create(testOpts, (err, results) => {
    
        if(err) {
    
            return cb(err);
    
        };
        console.log('aqui');
        console.log(`Actros created: `, results);

        const participantManager = results['fgt-mah-wallet'][0].manager;

        console.log('Participant Manager Obtained');
        console.log(participantManager);


        //Run Create Tests
        createIndividualProductDSU(participantManager);
    
    });


    console.log('Run complete');
    
    
  
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
                return callback(err);
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



/*
let createCounter = 0;



*/

/*


*/
/*Tests*/ 
/*
const createBatchDSU = function (participantManager){

    createCounter++;

    console.log(`Create Batch DSU - ${createCounter}`);

    let batchManager;

    try{

        console.log('trying to get batch manager');
        batchManager = participantManager.getManager('BatchManager');
        console.log('Batch Manager sucessfully obtained', batchManager);

    }catch(e){

        return cb(e);

    }

    //Setup for Create test

    const product = new IndividualProduct({

        name: utils.generateProductName() ,
            gtin: utils.generateGtin(),
            batchNumber: utils.generateBatchNumber(),
            serialNumber: Utils.generateSerialNumber(10),
            manufName:  utils.generateProductName(),
            expiry:utils.genDate(100), 

    });

    const batch = new Batch({

        batchNumber: utils.generateBatchNumber(),
        expiry: product.expiry,
        serialNumbers: [product.serialNumber],
        quantity: 1,
        

    });

    batchManager.create(product,batch, cb);

    console.log('Create test Passed');



};


*/


/*
const runTest = function(callback){
*/


/*


    create(testOpts, (err, results) => {
    
        if(err) {
    
            return cb(err);
    
        };
        console.log(`Actros created: `, results);
    
        const participantManager = results['fgt-mah-wallet'][0].manager;
    
        console.log(participantManager);
        
        // Create Batch dsu test
    
        
        assert.fail(createBatchDSU(participantManager));
        assert.true(createBatchDSU(participantManager));
        createBatchDSU(participantManager);
        createBatchDSU(participantManager);
        createBatchDSU(participantManager);
    
        
        
        
        
    
    
        
        console.log('All Tests Completed');
        process.exit(0);
    
    });
}

*/