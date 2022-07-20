process.env.NO_LOGS = true;
process.env.PSK_CONFIG_LOCATION = process.cwd();

const path = require('path');

const pskruntime_path = path.join('../../privatesky/psknode/bundles', 'openDSU.js');
require(pskruntime_path);

const {spawn} = require('child_process');

const resolver = require('opendsu').loadApi('resolver');

const wizard = require('../../fgt-dsu-wizard');
const {getParticipantManager, getProductManager, getBatchManager, getDirectoryManager, getStockManager} = wizard.Managers;

const {instantiate} = require('../../fgt-api/utils')
const {APPS} = require('../../bin/environment/credentials/credentials3')
const {impersonateDSUStorage} = require("../../bin/environment/utils");

const getSimpleShipmentManager = require('../../fgt-api/managers/SimpleShipmentManager')
const SimpleShipment = require('../../fgt-api/model/SimpleShipment')
const ShipmentLine = require('../../fgt-dsu-wizard/model/ShipmentLine')
const ShipmentStatus = require('../../fgt-dsu-wizard/model/ShipmentStatus')
const Status = require('../../fgt-dsu-wizard/model/Status')


const credsPath = path.join(process.cwd(), '../../fgt-api/config')

const refreshCreds = function(role){
    const fs = require('fs');
    let p = path.join(credsPath, role, "credentials.json")
    const creds = JSON.parse(fs.readFileSync(p));

    creds.id.secret = creds.id.secret + "1";
    fs.writeFileSync(p, JSON.stringify(creds))
    return creds;
}

const bootInstance = function(type, callback) {
    instantiate(credsPath, type, (err, ssi, dsu) => {
        if (err)
            return callback(err);
        getParticipantManager(impersonateDSUStorage(dsu.getWritableDSU()), true, (err, manager) => {
            if (err)
                return callback(err);
            callback(undefined, ssi, dsu, manager);
        })
    }, "../..")
}

const getMahManagers = function(manager, callback) {
    getProductManager(manager, (err, pManager) => {
        if (err)
            return callback(err);
        getBatchManager(manager, (err, bManager) => {
            if (err)
                return callback(err);
            getSimpleShipmentManager(manager, (err, sManager) => {
                if (err)
                    return callback(err);
                callback(undefined, pManager, bManager, sManager);
            })
        })
    })
}


const getWHSManagers = function(manager, callback) {
    getSimpleShipmentManager(manager, (err, sManager) => {
        if (err)
            return callback(err);
        callback(undefined, sManager);
    })
}

const createProduct = function(pManager, callback){
    const genProduct = require('../../bin/environment/products/productsRandom2');
    const product = genProduct();
    pManager.create(product.gtin, product, (err) => {
        if (err)
            return callback(err);
        callback(undefined, product)
    })
}

const createBatch = function(bManager, product, callback){
    const genBatch = require('../../bin/environment/batches/batchesRandom2');
    const batch = genBatch(20);
    bManager.create(product, batch, (err) => {
        if (err)
            return callback(err);
        callback(undefined, batch)
    })
}

const mahCreds = refreshCreds(APPS.MAH)
const whsCreds = refreshCreds(APPS.WHOLESALER);

const sendShipment = function(sManager, product, batch, callback){
    const sl = new ShipmentLine({
        gtin: product.gtin,
        batch: batch.batchNumber,
        quantity: 1,
        senderId: mahCreds.id.secret,
        requesterId: whsCreds.id.secret
    })

    const s = new SimpleShipment({
        requesterId: whsCreds.id.secret,
        orderId: "some Order id",
        senderId: mahCreds.id.secret,
        shipmentLines: [
            sl
        ]
    });



    sManager.create(s, (err, keySSI) => {
        if (err)
            return callback(err);
        sManager.update(s.shipmentId, new Status({status:  ShipmentStatus.PICKUP}), (err) => {
            if (err)
                return callback(err);
            // sManager.update(s.shipmentId, new Status({status:  ShipmentStatus.TRANSIT}), (err) => {
            //     if (err)
            //         return callback(err);
            //     sManager.update(s.shipmentId, new Status({status:  ShipmentStatus.DELIVERED}), (err) => {
            //         if (err)
            //             return callback(err);
                    callback(undefined, s, keySSI);
                // })
            // })
        })
    })
}

const waitAndTest = function(shipment, mahSManager, whsSManager, callback){
    const timeout = 20000;
    console.log(`Waiting for ${timeout / 1000}s to test`)

    setTimeout(() => {

        const {shipmentId, senderId} = shipment;

        const verifyShipments = function(mahS, whsS, callback){
            if (mahS.status.status !== whsS.status.status)
                return callback("inavlid statuses")
            callback()
        }

        mahSManager.getOne(shipmentId, true, (err, mahS) => {
            if (err)
                return callback(err);
            whsSManager.getOne(senderId + "-" + shipmentId, true, (err, whsS) => {
                if (err)
                    return callback(err);
                verifyShipments(mahS, whsS, callback)
            })
        })
    }, timeout)
}
const cb = function(err, ...results){
    if (err)
        throw err;
    console.log("Test Finished")
    console.log(...results);
    process.exit(0)
}


bootInstance(APPS.MAH, (err, mahSSI, mahDSU, mahManager) => {
    if (err)
        return cb(err);

    getMahManagers(mahManager, (err, pManager, bManager, mahSManager) => {
        if (err)
            return cb(err);

        createProduct(pManager, (err, product) => {
            if (err)
                return cb(err);
            createBatch(bManager, product, (err, batch) => {
                if (err)
                    return cb(err);
                bootInstance(APPS.WHOLESALER, (err, whsSSI, whsDSU, whsManager) => {
                    if (err)
                        return cb(err);

                    getWHSManagers(whsManager, (err, whsSManager) => {
                        if (err)
                            return cb(err);

                        sendShipment(mahSManager, product, batch, (err, shipment) => {
                            if (err)
                                return cb(err);

                            waitAndTest(shipment, mahSManager, whsSManager, cb)
                        })
                    })
                });
            })
        })
    })
})



