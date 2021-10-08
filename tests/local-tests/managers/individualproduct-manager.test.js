//process.exit(0); // Uncommnent to skip test ...

/*Test Setup*/

process.env.NO_LOGS = true; // Prevents from recording logs. 

/*General Dependencies*/

const path = require('path');
const test_bundles_path = path.join('../../../privatesky/psknode/bundles', 'testsRuntime.js');
require(test_bundles_path); 

const tir = require("../../../privatesky/psknode/tests/util/tir");                // the test server framework

const dc = require("double-check");
const assert = dc.assert;

const { APPS } = require('../../../bin/environment/credentials/credentials3');

const {create} = require('../../../bin/environment/setupEnvironment');

const Utils = require('../../../pdm-dsu-toolkit/model/Utils');
const utils = require('../../../fgt-dsu-wizard/model/utils');

/*Specific Dependencies*/

/*
Both Lists contain the individual product or keyssi in the respective order
1: Random Individual Product One
2: Random Individual Product Two
3: Fixed Individual Product One
4: Random Individual Product Three
5: FixedIndividual Product Two
*/ 

keySSIList = [];
individualProductList = [];

const { IndividualProduct } = require('../../../fgt-dsu-wizard/model');
const { getIndividualProductManager } = require('../../../fgt-dsu-wizard/managers');

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

const testCreateProductDSU = function(individualProductManager, individualProduct, callback){
    
    console.log('Trying to create Individual Product DSU', individualProduct);

    individualProductManager.create(individualProduct, (err, keySSI) =>{

        if(err) {return callback(err);}; 

        assert.true(!!keySSI && typeof keySSI === 'object');

        console.log(`Individual Product created with SSI: ${keySSI.getIdentifier()}`);
        callback(undefined, keySSI);

    });

}

const testGetOneProductDSU = function(){}




/*Utilities*/ 


const getRandomIndividualProduct = function(){
    
    return new IndividualProduct({

        name: utils.generateProductName() ,
            gtin: utils.generateGtin(),
            batchNumber: utils.generateBatchNumber(),
            serialNumber: Utils.generateSerialNumber(10),
            manufName:  utils.generateProductName(),
            expiry:utils.genDate(100), 

    });

}

const getFixedIndividualProduct = function(){

    return new IndividualProduct({

        name: utils.generateProductName() ,
            gtin: utils.generateGtin(),
            batchNumber: utils.generateBatchNumber(),
            serialNumber: Utils.generateSerialNumber(10),
            manufName:  utils.generateProductName(),
            expiry:utils.genDate(100), 

    });

}

/*Create test Environment and Run Tests*/

assert.callback('Individual Product Manager Test', (cb) => {
    create(testOpts, (err, results) => {
        if (err)
            throw err;
        
        //Get participant manager
        console.log(`Actros created: `, results);

        //Individual Product Setup
        const randomIndividualProductOne = getRandomIndividualProduct();
        const randomIndividualProductTwo = getRandomIndividualProduct();
        const fixedIndividualProductOne = getFixedIndividualProduct();
        
        const randomIndividualProductThree = getRandomIndividualProduct();
        const fixedIndividualProductTwo = getFixedIndividualProduct();


        //Getting participant manager
        console.log('Trying to get Participant Manager');
        const participantManager = results['fgt-mah-wallet'][0].manager;
        console.log('Participant Manager Obtained');
        console.log(participantManager);

        //Getting Individual Product Manager
        const individualProductManager = getIndividualProductManager(participantManager); 
        //const individualProductManager = getIndividualProductManager(participantManager);
        console.log(individualProductManager);
        

        //Test Full cicle
        //Test One Random Product
        assert.pass(testCreateProductDSU(individualProductManager, randomIndividualProductOne, (err, keySSI) =>{
            if(err)
                return callback(err);
            
            keySSIList.push(keySSI);
            individualProductList.push(randomIndividualProductOne);

        }));

        // //Test Two Random Product
        // assert.pass(testCreateProductDSU(individualProductManager, randomIndividualProductTwo, (err, keySSI) =>{
        //     if(err)
        //         return callback(err);
            
        //     keySSIList.push(keySSI);
        //     individualProductList.push(randomIndividualProductTwo);

        // }));

        // //Test Three Fixed Product
        // assert.pass(testCreateProductDSU(individualProductManager, fixedIndividualProductOne, (err, keySSI) =>{
        //     if(err)
        //         return callback(err);
            
        //     keySSIList.push(keySSI);
        //     individualProductList.push(fixedIndividualProductOne);

        // }));




            //test create
            //test get all
            // get one
            //remove
            

        
    });
}, 400000);


/*
testCreate(order, orderService, (err, keySSI) => {
        if (err)
            return callback(err);
        testGet(keySSI, order, orderService, (err, orderFromSSI) => {
            if (err)
                return callback(err);
            testUpdate(keySSI, orderFromSSI, orderService, (err) => {
                if (err)
                    return callback(err);
                callback();
            });
        });
    });*/

    
 

