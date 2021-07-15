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
let testName = 'OrderServiceTest';

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

const {OrderService} = Services;
const {Order, OrderLine, OrderStatus, utils} = Model;


const getOrder = function(){
    const requesterId = 'requesterId';
    const senderId = 'senderId';
    const shipToAddress = 'address';
    return new Order(Date.now(), requesterId, senderId, shipToAddress, undefined, [
        {
            gtin: utils.generateGtin(),
            quantity: 100,
            requesterId: requesterId,
            senderId: senderId,
            status: OrderStatus.CREATED
        },
        {
            gtin: utils.generateGtin(),
            quantity: 100,
            requesterId: requesterId,
            senderId: senderId,
            status: OrderStatus.CREATED
        }
    ]);
}

const testCreate = function(order, orderService, callback){
    console.log(`Trying to create order`);
    orderService.create(order, (err, keySSI) => {
        if (err)
            return callback(err);
        assert.true(!!keySSI && typeof keySSI === "object");
        console.log(`order created with SSI: ${keySSI.getIdentifier()}`);
        callback(undefined, keySSI);
    });
}

const testGet = function(keySSI, order, orderService, callback){
    console.log(`Trying to read order from SSI: ${keySSI.getIdentifier()}`);
    orderService.get(keySSI, (err, orderFromSSI) => {
        if (err)
            return callback(err);
        assert.true(!!orderFromSSI && typeof orderFromSSI === "object" && orderFromSSI instanceof Order);
        assert.true(utils.isEqual(order, orderFromSSI));
        console.log(`Order from SSI: ${keySSI.getIdentifier()}:`, order);
        callback(undefined, orderFromSSI);
    });
}

const testUpdate = function(keySSI, order, orderService, callback){
    console.log(`Trying to update order from SSI: ${keySSI.getIdentifier()}`);
    const invalidOrderUpdate = new Order(order.orderId, order.requesterId, order.senderId, order.shipToAddress, order.status,
        order.orderLines.map((ol, i) => new OrderLine(i === 1 ? 'sdafsaf' : ol.gtin, ol.quantity, ol.requesterId, ol.senderId, OrderStatus.ACKNOWLEDGED)));

    const validOrderUpdate = new Order(order.orderId, order.requesterId, order.senderId, order.shipToAddress, OrderStatus.ACKNOWLEDGED,
        order.orderLines.map(ol => new OrderLine(ol.gtin, ol.quantity, ol.requesterId, ol.senderId, OrderStatus.ACKNOWLEDGED)));

    orderService.update(keySSI, invalidOrderUpdate, (err, updatedOrder) => {
        assert.true(!!err);
        console.log(`Order from SSI: ${keySSI.getIdentifier()} cannot be updated erroneoulsy`);

        orderService.update(keySSI, validOrderUpdate, (err, updatedOrder) => {
            assert.false(!!err);
            if (err)
                return callback(err)

            console.log(`Order from SSI: ${keySSI.getIdentifier()} updated successfully`, updatedOrder);
            callback();
        });
    });
}



const runTest = function(callback){

    const orderService = new OrderService(domain);
    const order = getOrder();

    testCreate(order, orderService, (err, keySSI) => {
        if (err)
            return callback(err);
        testGet(keySSI, order, orderService, (err, orderFromSSI) => {
            if (err)
                return callback(err);
            testUpdate(keySSI, orderFromSSI, orderService, (err) => {
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


