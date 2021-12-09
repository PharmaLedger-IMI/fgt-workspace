/* SKIP TEST */

// process.exit(0); //uncomment to skip test ... 

//################################################################################################

/* Test Configurations */

const testOptions = {
    noLogs: true, // Prevents from recording logs. (set to false if you want to record them);
    testName: 'w3cDIDMethodNameTest', // no spaces please. its used as a folder name (change for the unit being tested);
    timeout: 100000, // Sets timeout for the test.
    fakeServer: false, // Decides if fake server is used (change if you want to use fake server);
    useCallback: true, // Decides if you want to use callback (change if you dont want to use it);
};

const options = {
    domain: 'traceability',
    DID_METHOD: 'ssi:name',
    DID_NAME: 'mydidssiname',
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

const test_bundles_path = path.join('../../../privatesky/psknode/bundles', 'testsRuntime.js');
require(test_bundles_path);

const tir = require("../../../privatesky/psknode/tests/util/tir");

const dc = require("double-check");
const assert = dc.assert;

const { argParser } = require('../../../bin/environment/utils');

const opendsu = require("opendsu");
const w3cDID = opendsu.loadApi('w3cdid');


//################################################################################################

/*General Dependencies*/

const config = argParser(options, process.argv);

//################################################################################################

/* Run Test */ 

const runTest = function(finishTest){

    w3cDID.createIdentity(config.DID_METHOD, config.domain, config.DID_NAME, (err, did) => {
        if (err)
            throw err;
       
        console.log(did);
        finishTest();
    });
    
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

















// /*Test Setup*/





// const { fork } = require('child_process');





// //################################################################################################
// /* Test Options */

// const options = {



//     /*Test related Specific*/
//     didMethod: 'demo',
//     utilTest: 'tests/unit-tests/managers/message-manager/message-manager-children.js',

//     messages: 10,
//     sendTimeout: 200,

// };

// //################################################################################################


// /*Specific Dependencies*/

// const { getCredentials, APPS } = require('../../../../bin/environment/credentials/credentials3');
// const { send } = require('process');

// const whs = {};
// const mah = {};


// //################################################################################################

// /* Test Utilities */
// const setupTest = function(callback){
//     createWholesaler(() => {
//         createMAHID(() => {
//             callback();
//         })
//     })
// }

// const createWholesaler = function (callback){

//     const credentials = getCredentials(APPS.WHOLESALER); // Creates Credentials

//     let id = credentials['id']['secret'];
//     whs['id'] = id;

//     const finalCredentials = Object.keys(credentials).reduce((accum, key) => {
//         if (credentials[key].public)
//             accum[key] = credentials[key].secret;
//         return accum;
//     }, {});

//     w3cDID.createIdentity(config.didMethod, id, (err, didDOC) => {
//         assert.false(err, 'Failed to Create Identity: ', id,' : ', err);
        
//         whs['did'] = didDOC;

//         callback(didDOC);
//     })
// }

// const createMAHID = function(callback){

//     const credentials = getCredentials(APPS.WHOLESALER); // Creates Credentials

//     let id = credentials['id']['secret'];

//     mah['id'] = id;

//     callback(id);
// }





// //################################################################################################

// /* Test */ 

// const runTest = function(finishTest){
//     setupTest(() => {

//         const forked = fork(config.utilTest);

//         forked.on('message', (args) => {
//             const {sendMessages, receiveMessages} = args;

//             if(sendMessages){    
//                 console.log(`MAH Channel: received created and listening`);
                
//                 forked.send({
//                     sendMessages: sendMessages,
//                 });

//             }
            
//             if(receiveMessages){
//                 finishTest();
                
//             }
            
//         });

//         forked.send({
//             id: mah['id'],
//             identifier: whs['did'].getIdentifier(),
//             didMethod: config.didMethod,
//             messages: config.messages,
//         });
//     })   
// };



// //################################################################################################
/*Fake Server Config*/




