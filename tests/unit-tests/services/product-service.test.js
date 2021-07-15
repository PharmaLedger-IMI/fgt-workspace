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
let testName = 'ProductServiceTest';

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

const {ProductService} = Services;
const {Product, utils} = Model;


const getProduct = function(){
    return new Product({
        gtin: utils.generateGtin(),
        name: utils.generateProductName(),
        description: 'description',
        manufName: 'irrelevant for this test'
    });
}

const testCreate = function(product, productService, callback){
    console.log(`Trying to create product`);
    productService.create(product, (err, keySSI) => {
        if (err)
            return callback(err);
        assert.true(!!keySSI && typeof keySSI === "object");
        console.log(`product created with SSI: ${keySSI.getIdentifier()}`);
        callback(undefined, keySSI);
    });
}

const testGet = function(keySSI, product, productService, callback){
    console.log(`Trying to read product from SSI: ${keySSI.getIdentifier()}`);
    productService.get(keySSI, (err, productFromSSI) => {
        if (err)
            return callback(err);
        assert.true(!!productFromSSI && typeof productFromSSI === "object" && productFromSSI instanceof Product);
        assert.true(utils.isEqual(product, productFromSSI));
        console.log(`Product from SSI: ${keySSI.getIdentifier()}:`, product);
        callback(undefined, productFromSSI);
    });
}

const testUpdate = function(keySSI, product, productService, callback){
    console.log(`Trying to update product from SSI: ${keySSI.getIdentifier()}`);
    productService.update(keySSI, product, (err, updatedProduct) => {
        assert.true(!!err);
        console.log(`Product from SSI: ${keySSI.getIdentifier()} cannot be updated`);
        callback();
    });
}



const runTest = function(callback){

    const productService = new ProductService(domain);
    const product = getProduct();

    testCreate(product, productService, (err, keySSI) => {
        if (err)
            return callback(err);
        testGet(keySSI, product, productService, (err, productFromSSI) => {
            if (err)
                return callback(err);
            productFromSSI.name = "newName";
            testUpdate(keySSI, productFromSSI, productService, (err) => {
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


