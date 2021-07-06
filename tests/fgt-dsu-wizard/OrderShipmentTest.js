process.env.NO_LOGS = true;
process.env.PSK_CONFIG_LOCATION = process.cwd();

const path = require('path');

require(path.join('../../privatesky/psknode/bundles', 'openDSU.js'));       // the whole 9 yards, can be replaced if only

let domains = ['traceability'];
let testName = 'OrderShipment Test';

const {create} = require('../../bin/environment/setupEnvironment');
const {APPS, getCredentials} = require('../../bin/environment/credentials/credentials3')

const wizard = require('../../fgt-dsu-wizard');
const {Order, Shipment, utils, ShipmentLine, OrderLine, ShipmentStatus} = wizard.Model;
const {getIssuedOrderManager, getIssuedShipmentManager, getReceivedOrderManager, getReceivedShipmentManager} = wizard.Managers;
const {ShipmentService} = wizard.Services;

const defaultOps = {
    timeout: 3000,
    fakeServer: true
}

const argParser = function(args){
    let config = JSON.parse(JSON.stringify(defaultOps));
    if (!args)
        return config;
    args = args.slice(2);
    const recognized = Object.keys(config);
    const notation = recognized.map(r => '--' + r);
    args.forEach(arg => {
        if (arg.includes('=')){
            let splits = arg.split('=');
            if (notation.indexOf(splits[0]) !== -1)
                config[splits[0].substring(2)] = eval(splits[1]);
        }
    });
    return config;
}

const genOrder = function(mah, wholesaler){
    const requesterId = wholesaler.id.secret;
    const senderId = mah.id.secret;

    const getOrderLine = function(){
        const ol = new OrderLine(utils.generateGtin(), Math.floor(Math.random() * 100), requesterId, senderId);
        ol.status = ShipmentStatus.CREATED;
        return ol;
    }
    const orderLines = Array.from(new Array(10).keys())
        .map(n => getOrderLine());

    return new Order(Date.now(), requesterId, senderId, wholesaler.address.secret, undefined, orderLines);
}

const genShipment = function(order, mah){
    const genShipmentLine  = function(ol){
        return new ShipmentLine({
            gtin: ol.gtin,
            batch: utils.generateBatchNumber(),
            quantity: Math.floor(Math.random() * 100),
            senderId: ol.senderId,
            requesterId: ol.requesterId,
            status: ShipmentStatus
        })
    }

    const shipmentLines = order.orderLines.map(genShipmentLine);
    const shipment = new Shipment(Date.now(), order.requesterId, order.senderId, order.shipToAddress, undefined, shipmentLines);
    shipment.shipFromAddress = mah.credentials.address.secret;
    return shipment;
}

const getParticipants = function(callback){
    create({app: APPS.MAH}, getCredentials(APPS.MAH), (err, mah) => {
        if (err)
            return callback(err);
        create({app: APPS.WHOLESALER}, getCredentials(APPS.WHOLESALER), (err, wholesaler) => {
            if (err)
                return callback(err);
            callback(undefined, mah, wholesaler);
        });
    });
}

const makeOrder = function(wholesaler, mah, callback){
    getIssuedOrderManager(wholesaler.manager, (err, issuedOrderManager) => {
        if (err)
            throw err;

        const order = genOrder(mah.credentials, wholesaler.credentials);
        issuedOrderManager.create(order, (err, orderSSI, orderPath) => {
            if (err)
                throw err;
            callback(undefined, order, orderSSI, issuedOrderManager);
        });
    });
}

const makeShipment = function(mah, order, orderSSI, callback){
    const shipmentService = new ShipmentService(domains[0]);
    const shipment = genShipment(order, mah);
    shipmentService.create(shipment, orderSSI, (err, shipmentSSI, shipmentLinesSSI) => {
        if (err)
            return callback(err);
        callback(undefined, shipment, shipmentSSI);
    });
}

const updateOrder = function(order, shipment, shipmentSSI, issuedOrderManager, callback){
    issuedOrderManager.updateOrderByShipment(order.orderId, shipmentSSI.getIdentifier(), shipment, (err) => {
        if (err)
            return callback(err);
        callback();
    })
}

let conf = argParser(process.argv);

const runTest = function(testFinished){
    getParticipants((err, mah, wholesaler) => {
        if (err)
            throw err;
        console.log(`participants created`, mah, wholesaler)
        makeOrder(wholesaler, mah, (err, order, orderSSI, issuedOrderManager) => {
            if (err)
                throw err;
            console.log(`order created`, order, orderSSI)
            makeShipment(mah, order, orderSSI, (err, shipment, shipmentSSI) => {
                if (err)
                    throw err;
                console.log(`shipment created`, shipment, shipmentSSI);
                console.log(`trying to update order`)
                updateOrder(order, shipment, shipmentSSI, issuedOrderManager, err => {
                    if (err)
                        throw err;
                    testFinished()
                });
            });
        });
    });
}

runTest(() => {
    console.log(`Test ${testName} finished`);
    setTimeout(() => {
        process.exit(0);
    }, 1000)

});



