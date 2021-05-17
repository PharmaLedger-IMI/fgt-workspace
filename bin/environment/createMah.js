process.env.NO_LOGS = true;

const path = require('path');

require(path.join('../../privatesky/psknode/bundles', 'openDSU.js'));       // the whole 9 yards, can be replaced if only
const dt = require('./../../pdm-dsu-toolkit/services/dt');
const { getParticipantManager, getProductManager, getBatchManager, getOrderLineManager, getShipmentLineManager } = require('../../fgt-dsu-wizard/managers');
const { impersonateDSUStorage, argParser, instantiateSSApp } = require('./utils');

const { APPS } = require('./credentials/credentials');

const defaultOps = {
    app: "fgt-mah-wallet",
    pathToApps: "../../",
    id: undefined,
    batchCount: 11,
    serialQuantity: 100,
    expiryOffset: 100
}

let conf = argParser(defaultOps, process.argv);

const setupProducts = function(participantManager, products, batches, callback){
    getProductManager(participantManager, true, (err, productManager) => {
        if (err)
            return callback(err);
        participantManager.productManager = productManager;
        products = products || require('./products/productsRandom')();
        const iterator = function(productsCopy, callback){
            const product = productsCopy.shift();
            if (!product){
                console.log(`${products.length} products created`);
                return callback(undefined, products);
            }
            productManager.create(product, (err, keySSI, path) => {
                if (err)
                    return callback(err);
                iterator(productsCopy, callback);
            });
        }
        iterator(products.slice(), callback);
    });
}

const setupBatches = function(participantManager, products, batches,  callback){
    getBatchManager(participantManager, true, (err, batchManager) => {
        if (err)
            return callback(err);
        participantManager.batchManager = batchManager;
        const getBatches = !batches
            ? function(gtin){
                return require('./batches/batchesRandom')(conf.batchCount, conf.serialQuantity, conf.expiryOffset);
            }
            : function(gtin){
                return batches[gtin + ''].slice();
            }

        const batchesObject = {};

        const productIterator = function(productsCopy, callback){
            const product = productsCopy.shift();
            if (!product)
                return callback(undefined, batchesObject);

            const pBatches = getBatches(product.gtin);

            const batchIterator = function(gtin, batchesCopy, callback){
                const batch = batchesCopy.shift();
                if (!batch){
                    console.log(`${pBatches.length} batches created for ${gtin}`);
                    return callback(undefined, pBatches);
                }
                batchManager.create(gtin, batch, (err, keySSI, path) => {
                    if (err)
                        return callback(err);
                    batchIterator(gtin, batchesCopy, callback);
                });
            }

            batchIterator(product.gtin, pBatches.slice(), (err, batches) => {
                if (err)
                    return callback(err);
                batchesObject[product.gtin] = batches;
                productIterator(productsCopy, callback);
            });
        }

        productIterator(products.slice(), (err, batchesObj) => {
            if (err)
                return callback(err);
            const output = [];
            Object.keys(batchesObj).forEach(gtin => {
                output.push(`The following batches per gtin have been created:\nGtin: ${gtin}\nBatches: ${batchesObj[gtin].map(b => b.batchNumber).join(', ')}`);
            });
            console.log(output.join('\n'));
            callback(undefined, batchesObj);
        });
    });
}

const setupOrderLines = function (participantManager, callback){
    getOrderLineManager(participantManager, true, (err, orderLineManager) => {
        if (err)
            return callback(err);
        participantManager.orderLineManager = orderLineManager; // just to keep the reference and keep it instantiated so it can receive messages
        callback();
    });
}

const setupShipmentLines = function (participantManager, callback){
    getShipmentLineManager(participantManager, true, (err, shipmentLineManager) => {
        if (err)
            return callback(err);
        participantManager.shipmentLineManager = shipmentLineManager; // just to keep the reference and keep it instantiated so it can receive messages
        callback();
    });
}

const setup = function(participantManager, products, batches, callback){
    setupProducts(participantManager, products, batches, (err, productsObj) => {
        if (err)
            return callback(err);
        setupBatches(participantManager, productsObj, batches, (err, batchesObj) => {
            if (err)
                return callback(err);
            setupOrderLines(participantManager, (err) => {
                if (err)
                    return callback(err);
                setupShipmentLines(participantManager, (err) => {
                    if (err)
                        return callback(err);
                    callback(undefined, productsObj, batchesObj);
                });
            });
        });
    });
}

const create = function(credentials,  callback) {

    instantiateSSApp(APPS.MAH, conf.pathToApps, dt, credentials, (err, walletSSI, walletDSU, credentials) => {
        if (err)
            throw err;
        const dsuStorage = impersonateDSUStorage(walletDSU.getWritableDSU());
        getParticipantManager(dsuStorage, true, (err, participantManager) => {
            if (err)
                throw err;
            console.log(`${conf.app} instantiated\ncredentials:`);
            console.log(credentials);
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




