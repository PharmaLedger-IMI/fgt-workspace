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
let testName = 'BatchServiceTest' // no spaces please. its used as a folder name

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
const {Batch, utils} = Model;
const {BatchService} = Services;


const getItem = function(){
    const serials = Array.from(new Array(100).keys())
        .map(n => utils.generateGtin())
    return new Batch({
        batchNumber: utils.generateBatchNumber(),
        expiry: utils.genDate(100),
        serialNumbers: serials,
        quantity: serials.length
    });
}

const testCreate = function(gtin, batch, batchService, callback){
    console.log(`Trying to create Batch`, batch);
    batchService.create(gtin, batch, (err, keySSI) => {
        if (err)
            return callback(err);
        assert.true(!!keySSI && typeof keySSI === "object");
        console.log(`Batch created with SSI: ${keySSI.getIdentifier()}`);
        callback(undefined, keySSI);
    });
}

const testGet = function(keySSI, batch, batchService, callback){
    console.log(`Trying to read product from SSI: ${keySSI.getIdentifier()}`);
    batchService.get(keySSI, (err, batchFromSSI) => {
        if (err)
            return callback(err);
        assert.true(!!batchFromSSI && typeof batchFromSSI === "object" && batchFromSSI instanceof Batch);
        assert.true(utils.isEqual(batch, batchFromSSI));
        console.log(`Batch from SSI: ${keySSI.getIdentifier()}:`, batchFromSSI);
        callback(undefined, batchFromSSI);
    });
}

const testUpdate = function(keySSI, batch, batchService, callback){
    console.log(`Trying to update product from SSI: ${keySSI.getIdentifier()}`);
    batchService.update(keySSI, batch, (err, updatedBatch) => {
        assert.true(!!err);
        console.log(`Batch from SSI: ${keySSI.getIdentifier()} cannot be updated`);
        callback();
    });
}

const runTest = function(callback){

    const batchService = new BatchService(domain);
    const batch = getItem();
    const gtin = utils.generateGtin();

    testCreate(gtin, batch, batchService, (err, keySSI) => {
        if (err)
            return callback(err);
        testGet(keySSI, batch, batchService, (err, batchFromSSI) => {
            if (err)
                return callback(err);
            testUpdate(keySSI, batchFromSSI, batchService, (err) => {
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


