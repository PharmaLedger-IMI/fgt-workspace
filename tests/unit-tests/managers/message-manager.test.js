//process.exit(0); // Uncomment to skip test ...

/*Test Setup*/
process.env.NO_LOGS = true; // Prevents from recording logs. 
process.env.PSK_CONFIG_LOCATION = process.cwd();

let domain = 'traceability';
let testName = 'MessageManagerTest' // no spaces please. its used as a folder name (change for the unit being tested)

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

const {getMessageManager , Message} = require('../../../pdm-dsu-toolkit/managers/MessageManager');
const {getStockManager, getBatchManager, getDirectoryManager, getIndividualProductManager, getIssuedOrderManager, getIssuedShipmentManager, getNotificationManager, getParticipantManager, getProductManager, getReceiptManager, getReceivedOrderManager, getReceivedShipmentManager, getSaleManager, getShipmentLineManager} = require('../../../fgt-dsu-wizard/managers');

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

const sendMessages = function(messages, manager, did, callback){

    const message = messages.shift();

    manager.sendMessage(did, message, () => {
        if(!messages)
            return sendMessages(messages, manager, did, callback);

        callback();

    } )

}


/*Run Tests*/

const runTest = function(callback){
    
  
  
    
 
    // const messages = [];



    //     for(let i = 0; i < 10; i++){
    //         messages.push(new Message('notifications', 'hello' + i));
    //     }

    //     console.log(participantManager);

    //     const messageManagerMAH = getMessageManager(participantManager);

    //     sendMessages(messages, messageManagerMAH, whsDID, ()=> {

    //         getMockParticipantManager(domain, whsCredentials, (err, participantManager) => {
    //             if(err)
    //                 return callback(err);
    
    
                
    //             callback();
    //         })



    //     })
     

    
    /*
    * Create MAH Credentials
    */ 
    const mahCredentials = getCredentials(APPS.MAH); // MAH Credentials Creation 
    mahCredentials['id']['secret'] = 'MAH999999999' //Assign knowned DID

    const mahFinalCredentials = Object.keys(mahCredentials).reduce((accum, key) => {
        if (mahCredentials[key].public)
            accum[key] = mahCredentials[key].secret;
        return accum;
    }, {})

    /*
    * Create WHS Credentials
    */

    const whsCredentials = getCredentials(APPS.WHOLESALER); // WHS Credentials Creation 
    whsCredentials['id']['secret'] = 'WHS999999999' //Assign knowned DID

    const whsFinalCredentials = Object.keys(whsCredentials).reduce((accum, key) => {
        if (whsCredentials[key].public)
            accum[key] = whsCredentials[key].secret;
        return accum;
    }, {})

    /*
    * KNOWNED DIDS
    */ 

    const mahDID = 'MAH999999999'; // MAH DID INFO
    const whsDID = 'WHS999999999'; // WHS DID INFO

    getMockParticipantManager(domain, mahFinalCredentials, (err, participantManagerMAH) => {
        if (err)
            return callback(err);

        getParticipantManager(domain, whsFinalCredentials, (err, participantManagerWHS) => {
                if (err)
                    return callback(err);
        
               
            
        
        
        
                callback()
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
