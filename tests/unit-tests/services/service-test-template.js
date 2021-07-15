process.exit(0) // ignore the template in tests....

process.env.NO_LOGS = true;
process.env.PSK_CONFIG_LOCATION = process.cwd();

const path = require('path');

const test_bundles_path = path.join('../../../privatesky/psknode/bundles', 'testsRuntime.js');
require(test_bundles_path);
const {argParser} = require('../../../bin/environment/utils');

const dc = require("double-check");
const assert = dc.assert;
const tir = require("../../../privatesky/psknode/tests/util/tir");

let domain = 'traceability';
let testName = 'ServiceTest' // no spaces please. its used as a folder name

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
        ],
    }
}


const defaultOps = {
    timeout: 250000,
    fakeServer: true,
    useCallback: true
}

const TEST_CONF = argParser(defaultOps, process.argv);

const wizard = require('../../../fgt-dsu-wizard');
const {Services, Model} = wizard;


const getItem = function(){
    return {};
}

const testCreate = function(item, itemService, callback){
    console.log(`Trying to create item`);
}

const testGet = function(keySSI, item, itemService, callback){
    console.log(`Trying to read product from SSI: ${keySSI.getIdentifier()}`);
}

const testUpdate = function(keySSI, item, itemService, callback){
    console.log(`Trying to update product from SSI: ${keySSI.getIdentifier()}`);
}



const runTest = function(callback){

    const itemService = {}
    const object = {};

    testCreate(object, itemService, (err, keySSI) => {
        if (err)
            return callback(err);
        testGet(keySSI, object, itemService, (err, itemFromSSI) => {
            if (err)
                return callback(err);
            testUpdate(keySSI, itemFromSSI, itemService, (err) => {
                if (err)
                    return callback(err);
                callback();
            });
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


