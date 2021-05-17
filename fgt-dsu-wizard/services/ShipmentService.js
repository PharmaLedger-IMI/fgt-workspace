/**
 * @module fgt-dsu-wizard.services
 */
const utils = require('../../pdm-dsu-toolkit/services/utils');
const {STATUS_MOUNT_PATH, INFO_PATH, LINES_PATH} = require('../constants');

/**
 * @param {string} domain: anchoring domain. defaults to 'default'
 * @param {strategy} strategy
 */
function ShipmentService(domain, strategy) {
    const strategies = require("../../pdm-dsu-toolkit/services/strategy");
    const {Shipment, ShipmentStatus} = require('../model');
    const endpoint = 'shipment';

    domain = domain || "default";
    const shipmentLineService = new (require('./ShipmentLineService'))(domain, strategy);
    const statusService = new (require('./StatusService'))(domain, strategy);

    let isSimple = strategies.SIMPLE === (strategy || strategies.SIMPLE);


    this.resolveMAH = function(shipmentLine, callback){
        const keyGen = require('../commands/setProductSSI').createProductSSI;
        const productSSI = keyGen({gtin: shipmentLine.gtin}, domain);
        utils.getResolver().loadDSU(productSSI, (err, dsu) => {
            if (err)
                return callback(`Could not load Product DSU ${err}`);
            dsu.readFile(INFO_PATH, (err, data) => {
                if (err)
                    return callback(`Could not read product from dsu ${err}`);
                try{
                    const product = JSON.parse(data);
                    callback(undefined, product.manufName);
                } catch (e){
                    return callback(`Could not parse Product data ${err}`)
                }
            });
        });
    }

    /**
     * Resolves the DSU and loads the Order object with all its properties, mutable or not
     * @param {KeySSI} keySSI
     * @param {function(err, Shipment)} callback
     */
    this.get = function(keySSI, callback){
        utils.getResolver().loadDSU(keySSI, (err, dsu) => {
            if (err)
                return callback(err);
            dsu.readFile(INFO_PATH, (err, data) => {
                if (err)
                    return callback(err);
                try{
                    const shipment = JSON.parse(data);
                    dsu.readFile(`${STATUS_MOUNT_PATH}${INFO_PATH}`, (err, status) => {
                        if (err)
                            return callback(`could not retrieve orderLine status`);
                        try{
                            shipment.status = JSON.parse(status);
                            callback(undefined, shipment);
                        } catch (e) {
                            callback(`unable to parse Order status: ${data.toString()}`);
                        }
                    });
                } catch (e){
                    callback(`Could not parse order in DSU ${keySSI.getIdentifier()}`);
                }
            })
        });
    }

    /**
     * Creates an shipment
     * @param {Shipment} shipment
     * @param {function(err, keySSI)} callback
     */
    this.create = function (shipment, callback) {
        // if product is invalid, abort immediatly.
        if (typeof shipment === 'object') {
            let err = shipment.validate();
            if (err)
                return callback(err);
        }

        if (isSimple) {
            createSimple(shipment, callback);
        } else {
            createAuthorized(shipment, callback);
        }
    }

    /**
     * Creates the original OrderStatus DSU
     * @param {OrderStatus} [status]: defaults to OrderStatus.CREATED
     * @param {function(err, keySSI, orderLinesSSI)} callback
     */
    let createShipmentStatus = function (status, callback) {
        if (typeof status === 'function') {
            callback = status;
            status = ShipmentStatus.CREATED;
        }
        statusService.create(status, (err, keySSI) => {
            if (err)
                return callback(err);
            console.log(`ShipmentStatus DSU created with SSI ${keySSI.getIdentifier(true)}`);
            callback(undefined, keySSI);
        });
    }

    let createSimple = function (shipment, callback) {
        let keyGenFunction = require('../commands/setShipmentSSI').createShipmentSSI;
        let templateKeySSI = keyGenFunction({senderId: shipment.senderId, shipmentId: shipment.shipmentId}, domain);
        utils.selectMethod(templateKeySSI)(templateKeySSI, (err, dsu) => {
            if (err)
                return callback(err);
            dsu.writeFile(INFO_PATH, JSON.stringify(shipment), (err) => {
                if (err)
                    return callback(err);
                console.log("Shipment /info ", JSON.stringify(shipment));
                createShipmentStatus((err, statusSSI) => {
                    if (err)
                        return callback(err);
                    // Mount must take string version of keyssi
                    dsu.mount(STATUS_MOUNT_PATH, statusSSI.getIdentifier(), (err) => {
                        if (err)
                            return callback(err);
                        console.log(`OrderStatus DSU (${statusSSI.getIdentifier(true)}) mounted at '/status'`);
                        createShipmentLines(shipment, statusSSI, (err, shipmentLines) => {
                            if (err)
                                return callback(err);
                            const lines = JSON.stringify(shipmentLines.map(o => o.getIdentifier(true)));
                            dsu.writeFile(LINES_PATH, lines, (err) => {
                                if (err)
                                    return callback(err);
                                dsu.getKeySSIAsObject((err, keySSI) => {
                                    if (err)
                                        return callback(err);
                                    console.log("Finished creating Shipment " + keySSI.getIdentifier(true));
                                    callback(undefined, keySSI, shipmentLines);
                                });
                            });
                        });
                    });
                });
            });
        });
    }

    let createAuthorized = function (shipment, callback) {
        let getEndpointData = function (shipment) {
            return {
                endpoint: endpoint,
                data: {
                    senderId: shipment.senderId,
                    shipmentId: shipment.shipmentId
                }
            }
        }

        utils.getDSUService().create(domain, getEndpointData(shipment), (builder, cb) => {
            builder.addFileDataToDossier(INFO_PATH, JSON.stringify(shipment), (err) => {
                if (err)
                    return cb(err);
                createShipmentStatus((err, statusSSI) => {
                    if (err)
                        return cb(err);
                    builder.mount(STATUS_MOUNT_PATH, statusSSI.getIdentifier(), (err) => {
                        if (err)
                            return cb(err);
                        createShipmentLines(shipment, statusSSI, (err, orderLines) => {
                            if (err)
                                return cb(err);
                            builder.addFileDataToDossier(LINES_PATH, JSON.stringify(orderLines.map(o => o.getIdentifier(true))), (err) => {
                                if (err)
                                    return cb(err);
                                cb();
                            })
                        });
                    });
                });
            });
        }, callback);
    }

    /**
     * Creates OrderLines DSUs for each orderLine in shipment
     * @param {Shipment} shipment
     * @param {function} callback
     * @param {KeySSI} statusSSI keySSI to the OrderStatus DSU
     * @return {Object[]} keySSIs
     */
    let createShipmentLines = function (shipment, statusSSI, callback) {
        let shipmentLines = [];

        statusSSI = statusSSI.derive();
        let iterator = function (shipment, items, callback) {
            let shipmentLine = items.shift();
            if (!shipmentLine)
                return callback(undefined, shipmentLines);
            shipmentLineService.create(shipment.shipmentId, shipmentLine, statusSSI, (err, keySSI) => {
                if (err)
                    return callback(err);
                shipmentLines.push(keySSI);
                iterator(shipment, items, callback);
            });
        }
        // the slice() clones the array, so that the shitf() does not destroy it.
        iterator(shipment, shipment.shipmentLines.slice(), callback);
    }
}

module.exports = ShipmentService;