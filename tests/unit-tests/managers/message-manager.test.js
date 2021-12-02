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
const Utils = require('../../../fgt-dsu-wizard/model/utils');

/*Specific Dependencies*/

const {getMessageManager , Message} = require('../../../pdm-dsu-toolkit/managers/MessageManager');
const {getStockManager, getBatchManager, getDirectoryManager, getIndividualProductManager, getIssuedOrderManager, getIssuedShipmentManager, getNotificationManager, getParticipantManager, getProductManager, getReceiptManager, getReceivedOrderManager, getReceivedShipmentManager, getSaleManager, getShipmentLineManager} = require('../../../fgt-dsu-wizard/managers');
const {Notification, Batch, Product, Stock} = require('../../../fgt-dsu-wizard/model');
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

const sendAMessage = function(did, message, sendeMessageManager, callback){

    sendeMessageManager.sendMessage(did, message, (err) => {
        assert.false(err, 'Error Sending message')

        callback();
    })
    

    

}

/*Run Tests*/

const runTest = function(finishTest){
    /*
        * Create MAH Credentials
        */ 
    const mahCredentials = getCredentials(APPS.MAH); // MAH Credentials Creation 

    const mahFinalCredentials = Object.keys(mahCredentials).reduce((accum, key) => {
        if (mahCredentials[key].public)
            accum[key] = mahCredentials[key].secret;
        return accum;
    }, {});

    /*
    * Create WHS Credentials
    */

    const whsCredentials = getCredentials(APPS.WHOLESALER); // WHS Credentials Creation 
    //whsCredentials['id']['secret'] //Assign knowned DID

    const whsFinalCredentials = Object.keys(whsCredentials).reduce((accum, key) => {
        if (whsCredentials[key].public)
            accum[key] = whsCredentials[key].secret;
        return accum;
    }, {})


    /**Knowned DIDS/ */

    const mahDID = mahCredentials['id']['secret'];
    const whsDID = whsCredentials['id']['secret'];

    getMockParticipantManager(domain, mahFinalCredentials, (err, participantManagerMAH) => {
        assert.false(err, 'Error Getting Mock MAH Participant Manager');

        const mahMManager = getMessageManager(participantManagerMAH);

        console.log('MAH Created');

        const message = new Message('random', 'Hello Worlds')

        sendAMessage (whsDID,message, mahMManager, (err) => {
            // assert.false(err, 'Error Sending Message')

            getMockParticipantManager(domain, whsFinalCredentials, (err, participantManagerWHS) => {
                assert.false(err , 'Error Getting Mock WHS Participant Manager')
    
                console.log('WHS Created');
                
                const whsMManager = getMessageManager(participantManagerWHS);
                
                setTimeout(() => {
    
                    finishTest();
                },30000)
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

    if (false)
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
