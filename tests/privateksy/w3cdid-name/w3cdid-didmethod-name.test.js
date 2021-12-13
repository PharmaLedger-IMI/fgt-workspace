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
    DID_SENDERNAME: 'sendername',
    DID_RECEIVERNAME: 'receivername',
    data: 'some Data',
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
const scAPI = opendsu.loadAPI("sc");


//################################################################################################

/*General Dependencies*/

const config = argParser(options, process.argv);

//################################################################################################

/* Run Test */ 

const runTest = function(finishTest){

    let sc = scAPI.getSecurityContext();

    sc.on('initialised', async () => {
        
        w3cDID.createIdentity(config.DID_METHOD, config.domain, config.DID_SENDERNAME, (err, senderDIDDoc) => {
            assert.false(err, 'Could Not Create Identity: ', config.DID_SENDERNAME);

            console.log(senderDIDDoc.getIdentifier(), ' created');

            w3cDID.createIdentity(config.DID_METHOD, config.domain, config.DID_RECEIVERNAME, (err, receiverDIDDoc) => {
                assert.false(err, 'Could Not Create Identity: ', config.DID_RECEIVERNAME);

                console.log(receiverDIDDoc.getIdentifier(), ' created');

                const message = `Message created at ${Date.now()}`;

                senderDIDDoc.sendMessage(JSON.stringify(message), receiverDIDDoc,  (err) => {
                    assert.false(err, `${senderDIDDoc.getIdentifier()} failed to send message to ${receiverDIDDoc.getIdentifier()} : ${message}`);
                    
                    console.log(`${senderDIDDoc.getIdentifier()} sent message to ${receiverDIDDoc.getIdentifier()}`)

                    receiverDIDDoc.readMessage((err, decMessage) => {
                        assert.false(err, `${receiverDIDDoc.getIdentifier()} failed to receive message from ${senderDIDDoc.getIdentifier()} : ${message}`);

                        console.log(`${receiverDIDDoc.getIdentifier()} received message from ${senderDIDDoc.getIdentifier()}`); 
                        console.log(decMessage); 
                        
                        finishTest();
                    })
                });
            });   
        });

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
