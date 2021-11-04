//process.exit(0) // ignore the template in tests....

process.env.NO_LOGS = true;
process.env.PSK_CONFIG_LOCATION = process.cwd();

const path = require('path');

const test_bundles_path = path.join('../../privatesky/psknode/bundles', 'testsRuntime.js');
require(test_bundles_path);
// const psk_bundles_path = path.join('../../privatesky/psknode/bundles', 'openDSU.js');
// require(psk_bundles_path);
const {argParser} = require('../../bin/environment/utils');

const dc = require("double-check");
const assert = dc.assert;
const tir = require("../../privatesky/psknode/tests/util/tir");

let domain = 'traceability';
let testName = 'ApiBootTest' // no spaces please. its used as a folder name

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
        serverConfig: {
            activeComponents: [
                "virtualMQ",
                "messaging",
                "notifications",
                "filesManager",
                "bdns",
                "bricksLedger",
                "bricksFabric",
                "bricking",
                "anchoring",
                "fgt-api",
                "staticServer"
            ],
            componentsConfig: {
                "fgt-api": {
                    "module": "./../../fgt-api/participants/mah",
                    "function": "init"
                },
                "bricking": {},
                "anchoring": {}
            },
        },
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
    fakeServer: false,
    useCallback: true
}

const TEST_CONF = argParser(defaultOps, process.argv);


const runTest = function(callback){
    callback();
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


