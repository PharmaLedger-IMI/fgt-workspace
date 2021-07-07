process.env.NO_LOGS = true;

const path = require('path');

require(path.join('../../privatesky/psknode/bundles', 'openDSU.js'));       // the whole 9 yards, can be replaced if only

let domains = ['traceability'];
let testName = 'Shipment Update Test';

const {create} = require('../../bin/environment/setupEnvironment');
const {APPS, getCredentials} = require('../../bin/environment/credentials/credentials3')

const wizard = require('../../fgt-dsu-wizard');
const {Order, Shipment, utils, ShipmentLine, OrderLine, ShipmentStatus} = wizard.Model;
const {getIssuedOrderManager, getIssuedShipmentManager, getReceivedOrderManager, getReceivedShipmentManager} = wizard.Managers;
const {ShipmentService} = wizard.Services;

const defaultOps = {
    batchCount: 11,
    serialQuantity: 100,
    expiryOffset: 100,
    trueStock: false,
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
    create(Object.assign({app: APPS.MAH}, defaultOps), (err, mah) => {
        if (err)
            return callback(err);
        getReceivedOrderManager(mah.manager, (err) => {
            if (err)
                return callback(err);
            getIssuedShipmentManager(mah.manager, (err) => {
                if (err)
                    return callback(err);
                create({app: APPS.WHOLESALER}, getCredentials(APPS.WHOLESALER), (err, wholesaler) => {
                    if (err)
                        return callback(err);
                    getIssuedOrderManager(mah.manager, (err) => {
                        if (err)
                            return callback(err);
                        getReceivedShipmentManager(mah.manager, (err) => {
                            if (err)
                                return callback(err);
                            create({app: APPS.WHOLESALER}, getCredentials(APPS.WHOLESALER), (err, wholesaler) => {
                                if (err)
                                    return callback(err);
                                callback(undefined, mah, wholesaler);
                            });
                        });
                    })
                });
            });
        })
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
    getIssuedShipmentManager(mah.manager, (err, issuedShipmentManager) => {
        if (err)
            return callback(err);
        const shipment = genShipment(order, mah)
        issuedShipmentManager.create(order.orderId, shipment, (err, sReadSSI, dbPath) => {
            if (err)
                return callback(err);
            callback(undefined, shipment, shipmentSSI, issuedShipmentManager);
        });
    });
}

const updateShipment = function(shipment, issuedShipmentManager, callback){
    if (ShipmentStatus.CREATED === shipment.status)
        shipment.status = ShipmentStatus.PICKUP;
    issuedShipmentManager.update(shipment, callback)
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
            makeShipment(mah, order, orderSSI, (err, shipment, shipmentSSI, issuedShipmentManager) => {
                if (err)
                    throw err;
                console.log(`shipment created`, shipment, shipmentSSI);
                setTimeout(() => {
                    updateShipment(shipment, issuedShipmentManager, (err) => {
                        if (err)
                            throw err;
                        console.log(`shipment updated`, shipment, shipmentSSI);
                        testFinished()
                    })
                }, 1000);
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



