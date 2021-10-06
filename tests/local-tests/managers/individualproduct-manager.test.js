//process.exit(0); // Uncommnent to skip test ...

/*Test Setup*/

process.env.NO_LOGS = true; // Prevents from recording logs. 

/*General Dependencies*/

const path = require('path');
const test_bundles_path = path.join('../../../privatesky/psknode/bundles', 'testsRuntime.js');
require(test_bundles_path); //mata os testes

const tir = require("../../../privatesky/psknode/tests/util/tir");                // the test server framework

const dc = require("double-check");
const assert = dc.assert;

const { APPS } = require('../../../bin/environment/credentials/credentials3');

const {create} = require('../../../bin/environment/setupEnvironment');

const Utils = require('../../../pdm-dsu-toolkit/model/Utils');
const utils = require('../../../fgt-dsu-wizard/model/utils');

/*Specific Dependencies*/
let keySSIList = [];

const { IndividualProduct } = require('../../../fgt-dsu-wizard/model');

/*Test Options Config*/
const testOpts = {
    app: APPS.SIMPLE_TRACEABILITY,                              // defines the mode of the setup
    pathToApps: '../../../',
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
}; 

/* Tests */

const testSetup = function(results, callback){

    console.log(`Actros created: `, results);


    //Getting participant manager
    console.log('Trying to get Participant Manager');
    const participantManager = getParticipantManager(results);
    console.log('Participant Manager Obtained');
    console.log(participantManager);

    //Getting Individual Product Manager
    const individualProductManager = getIndividualProductManager(participantManager);
    console.log(individualProductManager);

    





    //Run Tests
    runTests(individualProductManager);

}

const runTests = function(productManager){

    testCreateProductDSU(productManager);


    console.log('Testing finished ...');
    console.log('Exiting Test');
    process.exit(0);

}

const testCreateProductDSU = function(productManager){
        const product = getIndividualProduct();
        productManager.create(product,checkErrorOrSaveCreateData);
}


/*Utilities*/ 

const getParticipantManager = function (results){
    return results['fgt-mah-wallet'][0].manager;
}

const getIndividualProductManager = function(participantManager){
    try{
        console.log('Trying to get Individual Product Manager');
        const individualProductManager = participantManager.getManager('ProductManager');
        console.log('Individual Product Manager Obtained');
        return individualProductManager;
    }catch(e){
        console.log('Error getting Individual Product Manager!');
        console.log(e);
        process.exit(1);
    }
}

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

const checkErrorOrSaveCreateData = function(err, keySSI, path){

    if(err){
        throwError(err, 'Error Creating Product DSU');
    }

    let record = {
        key:keySSI,
        path: path,
    };

    keySSIList.push(record);
}

const throwError = function (err,message){
    console.log(message);
    console.log(err);
    throw err;
}

/*Create test Environment and Run Tests*/

assert.callback('testname', (cb) => {
    create(testOpts, (err, results) => {
        if (err)
            throw err;
        testSetup(results, (err) => {
            if (err)
                throw err;
            cb();
        })
    });
}, 150000)

    
 

