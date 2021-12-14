/* SKIP TEST */

// process.exit(0); //uncomment to skip test ... 

//################################################################################################

/* Test Configurations */

const testOptions = {
    noLogs: true, // Prevents from recording logs. (set to false if you want to record them);
    testName: 'MessageManagerIntegrationTest', // no spaces please. its used as a folder name (change for the unit being tested);
    timeout: 10000000, // Sets timeout for the test.
    fakeServer: true, // Decides if fake server is used (change if you want to use fake server);
    useCallback: true, // Decides if you want to use callback (change if you dont want to use it);
};

const options = {
    domain: 'traceability',
    DID_METHOD: 'ssi:name',
}

//################################################################################################

/* Fake Server Config*/

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
                name: options.domain,
                config: DOMAIN_CONFIG,
            },
            {
                name: 'vault',
                config: DOMAIN_CONFIG,
            },
        ],
    }
}

//################################################################################################

/* Test Pre-Setup */

process.env.NO_LOGS = testOptions.noLogs;

//################################################################################################

/* Test Imports */

const path = require('path');

const test_bundles_path = path.join('../../../../privatesky/psknode/bundles', 'testsRuntime.js');
require(test_bundles_path);

const tir = require("../../../../privatesky/psknode/tests/util/tir");

const dc = require("double-check");
const assert = dc.assert;

const { argParser } = require('../../../../bin/environment/utils');

const opendsu = require("opendsu");
const w3cDID = opendsu.loadApi('w3cdid');
const scAPI = opendsu.loadAPI("sc");


//################################################################################################

/*General Dependencies*/

const config = argParser(options, process.argv);

//################################################################################################

// /*Specific Dependencies*/

const { getCredentials, APPS } = require('../../../../bin/environment/credentials/credentials3');
const { getMockParticipantManager } = require('../../../getMockParticipant');
const { getMessageManager, Message } = require('../../../../pdm-dsu-toolkit/managers/MessageManager');

const apps = {};

// //################################################################################################

/* Test API */

const createAPP = function (app, force, callback) {

    const initialCredentials = getCredentials(app); // Creates Credentials

    const finalCredentials = Object.keys(initialCredentials). reduce((acum, key) => {
        if(initialCredentials[key].public)
            acum[key] = initialCredentials[key].secret;
        
        return acum;
    }, {});

    getMockParticipantManager(config.domain, finalCredentials, force, (err, participantManager) => {
        assert.false(err, 'Could not create participant manager: ', err);

        callback(participantManager);
    })

}

//################################################################################################

/* Run Test */ 

const runTest = function(finishTest){
    
    createAPP(APPS.MAH, false, (participantManager) => {
        apps['MAH1'] = participantManager;

        const messageManagerMAH = getMessageManager(participantManager);

        createAPP(APPS.WHOLESALER, true, (participantManager) => {
            apps['WHS1'] = participantManager;

            const messageManagerWHS = getMessageManager(participantManager);
            messageManagerWHS.getOwnDID((err, didDoc) => {

                const whsdid = didDoc.getIdentifier().split(':');
                console.log(didDoc.sendMessage);
                
                try{

                    messageManagerMAH.sendMessage(whsdid[4], new Message('test', 'hello'), finishTest);
                 
                } catch (e) {
                    
                    return finishTest(e);

                }
                            
            })
          
        })            
           
    })
};

//################################################################################################

/*Launch Test*/

const testFinishCallback = function(callback){
    console.log(`Test ${testOptions.testName} finished successfully`);
    if (callback)
        return callback();
    setTimeout(() => {
        process.exit(0);
    }, 1000);
};

const launchTest = function(callback){
    const testRunner = function(callback){
        runTest((err) => {
            if (err)
                throw err;
            testFinishCallback(callback);
        });
    };

    const runWithFakeServer = function(callback){
        dc.createTestFolder(testOptions.testName, async (err, folder) => {
            await tir.launchConfigurableApiHubTestNodeAsync(getBDNSConfig(folder));

            if (!callback)
                assert.begin(`Running test ${testOptions.testName}`, undefined, testOptions.timeout);
            testRunner(callback);
        });
    };

    if (testOptions.fakeServer)
        return runWithFakeServer(callback);

    if (!callback)
        assert.begin(`Running test ${testOptions.testName}`, undefined, testOptions.timeout);
    testRunner(callback);
};


if (!testOptions.useCallback)
    return launchTest();
    
assert.callback(testOptions.testName, (testFinished) => {
    launchTest(testFinished);
}, testOptions.timeout);
