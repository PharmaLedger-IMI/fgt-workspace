process.env.NO_LOGS = true;

const path = require('path');

try{
    require('opendsu');
}catch(e){
    try{
        require(path.join('../../privatesky/psknode/bundles', 'openDSU.js'));       // the whole 9 yards, can be replaced if only
    }catch(e1){
        console.log(e1);
        process.exit(1);
    }
}

const dt = require('./../../pdm-dsu-toolkit/services/dt');
const getIssuedShipmentManager = require("../../fgt-dsu-wizard/managers/IssuedShipmentManager");
const { getParticipantManager, getProductManager, getBatchManager, getShipmentLineManager, getStockManager, getReceivedOrderManager, getReceiptManager} = require('../../fgt-dsu-wizard/managers');
const { impersonateDSUStorage, argParser, instantiateSSApp } = require('./utils');
const ROLE = require('../../fgt-dsu-wizard/model/DirectoryEntry').ROLE;
const submitEvent = require('./listeners/eventHandler');

const { APPS } = require('./credentials/credentials3');
const { getSystemErrorMap } = require('util');

const defaultOps = {
    app: "fgt-mah-wallet",
    pathToApps: "../../",
    id: undefined,
    batchCount: 10,
    serialQuantity: 1000,
    expiryOffset: 100,
    randomize: true
}

let conf = argParser(defaultOps, process.argv);

const setupProducts = function(participantManager, products, batches, callback){
    getProductManager(participantManager, (err, productManager) => {
        if (err)
            return callback(err);
        participantManager.productManager = productManager;
        products = products || require('./products/productsRandom')();

        const errCb = function(err){
            productManager.cancelBatch(err2 => {
                if (err2)
                    console.log(`Could not cancelBatch over error`, err2);
                callback(err);
            });
        }

        try {
            productManager.beginBatch();
        } catch (e){
            return callback(e);
        }

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

        iterator(products.slice(), (err, products) => {
            if (err)
                return errCb(err);
            productManager.commitBatch(err => {
                if (err)
                    return errCb(err);
                callback(undefined, products);
            })
        });
    });
}

const setupBatches = function(participantManager, products, batches,  callback){
    getBatchManager(participantManager, (err, batchManager) => {
        if (err)
            return callback(err);
        participantManager.batchManager = batchManager;
        const getBatches = !batches
            ? function(gtin){
                return require('./batches/batchesRandom')(conf.batchCount, conf.serialQuantity, conf.expiryOffset, conf.randomize);
            }
            : function(gtin){
                return batches[gtin + ''].slice();
            }

        const batchesObject = {};

        const errCb = function(err){
            batchManager.cancelBatch(err2 => {
                if (err2)
                    console.log(`Could not cancelBatch over error`, err2);
                callback(err);
            });
        }

        try {
            batchManager.beginBatch();
        } catch (e){
            return callback(e);
        }

        const productIterator = function(productsCopy, callback){
            const product = productsCopy.shift();
            if (!product)
                return callback(undefined, batchesObject);

            const pBatches = getBatches(product.gtin);

            const batchIterator = function(product, batchesCopy, callback){
                const batch = batchesCopy.shift();
                if (!batch){
                    console.log(`${pBatches.length} batches created for ${product.gtin}`);
                    return callback(undefined, pBatches);
                }
                batchManager.create(product, batch, (err, keySSI, path) => {
                    if (err)
                        return callback(err);
                    batchIterator(product, batchesCopy, callback);
                });
            }

            batchIterator(product, pBatches.slice(), (err, batches) => {
                if (err)
                    return callback(err);
                batchesObject[product.gtin] = batches;
                productIterator(productsCopy, callback);
            });
        }

        productIterator(products.slice(), (err, batchesObj) => {
            if (err)
                return errCb(err);
            batchManager.commitBatch(err => {
                if (err)
                    return errCb(err);
                const output = [];
                Object.keys(batchesObj).forEach(gtin => {
                    output.push(`The following batches per gtin have been created:\nGtin: ${gtin}\nBatches: ${batchesObj[gtin].map(b => b.batchNumber).join(', ')}`);
                });
                console.log(output.join('\n'));
                callback(undefined, batchesObj);
            });
        });
    });
}

const setupManager = function(participantManager, callback){
    getReceivedOrderManager(participantManager,  (err, receivedOrderManager) => {
        if (err)
            return callback(err);
        getIssuedShipmentManager(participantManager, (err, issuedShipmentManager) => {
            if (err)
                return callback(err);
            getShipmentLineManager(participantManager, (err, shipmentLineManager) => {
                if (err)
                    return callback(err);
                getReceiptManager(participantManager, (err) => {
                    if (err)
                        return callback(err);
                    callback();  
                });
            });
        });
    });
}

const attachLogic = function(participantManager, conf, callback){
    if (!conf.attachLogic)
        return callback();
    try{
        const receivedOrderListener = require('./listeners/orderListener').orderListener(participantManager, ROLE.MAH, conf.statusUpdateTimeout);
        const receivedOrderManager = participantManager.getManager("ReceivedOrderManager");
        receivedOrderManager.registerMessageListener(receivedOrderListener);
    } catch (e) {
        return callback(e);
    }

    callback();
}

const setup = function(conf, participantManager, products, batches, callback){
    const db = participantManager.db;
    if (!db)
        return callback(`database is not initialized`);

    console.log(`Beginning batch operation on database`);
    // db.beginBatch();
    setupProducts(participantManager, products, batches, (err, productsObj) => {
        if (err)
            return callback(err);
        setupBatches(participantManager, productsObj, batches, (err, batchesObj) => {
            if (err)
                return callback(err);
            setupManager(participantManager, (err) => {
                if (err)
                    return callback(err);
                console.log(`Updates to db committed`);
                attachLogic(participantManager, conf, (err) => {
                    if (err)
                        return callback(err);
                    callback(undefined, productsObj, batchesObj);
                })
            });
        });
    });
}

const trimCredentials = function(credentials){
    const creds = Object.assign({}, credentials);
    delete creds.products;
    delete creds.batches;
    return creds;
}

const create = function(credentials,  pathToApps, callback) {
    if (!callback){
        callback = pathToApps;
        pathToApps = undefined;
    }
    const trimmedCreds = trimCredentials(credentials);
    instantiateSSApp(APPS.MAH, pathToApps || conf.pathToApps, dt, trimmedCreds, (err, walletSSI, walletDSU, confirmedCredentials) => {
        if (err)
            return callback(err);
        const dsuStorage = impersonateDSUStorage(walletDSU.getWritableDSU());
        getParticipantManager(dsuStorage, true, (err, participantManager) => {
            if (err)
                return callback(err);
            console.log(`${conf.app} instantiated\ncredentials:`);
            console.log(confirmedCredentials);
            console.log(`ID: ${confirmedCredentials.id.secret}`);
            console.log(`SSI: ${walletSSI}`);
            callback(undefined, credentials, walletSSI, participantManager);
        });
    });
}

module.exports = {
    create,
    setup
};




