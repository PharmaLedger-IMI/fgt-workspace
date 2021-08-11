process.env.NO_LOGS = true;

const path = require('path');

require(path.join('../../privatesky/psknode/bundles', 'openDSU.js'));       // the whole 9 yards, can be replaced if only
const dt = require('../../pdm-dsu-toolkit/services/dt');
const getReceivedOrderManager = require("../../fgt-dsu-wizard/managers/ReceivedOrderManager");
const { getParticipantManager, getIssuedOrderManager, getStockManager, getReceivedShipmentManager } = require('../../fgt-dsu-wizard/managers');
const { Order, OrderLine } = require('../../fgt-dsu-wizard/model');
const { generateRandomInt, impersonateDSUStorage, argParser, instantiateSSApp } = require('./utils');

const { APPS } = require('./credentials/credentials3');
const {ROLE} = require("../../fgt-dsu-wizard/model/DirectoryEntry");

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

const setupStock = function(participantManager, stocks, callback){
    if (!callback){
        callback = stocks;
        stocks = undefined;
    }

    getStockManager(participantManager, true, (err, stockManager) => {
        if (err)
            return callback(err);

        stocks = stocks || require('./stocks/stocksRandomFromProducts').getStockFromProductsAndBatchesObj(20);

        const stockIterator = function(stocksCopy){
            const stock = stocksCopy.shift();
            if (!stock){
                console.log(`${stocks.length} stock created`);
                return callback(undefined, stocks);
            }
            stockManager.create(stock, (err, keySSI, path) => {
                if (err)
                    return callback(err);
                stockIterator(stocksCopy, callback);
            });
        }

        stockIterator(stocks.slice(), (err, stocksObj) => {
            if (err)
                return callback(err);
            const output = [];
            Object.keys(stocksObj).forEach(gtin => {
                output.push(`The following batches per gtin have been created:\nGtin: ${gtin}\nBatches: ${stocksObj[gtin].join(', ')}`);
            });
            console.log(output.join('\n'));
            callback(undefined, stocksObj);
        })
    });
}

const setupManager = function(participantManager, callback){
    getReceivedOrderManager(participantManager,  (err, receivedOrderManager) => {
        if (err)
            return callback(err);
        getReceivedShipmentManager(participantManager, (err, receivedShipmentManager) => {
            if (err)
                return callback(err);
            getIssuedOrderManager(participantManager, (err, issuedOrderManager) => {
                if (err)
                    return callback(err);
                getReceivedOrderManager(participantManager, (err, receivedOrderManager) => {
                    if (err)
                        return callback(err);
                    callback();
                });
            });
        });
    });
}

const issueOrders = function(products, wholesalers, stocksObj, issuedOrderManager, callback){
    if (products.length <=0)
        return callback("Products has zero length.");
    if (wholesalers.length <=0)
        return callback("Wholesalers has zero length.");

    const wholesaler0 = wholesalers[0];

    let issuedOrders = [];
    let receivedShipments = [];

    // 20 orders on first wholesaler
    _createManyIssuedOrders(2, issuedOrderManager, products, wholesaler0, issuedOrders, receivedShipments, (err) => {
        callback(err, issuedOrders, receivedShipments, stocksObj);
    });
}

const attachLogic = function(participantManager, conf, callback){
    if (!conf.attachLogic)
        return callback();
    try{
        const orderListener = require('./listeners/orderListener')(participantManager, ROLE.PHA, conf.statusUpdateTimeout);
        const receivedOrderManager = participantManager.getManager("ReceivedOrderManager");
        receivedOrderManager.registerMessageListener(orderListener);

        const shipmentListener = require('./listeners/shipmentListener')(participantManager, ROLE.PHA, conf.statusUpdateTimeout);
        const receivedShipmentManager = participantManager.getManager("ReceivedShipmentManager");
        receivedShipmentManager.registerMessageListener(shipmentListener);
    } catch (e) {
        return callback(e);
    }

    callback();
}


const setup = function (conf, participantManager, products, wholesalers, stocks, callback) {
    setupStock(participantManager, stocks, (err, stocksObj) => {
        if (err)
            return callback(err);
        setupManager(participantManager, (err) => {
            if (err)
                return callback(err);
            attachLogic(participantManager, conf, (err) => {
                if (err)
                    return callback(err);
                issueOrders(products, wholesalers, stocksObj, getIssuedOrderManager(participantManager), callback);
            });
        });
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




