//process.exit(0); // Uncommnent to skip test ...

/*Test Setup*/
process.env.NO_LOGS = true; // Prevents from recording logs. 
process.env.PSK_CONFIG_LOCATION = process.cwd();


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
    timeout: 250000,
    fakeServer: true,
    useCallback: true
}

const TEST_CONF = argParser(defaultOps, process.argv);

/*Tests*/

const testFullCicle = function(individualProductManager , individualProduct){

    testCreateProductDSU(individualProductManager, individualProduct, (err, keySSI) =>{
        if(err)
            return callback(err);
        
        keySSIList.push(keySSI);
        individualProductList.push(individualProduct);

        testGetOneProductDSU(individualProductManager, individualProduct, (err, product) => {
            if(err)
                return callback(err)
        
            console.log('Product obtain sucessfully with compost key',product);
            console.log('Comparing product received with product delivered!');
            assert.true(utils.isEqual(individualProduct,product));
            assert.true(!!product && typeof product === 'object');
            
            
        })
})
};



const testCreateProductDSU = function(individualProductManager, individualProduct, callback){
    
    console.log('Trying to create Individual Product DSU', individualProduct);

    individualProductManager.create(individualProduct, (err, keySSI) =>{

        if(err) {return callback(err);}; 

        assert.true(!!keySSI && typeof keySSI === 'object');

        console.log(`Individual Product created with SSI: ${keySSI.getIdentifier()}`);
        callback(undefined, keySSI);

    });

}

const testGetOneProductDSU = function(individualProductManager, individualProduct, callback){
    
    console.log('Trying to get one Individual Product DSU', individualProduct);
    const readDSU = true;
    const key = individualProductManager._genCompostKey(individualProduct.gtin, individualProduct.batchNumber, individualProduct.serialNumber);

    individualProductManager.getOne(key ,readDSU, (err, product) =>{

        if(err) {return callback(err);}; 

        console.log(`Individual Product obtained with compost key: ${key}`);
        callback(undefined, product);

    });

} 

const testGetAll = function(individualProductManager,readDSU, callback){

    console.log(`Trying to read all products from DSU`);

    individualProductManager.getAll(readDSU,(err , result) =>{

        if(err)
            return callback(err);

        console.log(result);
        assert.true(!!result && result === 'object');    

        
        
        callback(undefined,result);

    });
}

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

        //Individual Product Setup
        const randomIndividualProductOne = getRandomIndividualProduct();
        const randomIndividualProductTwo = getRandomIndividualProduct();
        const fixedIndividualProductOne = getFixedIndividualProduct();
        
        const randomIndividualProductThree = getRandomIndividualProduct();
        const fixedIndividualProductTwo = getFixedIndividualProduct();

        //Getting Individual Product Manager
        const individualProductManager = getIndividualProductManager(participantManager); 
        console.log(individualProductManager);

        //Test Full cicle
        //Test One Random Product

        try{
            testFullCicle(individualProductManager, randomIndividualProductOne);
            testFullCicle(individualProductManager, randomIndividualProductTwo);
            testFullCicle(individualProductManager, fixedIndividualProductOne);

        }catch(e){

            console.log('Test Create Failed');
            console.log(e);
            process.exit(1);

        }
        
        //Test GET ALL
        //Test One

        try{

            testGetAll(individualProductManager, true , (err, result) =>{
                if(err)
                    return callback(err);
                
                console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$')
                console.log(result);
    
            });


        }catch(e){

            console.log('Test Get All Failed');
            console.log(e);
            process.exit(1);

        }
        
        callback();
        console.log("Tests Completed Sucessfully");
    });
    
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