process.env.NO_LOGS = true;

const path = require('path');

require(path.join('../../privatesky/psknode/bundles', 'openDSU.js'));       // the whole 9 yards, can be replaced if only
const dt = require('./../../pdm-dsu-toolkit/services/dt');
const getReceivedShipmentManager = require("../../fgt-dsu-wizard/managers/ReceivedShipmentManager");
const getIssuedShipmentManager = require("../../fgt-dsu-wizard/managers/IssuedShipmentManager");
const { getIssuedOrderManager, getParticipantManager, getReceivedOrderManager, getStockManager } = require('../../fgt-dsu-wizard/managers');
const { impersonateDSUStorage, argParser, instantiateSSApp } = require('./utils');
const submitEvent = require('./listeners/eventHandler');
const { APPS } = require('./credentials/credentials3');
const {ROLE} = require("../../fgt-dsu-wizard/model/DirectoryEntry");

const defaultOps = {
    app: "fgt-wholesaler-wallet",
    pathToApps: "../../",
    id: undefined
}

let conf = argParser(defaultOps, process.argv);

const setupManager = function(participantManager, callback){
    getReceivedOrderManager(participantManager,  (err, receivedOrderManager) => {
        if (err)
            return callback(err);
        getIssuedShipmentManager(participantManager, (err, issuedShipmentManager) => {
            if (err)
                return callback(err);
            getReceivedShipmentManager(participantManager, (err, orderLineManager) => {
                if (err)
                    return callback(err);
                getIssuedOrderManager(participantManager, (err, shipmentLineManager) => {
                    if (err)
                        return callback(err);
                    callback();
                });
            });
        });
    });
}

const setupStock = function(participantManager, stocks, callback){
    if (!callback){
        callback = stocks;
        stocks = undefined;
    }

    getStockManager(participantManager, true, (err, stockManager) => {
        if (err)
            return callback(err);


        stocks = stocks || require('./stocks/stocksRandomFromProducts').getStockFromProductsAndBatchesObj(80);

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

const attachLogic = function(participantManager, conf, callback){
    if (!conf.attachLogic)
        return callback();
    try {
        const orderListener = require('./listeners/orderListener').orderListener(participantManager, ROLE.WHS, conf.statusUpdateTimeout);
        const receivedOrderManager = participantManager.getManager("ReceivedOrderManager");
        receivedOrderManager.registerMessageListener(orderListener);

        const shipmentListener = require('./listeners/shipmentListener').shipmentListener(participantManager, ROLE.WHS, conf.statusUpdateTimeout);
        const receivedShipmentManager = participantManager.getManager("ReceivedShipmentManager");
        receivedShipmentManager.registerMessageListener(shipmentListener);
        submitEvent(conf);
    } catch (e) {
        return callback(e);
    }

    callback();
}

const setup = function(conf, participantManager, stocks, callback){
    setupStock(participantManager, stocks, (err, stocksObj) => {
        if (err)
            return callback(err);
        setupManager(participantManager, (err) => {
            if (err)
                return callback(err);
            attachLogic(participantManager, conf, (err) => {
                if (err)
                    return callback(err);
                callback(undefined, stocksObj);
            });
        });
    })
}

const create = function(credentials, callback){
    instantiateSSApp(APPS.WHOLESALER, conf.pathToApps, dt, credentials, (err, walletSSI, walletDSU, credentials) => {
        if (err)
            return callback(err);
        const dsuStorage = impersonateDSUStorage(walletDSU.getWritableDSU());
        getParticipantManager(dsuStorage, true, (err, participantManager) => {
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




