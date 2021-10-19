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
let testName = 'Utils test';

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
    fakeServer: false,
    useCallback: true
}

const TEST_CONF = argParser(defaultOps, process.argv);

const {functionCallIterator} = require('../../../pdm-dsu-toolkit/services/utils');
const {isEqual} = require('../../test-utils');

const testFunctionCallIterator = function(callback){

    const testFunction1 = function(arg1, arg2, callback){
        assert.true(parseInt(arg1) * 2 === arg2);
        callback(undefined, arg1, arg2);
    }

    const testFunction2 = function (arg1, arg2, arg3, callback){
        assert.true(parseInt(arg1) * 2 === arg2);
        assert.true(parseInt(arg1) * 4 === arg3);
        callback(undefined, arg1, arg2, arg3);
    }

    const keys = [1,2,3,4,5,6,7,8,9,10];

    const args1 = keys.map(k => k + '');
    const args2 = keys.map(k => 2 * k);
    const args3 = args2.map(a => 2 * a);

    functionCallIterator(testFunction1, args1.slice(), args2.slice(), (err, ...results) => {
        assert.true(!err);
        assert.true(isEqual(results[0], args1));
        assert.true(isEqual(results[1], args2));

        functionCallIterator(testFunction2, args1.slice(), args2.slice(), args3.slice(), (err, ...results) => {
            assert.true(!err);
            assert.true(isEqual(results[0], args1));
            assert.true(isEqual(results[1], args2));
            assert.true(isEqual(results[2], args3));
            callback();
        });
    });

}


const runTest = function(callback){

    testFunctionCallIterator((err) =>{
        if (err)
            return callback(err);
        callback(undefined);
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


