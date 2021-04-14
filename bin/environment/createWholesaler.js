process.env.NO_LOGS = true;

const path = require('path');

require(path.join('../../privatesky/psknode/bundles', 'openDSU.js'));       // the whole 9 yards, can be replaced if only
const dt = require('./../../pdm-dsu-toolkit/services/dt');
const { getParticipantManager, getStockManager, getBatchManager } = require('../../fgt-dsu-wizard/managers');
const { impersonateDSUStorage, argParser, instantiateSSApp } = require('./utils');
const {Stock, Product, Batch} = require('../../fgt-dsu-wizard/model');

const { getCredentials, APPS } = require('./credentials/credentials');

const defaultOps = {
    app: "fgt-wholesaler-wallet",
    pathToApps: "../../",
    id: undefined
}

let conf = argParser(defaultOps, process.argv);

const setup = function(participantManager, products, batches, stocks, callback){
    if (!callback){
        callback = stocks;
        stocks = undefined;
    }
    if (!callback){
        callback = batches;
        batches = undefined;
    }
    if (!callback) {
        callback = products;
        products = undefined;
    }

    products = products || require('./products/productsRandom');
    batches = products || require('./batches/batchesRandom');

    const stockManager = getStockManager(participantManager);

    stocks = stocks || [];
    if (!stocks){
        stocks = [];
        products.forEach((p, i) => {
            const stock = new Stock(p);
            stock.batches = batches[i];
            stock.batches.forEach(b => {
                b.quantity = Math.floor(Math.random() * 500) + 1;
            })
            stock.push(stock);
        });
    }

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
}

const create = function(credentials, callback){
    instantiateSSApp(conf.app, conf.pathToApps, dt, credentials, (err, walletSSI, walletDSU, credentials) => {
        if (err)
            throw err;
        const dsuStorage = impersonateDSUStorage(walletDSU.getWritableDSU());
        getParticipantManager(dsuStorage, (err, participantManager) => {
            if (err)
                throw err;

            console.log(`${conf.app} instantiated\ncredentials:`);
            console.log(credentials)
            console.log(`ID: ${credentials.id.secret}`);
            callback(undefined, credentials, walletSSI, participantManager);
        });
    });
}

module.exports = {
    create,
    setup
};




