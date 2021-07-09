process.env.NO_LOGS = true;
process.env.PSK_CONFIG_LOCATION = process.cwd();

const path = require('path');

const test_bundles_path = path.join('../../privatesky/psknode/bundles', 'testsRuntime.js');
require(test_bundles_path);

const dc = require("double-check");
const assert = dc.assert;
const tir = require("../../privatesky/psknode/tests/util/tir");

let domain = 'default';
let testName = 'OrderServiceTest'


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
    shipmentLineService.get(keySSI, (err, shipmentLine) => {
        if (err)
            return callback(err);
        assert.true(status === shipmentLine.status);
        callback()
    });
}

const testShipmentStatus = function(services, keySSI, status, callback){
    const {shipmentService, shipmentLineService} = services;
    shipmentService.get(keySSI, (err, shipment, shipmentDSU, orderId, linesSSIs) => {
        if (err)
            return callback(err);
        assert.true(status === shipment.status);

        const shipmentLineIterator = function(lines, callback){
            const line = lines.shift();
            if (!line)
                return callback();
            testShipmentLineStatus(shipmentLineService, line, status, (err) => err
                    ? callback(err)
                    : shipmentLineIterator(lines, callback));
        }

        shipmentLineIterator(linesSSIs.slice(), callback);
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
        shipmentService.create(shipment, orderSSI, (err, shipmentSSI, linesSSIs, statusSSI) => {
            if (err)
                return callback(err);
            testShipmentStatus(services, shipmentSSI, ShipmentStatus.CREATED, (err) => {
                if (err)
                    return callback(err);
                shipment.status = ShipmentStatus.PICKUP;
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

const testFinishCallback = function(){
    console.log(`Test finished. Quitting...`);
    setTimeout(() => {
        process.exit(0);
    }, 1000)

}

// assert.callback(testName, (testFinishCallback) => {
    // dc.createTestFolder(testName, (err, folder) => {
    //     tir.launchApiHubTestNode(10, folder, err => {
    tir.launchVirtualMQNode((err, port) => {
        if (err)
            throw err;
        runTest((err) => {
            if (err)
                throw err;
            testFinishCallback();
        });
    });
// }, 25000)


