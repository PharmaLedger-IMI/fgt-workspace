process.env.NO_LOGS = true;

const path = require('path');

require(path.join('../../privatesky/psknode/bundles', 'openDSU.js'));       // the whole 9 yards, can be replaced if only
const dt = require('./../../pdm-dsu-toolkit/services/dt');
const { getIssuedOrderManager, getParticipantManager, getReceivedOrderManager, getStockManager } = require('../../fgt-dsu-wizard/managers');
const { impersonateDSUStorage, argParser, instantiateSSApp } = require('./utils');

const { APPS } = require('./credentials/credentials');

const defaultOps = {
    app: "fgt-wholesaler-wallet",
    pathToApps: "../../",
    id: undefined
}

let conf = argParser(defaultOps, process.argv);
//
// /*
//  * jpsl: To discuss wit Tiago.
//  * Process all pending ReceivedOrders and ReceivedShipments messages.
//  * NO NEED TO CALL if setup was called first, and setup has an
//  * receivedOrderManager/receivedShippmentManager listening for messages.
//  *
//  * @param {ParticipantManager} participantManager
//  * @param {function(err)} callback
//  */
// const processOrders = function (participantManager, callback) {
//
//     // NOT NEEDED. If a receivedOrderManager is already instantiated, itlistening to events.
//     /*
//     const receivedOrderManager = getReceivedOrderManager(participantManager, true); // force a new instance
//     receivedOrderManager.processMessages(callback);
//     */
//     // Just give some time for it to process messages.
//     setTimeout(() => { callback(); }, 1000);
// }

const setup = function(participantManager, stocks, callback){
    if (!callback){
        callback = stocks;
        stocks = undefined;
    }

    getStockManager(participantManager, true, (err, stockManager) => {
        if (err)
            return callback(err);
        participantManager.stockManager = stockManager;
        participantManager.receivedOrderManager = getReceivedOrderManager(participantManager, true); // will handle incoming messages. just to keep the reference and ensure its instantiated and listening

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

const create = function(credentials, callback){
    instantiateSSApp(APPS.WHOLESALER, conf.pathToApps, dt, credentials, (err, walletSSI, walletDSU, credentials) => {
        if (err)
            throw err;
        const dsuStorage = impersonateDSUStorage(walletDSU.getWritableDSU());
        getParticipantManager(dsuStorage, true, (err, participantManager) => {
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




