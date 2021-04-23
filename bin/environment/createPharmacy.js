process.env.NO_LOGS = true;

const path = require('path');

require(path.join('../../privatesky/psknode/bundles', 'openDSU.js'));       // the whole 9 yards, can be replaced if only
const dt = require('../../pdm-dsu-toolkit/services/dt');
const { getParticipantManager, getIssuedOrderManager } = require('../../fgt-dsu-wizard/managers');
const { Order, OrderLine } = require('../../fgt-dsu-wizard/model');
const { generateRandomInt, impersonateDSUStorage, argParser, instantiateSSApp } = require('./utils');

const { APPS } = require('./credentials/credentials');

const defaultOps = {
    app: "fgt-pharmacy-wallet",
    pathToApps: "../../",
    id: undefined
}

let conf = argParser(defaultOps, process.argv);


// aux functions
const _createIssuedOrder = function (issuedOrderManager, products, wholesaler, callback) {
    issuedOrderManager.newBlank((err, order) => {
        if (err)
            return callback(err);
        order.senderId = wholesaler.id.secret;
        // random number of order lines, one for each gtin
        const randomProductIndex = generateRandomInt(1, products.length); // there must be at least 1 product
        for (let productIndex = 0 ; productIndex < randomProductIndex ; productIndex++) {
            const product = products[productIndex];
            const quantity = generateRandomInt(1, 10);
            const orderLine = new OrderLine(product.gtin, quantity, order.requesterId, order.senderId);
            order.orderLines.push(orderLine);
        }
        //console.log("Creating order", order);
        issuedOrderManager.create(order, (err, keySSI) => {
            if (err)
                return callback(err);
            callback(undefined, order);
        });
    });
};

const _createManyIssuedOrders = function (countdown, issuedOrderManager, products, wholesaler, issuedOrders, receivedShipments, callback) {
    if (countdown > 0) {
        _createIssuedOrder(issuedOrderManager, products, wholesaler, (err, order) => {
            if (err)
                return callback(err);
            issuedOrders.push(order);
            _createManyIssuedOrders(countdown-1, issuedOrderManager, products, wholesaler, issuedOrders, receivedShipments, callback);
        });
    } else {
        callback(undefined, issuedOrders, receivedShipments);
    }
};

const setup = function (participantManager, products, wholesalers, stocks, callback) {
    // TODO move this to a function that generates issuedOrders ?
    const issuedOrderManager = getIssuedOrderManager(participantManager, true);

    if (products.length <=0)
        return callback("Products has zero length.");
    if (wholesalers.length <=0)
        return callback("Wholesalers has zero length.");
    
    const wholesaler0 = wholesalers[0];

    let issuedOrders = [];
    let receivedShipments = [];
    
    // 20 orders on first wholesaler
    _createManyIssuedOrders(20, issuedOrderManager, products, wholesaler0, issuedOrders, receivedShipments, (err) => {
        callback(err, issuedOrders, receivedShipments);
    });
};

const create = function (credentials, callback) {
    instantiateSSApp(APPS.PHARMACY, conf.pathToApps, dt, credentials, (err, walletSSI, walletDSU, credentials) => {
        if (err)
            throw err;
        const dsuStorage = impersonateDSUStorage(walletDSU.getWritableDSU());
        getParticipantManager(dsuStorage, true,(err, participantManager) => {
            if (err)
                throw err;
            console.log(`${conf.app} instantiated\ncredentials:`);
            console.log(credentials)
            console.log(`ID: ${credentials.id.secret}`);
            console.log(`SSI: ${walletSSI}`);
            callback(undefined, credentials, walletSSI, participantManager);
        });
    });
}

module.exports = {
    create,
    setup
};




