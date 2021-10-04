/*
*Test Setup 
*/

process.env.NO_LOGS = true; // prevents logs from being created

/*
* Dependencies
*/

const { APPS } = require('../../../bin/environment/credentials/credentials3'); // Using credentials3 Migth Swap for Test Credentials

const {create} = require('../../../bin/environment/setupEnvironment'); // Setup environment function

const path = require('path');


const test_bundles_path = path.join('../../../privatesky/psknode/bundles', 'testsRuntime.js');
require(test_bundles_path);

const dc = require("double-check");
const assert = dc.assert;
//const tir = require("../../privatesky/psknode/tests/util/tir");

const {IndividualProduct} = require('../../../fgt-dsu-wizard/model');
const {Batch} = require('../../../fgt-dsu-wizard/model');
const Utils = require('../../../pdm-dsu-toolkit/model/Utils');
const utils = require('../../../fgt-dsu-wizard/model/utils');

let createCounter = 0;

/*
*Test Options Config
*/

const testOpts = {
    app: APPS.SIMPLE_TRACEABILITY,                              // defines the mode of the setup
    credentials: undefined,                     // allows for the setup of predefined credentials
    products: './products/productsRandom.js',   // allows for pre-generated product data
    batchCount: 11,
    serialQuantity: 100,
    expiryOffset: 100,
    trueStock: true,                           // makes stock managers actually remove products from available for others down the line,
    exportCredentials: false,                   // export credentials for use in the Api-hubs front page
    attachLogic: true,                         // attaches listeners to the proper managers to replicate business logic
    statusUpdateTimeout: 5000,                   // When attachLogic is true, sets the timeout between status updates
    timeoutMultiplier: 5                        // If attach logic is true, will wait x times the status update timeout until it ends the process
}

/*
*Utilities
*/ 

const cb = function(err, ...results){
    
    if (err) {

        console.log('cb function throws error' , err);
        throw err;

    };
        
    console.log(`Results:`, ...results);
    process.exit(1)
}

/*
* Tests
*/ 

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



/*
*Create test Environment
*/

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