process.env.NO_LOGS = true;

const path = require('path');

require(path.join('../../privatesky/psknode/bundles', 'openDSU.js'));       // the whole 9 yards, can be replaced if only
const dt = require('../../pdm-dsu-toolkit/services/dt');
const getReceivedOrderManager = require("../../fgt-dsu-wizard/managers/ReceivedOrderManager");
const { getParticipantManager, getIssuedOrderManager, getStockManager, getReceivedShipmentManager, getSaleManager } = require('../../fgt-dsu-wizard/managers');
const { Order, OrderLine } = require('../../fgt-dsu-wizard/model');
const { generateRandomInt, impersonateDSUStorage, argParser, instantiateSSApp } = require('./utils');
const submitEvent = require('./listeners/eventHandler');
const { APPS } = require('./credentials/credentials3');
const {ROLE} = require("../../fgt-dsu-wizard/model/DirectoryEntry");
const orderInitiator = require('./listeners/orderInitiator');

const defaultOps = {
    app: "fgt-pharmacy-wallet",
    pathToApps: "../../",
    id: undefined
}

let conf = argParser(defaultOps, process.argv);

const setupStock = function(participantManager, stocks, callback){
    if (!callback){
        callback = stocks;
        stocks = undefined;
    }

    const stockManager = participantManager.getManager("StockManager");

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
                    getSaleManager(participantManager, (err) => {
                        if (err)
                            return callback(err);
                        callback();
                    });
                });
            });
        });
    });
}

const attachLogic = function(participantManager, conf, products, batches, wholesalers, stocksObj, callback){
    if (!conf.attachLogic)
        return callback();
    try{
        const orderListener = require('./listeners/orderListener').orderListener(participantManager, conf.statusUpdateTimeout);
        const receivedOrderManager = participantManager.getManager("ReceivedOrderManager");
        receivedOrderManager.registerMessageListener(orderListener);

        const shipmentListener = require('./listeners/shipmentListener').shipmentListener(participantManager, batches, conf.statusUpdateTimeout);
        const receivedShipmentManager = participantManager.getManager("ReceivedShipmentManager");
        receivedShipmentManager.registerMessageListener(shipmentListener);
        submitEvent(conf);
    } catch (e) {
        return callback(e);
    }

    callback();
}


const setup = function (conf, participantManager, products, batches, wholesalers, stocks, callback) {
    setupStock(participantManager, stocks, (err, stocksObj) => {
        if (err)
            return callback(err);
        setupManager(participantManager, (err) => {
            if (err)
                return callback(err);
            attachLogic(participantManager, conf,  products, batches, wholesalers, stocks, (err) => {
                if (err)
                    return callback(err);
                orderInitiator(conf, participantManager, products, stocksObj, batches, wholesalers, callback);
            });
        });
    });
};

const create = function (credentials, callback) {
    instantiateSSApp(APPS.PHARMACY, conf.pathToApps, dt, credentials, (err, walletSSI, walletDSU, credentials) => {
        if (err)
            return callback(err);
        const dsuStorage = impersonateDSUStorage(walletDSU.getWritableDSU());
        getParticipantManager(dsuStorage, true,(err, participantManager) => {
            if (err)
                return callback(err);
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




