/*Setup for the test*/
process.env.NO_LOGS = true;

process.env.PSK_CONFIG_LOCATION = process.cwd();

const path = require('path');



const test_bundles_path = path.join('../../../privatesky/psknode/bundles', 'testsRuntime.js');
require(test_bundles_path);

const {argParser} = require('../../../bin/environment/utils');

const dc = require('double-check');
const assert = dc.assert;
const tir = require('../../../privatesky/psknode/tests/util/tir'); 


let domain = 'traceability';
let testName = 'IndividualProductServiceTest'; // no spaces please. its used as a folder name

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
    enable: ['mq'],
};

const getBDNSConfig = function(folder){
    return{
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
    useCallBack: true
}

const TEST_CONF = argParser(defaultOps,process.argv);

const wizard = require('../../../fgt-dsu-wizard');
const Utils = require('../../../pdm-dsu-toolkit/model/Utils');
const{Services, Model} = wizard;

const {IndividualProduct, utils} = Model;
const {IndividualProductService} = Services;


/*Creating Individual Products to test*/

/*
*
* @param {boolean} randomIndividualProduct: Defines if a random individual product will be generated.
*
*/    

const getItem = function (randomIndividualProduct){

    // If random Individual Product was requested
    if (!!randomIndividualProduct){

        return new IndividualProduct({

            name: utils.generateProductName() ,
            gtin: utils.generateGtin(),
            batchNumber: utils.generateBatchNumber(),
            serialNumber: Utils.generateSerialNumber(10),
            manufName:  utils.generateProductName(),
            expiry:utils.genDate(100), 
        }); 

    }

    return new IndividualProduct({

        name: 'Aspirina',
        gtin: '012345789abcd' ,
        batchNumber: '00001' ,
        serialNumber: '10000',
        manufName: 'Phizer',
        expiry: '10sep' ,

    }); 

}


// Test create with random Individual Product
const testCreate = function(individualProduct, individualProductService, callback){
    
    console.log('Trying to create Individual Product', individualProduct);

    individualProductService.create(individualProduct, (err, keySSI) =>{

        if(err) {return callback(err);}; 

        assert.true(!!keySSI && typeof keySSI === 'object');

        console.log(`Individual Product created with SSI: ${keySSI.getIdentifier()}`);
        callback(undefined, keySSI);

    });

}


// Test get from Key SSI
const testGet = function(keySSI, individualProduct, individualProductService, callback){

    console.log(`Trying to read product from SSI: ${keySSI.getIdentifier()}`);

    individualProductService.get(keySSI, (err, iPFromSSI) => {

        if (err) {return callback(err);};
            
        assert.true(!!iPFromSSI && typeof iPFromSSI === "object" && iPFromSSI instanceof IndividualProduct);
        
        assert.true(utils.isEqual(individualProduct, iPFromSSI));

        console.log(`Individual Product from SSI: ${keySSI.getIdentifier()}:`, iPFromSSI);

        callback(undefined, iPFromSSI);
    });
}



// Run test
const runTest = function(callback){

    const individualProductService = new IndividualProductService(domain);
    const individualProduct = getItem(true);
    const individualProductOne = getItem(true);
    const individualProductTwo = getItem(true);
    const individualProductThree = getItem(true);
    const individualProductFour = getItem(true);
    const individualProductFixed = getItem(false);

    testCreate(individualProduct, individualProductService, (err, keySSI) => {

        if (err){return callback(err);};
            
        testGet(keySSI, individualProduct, individualProductService, (err, iPFromSSI) => {

                if (err){return callback(err);}
                    
                callback();
            
        });
            
    });

    testCreate(individualProductOne, individualProductService, (err, keySSI) => {

        if (err){return callback(err);};
            
        testGet(keySSI, individualProductOne, individualProductService, (err, iPFromSSI) => {

                if (err){return callback(err);}
                    
                callback();
            
        });
            
    });

    testCreate(individualProductTwo, individualProductService, (err, keySSI) => {

        if (err){return callback(err);};
            
        testGet(keySSI, individualProductTwo, individualProductService, (err, iPFromSSI) => {

                if (err){return callback(err);}
                    
                callback();
            
        });
            
    });

    testCreate(individualProductThree, individualProductService, (err, keySSI) => {

        if (err){return callback(err);};
            
        testGet(keySSI, individualProductThree, individualProductService, (err, iPFromSSI) => {

                if (err){return callback(err);}
                    
                callback();
            
        });
            
    });

    testCreate(individualProductFour, individualProductService, (err, keySSI) => {

        if (err){return callback(err);};
            
        testGet(keySSI, individualProductFour, individualProductService, (err, iPFromSSI) => {

                if (err){return callback(err);}
                    
                callback();
            
        });
            
    });

    testCreate(individualProductFixed, individualProductService, (err, keySSI) => {

        if (err){return callback(err);};
            
        testGet(keySSI, individualProductFixed, individualProductService, (err, iPFromSSI) => {

                if (err){return callback(err);}
                    
                callback();
            
        });
            
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


/*



const testUpdate = function(keySSI, item, itemService, callback){
    console.log(`Trying to update product from SSI: ${keySSI.getIdentifier()}`);
}










*/