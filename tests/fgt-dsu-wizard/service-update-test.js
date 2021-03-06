process.env.NO_LOGS = true;
process.env.PSK_CONFIG_LOCATION = process.cwd();

const path = require('path');

const test_bundles_path = path.join('../../privatesky/psknode/bundles', 'testsRuntime.js');
require(test_bundles_path);
const {argParser} = require('../../bin/environment/utils');

const dc = require("double-check");
const assert = dc.assert;
const tir = require("../../privatesky/psknode/tests/util/tir");

let domain = 'default';
let testName = 'OrderServiceTest'

const defaultOps = {
    timeout: 250000,
    fakeServer: true,
    useCallback: false
}

const TEST_CONF = argParser(defaultOps, process.argv);

const getOrder = function(Model){
    const {utils, Order, OrderStatus} = Model;

    const requesterId = 'requesterId';
    const senderId = 'senderId';
    const shipToAddress = 'shipToAddress';
    const status = OrderStatus.CREATED

    return new Order('Order' + Math.floor(Math.random() * 100), requesterId, senderId, shipToAddress, status, [
        {
            gtin: utils.generateGtin(),
            quantity: Math.floor(Math.random() * 100),
            senderId: senderId,
            requesterId: requesterId,
            status: status
        },
        {
            gtin: utils.generateGtin(),
            quantity: Math.floor(Math.random() * 100),
            senderId: senderId,
            requesterId: requesterId,
            status: status
        }
    ])

}

const getShipment = function(Model, order, orderSSI){
    const {Shipment, ShipmentStatus, utils} = Model;

    const {requesterId, senderId, shipToAddress} = order;
    const status = ShipmentStatus.CREATED
    const shipment =  new Shipment('Shipment' + Math.floor(Math.random() * 100), requesterId, senderId, shipToAddress, status, [
        {
            gtin: utils.generateGtin(),
            batch: utils.generateBatchNumber(),
            quantity: Math.floor(Math.random() * 100),
            senderId: senderId,
            requesterId: requesterId,
            status: status
        },
        {
            gtin: utils.generateGtin(),
            batch: utils.generateBatchNumber(),
            quantity: Math.floor(Math.random() * 100),
            senderId: senderId,
            requesterId: requesterId,
            status: status
        }
    ]);
    shipment.orderSSI = orderSSI;
    return shipment;
}

const testShipmentLineStatus = function(shipmentLineService, keySSI, status, callback){
    console.log(`Getting ShipmentLine with SSI: ${keySSI}`)
    return shipmentLineService.get(keySSI, (err, shipmentLine) => {
        if (err)
            return callback(err);
        console.log(`Testing ShipmentLine Status ${status} vs ${shipmentLine.status}. They should be the same`);
        try {
            assert.true(status === shipmentLine.status);
        } catch(e) {
            return callback(e);
        }

        return callback()
    });
}

const testShipmentStatus = function(services, keySSI, status, callback){
    const {shipmentService, shipmentLineService} = services;
    return shipmentService.get(keySSI, (err, shipment, shipmentDSU, orderId, linesSSIs) => {
        if (err)
            return callback(err);
        console.log(`Testing Shipment Status ${status} vs ${shipment.status}. They should be the same`);
        try{
            assert.true(status === shipment.status);
        }catch(e){
            return callback(e);
        }


        const shipmentLineIterator = function(lines, callback){
            const line = lines.shift();
            if (!line)
                return callback();
            return testShipmentLineStatus(shipmentLineService, line, status, (err) => err
                    ? callback(err)
                    : shipmentLineIterator(lines, callback));
        }

        return shipmentLineIterator(linesSSIs.slice(), callback);
    });
}

const loadDependencies = function(){
    const wizard = require('../../fgt-dsu-wizard');
    const {ShipmentService, ShipmentLineService, StatusService, OrderService} = wizard.Services;

    const orderService = new OrderService(domain);
    const shipmentService = new ShipmentService(domain);
    const shipmentLineService = new ShipmentLineService(domain);
    const statusService = new StatusService(domain);
    return {
        Services: wizard.Services,
        Model: wizard.Model,
        services: {
            orderService,
            shipmentService,
            shipmentLineService,
            statusService
        }
    }
}

const runTest = function(callback){

    const {Model, services} = loadDependencies();
    const order = getOrder(Model);
    const {orderService, shipmentService} = services;
    const {ShipmentStatus} = Model;

    orderService.create(order, (err, orderSSI) => {
        if (err)
            return callback(err);
        orderSSI = orderSSI.derive();
        const shipment = getShipment(Model, order, orderSSI);
        shipmentService.create(shipment, orderSSI.getIdentifier(), (err, shipmentSSI, linesSSIs, statusSSI) => {
            if (err)
                return callback(err);
            testShipmentStatus(services, shipmentSSI, ShipmentStatus.CREATED, (err) => {
                if (err)
                    return callback(err);
                shipment.status = ShipmentStatus.PICKUP;
                console.log(shipmentSSI.getIdentifier());
                shipmentService.update(shipmentSSI, shipment, shipment.senderId, (err) => {
                    if (err)
                        return callback(err);
                    testShipmentStatus(services, shipmentSSI, ShipmentStatus.PICKUP, (err) => {
                        if (err)
                            return callback(err);
                        callback();
                    });
                })
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
        tir.launchVirtualMQNode((err, port) => {
            if (err)
                return callback(err);
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






