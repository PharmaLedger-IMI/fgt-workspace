const utils = require('../../pdm-dsu-toolkit/services/utils');
const {STATUS_MOUNT_PATH, INFO_PATH, LINES_PATH, ORDER_MOUNT_PATH} = require('../constants');
const {Shipment, ShipmentStatus} = require('../model');
/**
 * @param {string} domain: anchoring domain. defaults to 'default'
 * @param {strategy} strategy
 * @function ShipmentService
 * @memberOf Services
 */
function ShipmentService(domain, strategy) {
    const strategies = require("../../pdm-dsu-toolkit/services/strategy");
    const endpoint = 'shipment';

    domain = domain || "default";
    const shipmentLineService = new (require('./ShipmentLineService'))(domain, strategy);
    const statusService = new (require('./StatusService'))(domain, strategy);
    const shipmentCodeService = new (require('./ShipmentCodeService'))(domain, strategy);

    let isSimple = strategies.SIMPLE === (strategy || strategies.SIMPLE);

    let getDSUMountByPath = function(dsu, path, basePath, callback){
        if (!callback && typeof basePath === 'function'){
            callback = basePath;
            basePath = '/';
        }
        dsu.listMountedDSUs(basePath, (err, mounts) => {
            if (err)
                return callback(err);
            const filtered = mounts.filter(m => "/" + m.path === path);
            if (filtered.length !== 1)
                return callback(`Invalid number of mounts found ${filtered.length}`);
            callback(undefined, filtered[0].identifier);
        });
    }

    this.resolveMAH = function(shipmentLine, callback){
        const keyGen = require('../commands/setProductSSI').createProductSSI;
        const productSSI = keyGen({gtin: shipmentLine.gtin}, domain);
        utils.getResolver().loadDSU(productSSI, (err, dsu) => {
            if (err)
                return callback(`Could not load Product DSU ${err}`);
            dsu.readFile(INFO_PATH, (err, data) => {
                if (err)
                    return callback(`Could not read product from dsu ${err}`);
                let product;
                try{
                    product = JSON.parse(data);
                } catch (e){
                    return callback(`Could not parse Product data ${err}`)
                }
                callback(undefined, product.manufName);
            });
        });
    }

    /**
     * Resolves the DSU and loads the Order object with all its properties, mutable or not
     * @param {KeySSI} keySSI
     * @param {function(err, Shipment, Archive)} callback
     */
    this.get = function(keySSI, callback){
        utils.getResolver().loadDSU(keySSI, (err, dsu) => {
            if (err)
                return callback(err);
            dsu.readFile(INFO_PATH, (err, data) => {
                if (err)
                    return callback(err);
                let shipment;

                try{
                    shipment = JSON.parse(data);
                } catch (e){
                    return callback(`Could not parse shipment in DSU ${keySSI.getIdentifier()}`);
                }

                shipment = new Shipment(shipment.shipmentId, shipment.requesterId, shipment.senderId, shipment.shipToAddress, shipment.status, shipment.shipmentLines);

                utils.getMounts(dsu, '/', STATUS_MOUNT_PATH, ORDER_MOUNT_PATH, (err, mounts) => {
                    if (err)
                        return callback(err);
                    if (!mounts[STATUS_MOUNT_PATH] || !mounts[ORDER_MOUNT_PATH])
                        return callback(`Could not find status/order mount`);
                    statusService.get(mounts[STATUS_MOUNT_PATH], (err, status) => {
                        if (err)
                            return callback(err);
                        shipment.status = status;
                        shipment.orderSSI = mounts[ORDER_MOUNT_PATH];
                        dsu.readFile(`${ORDER_MOUNT_PATH}${INFO_PATH}`, (err, order) => {
                            if (err)
                                return callback(`Could not read from order DSU`);
                            let orderId;
                            try{
                                orderId = JSON.parse(order).orderId;
                            } catch (e) {
                                return callback(`unable to parse shipment mounted Order: ${order}`);
                            }

                            dsu.readFile(LINES_PATH, (err, data) => {
                                if (err)
                                    return callback(err);
                                let linesSSI;
                                try {
                                    linesSSI = JSON.parse(data);
                                } catch (e) {
                                    return callback(e);
                                }
                                callback(undefined, shipment, dsu, orderId, linesSSI);
                            });
                        });
                    });
                });
            });
        });
    }

    /**
     * Creates an shipment
     * @param {Shipment} shipment
     * @param {string} orderSSI (the readSSI to the order)
     * @param {function(err, keySSI)} callback
     */
    this.create = function (shipment, orderSSI, callback) {
        if (!callback){
            callback = orderSSI;
            orderSSI = undefined;
        }
        // if product is invalid, abort immediatly.
        if (typeof shipment === 'object') {
            let err = shipment.validate();
            if (err)
                return callback(err);
        }

        if (isSimple) {
            createSimple(shipment, orderSSI, callback);
        } else {
            createAuthorized(shipment, orderSSI, callback);
        }
    }

    /**
     * Creates the original OrderStatus DSU
     * @param {string} id the id for the operation
     * @param {ShipmentStatus} [status]: defaults to ShipmentStatus.CREATED
     * @param {function(err, keySSI, orderLinesSSI)} callback
     */
    let createShipmentStatus = function (id,status,  callback) {
        if (typeof status === 'function') {
            callback = status;
            status = ShipmentStatus.CREATED;
        }
        statusService.create(status, id, (err, keySSI) => {
            if (err)
                return callback(err);
            console.log(`ShipmentStatus DSU created with SSI ${keySSI.getIdentifier(true)}`);
            callback(undefined, keySSI);
        });
    }

    let createSimple = function (shipment, orderSSI, callback) {
        let keyGenFunction = require('../commands/setShipmentSSI').createShipmentSSI;
        let templateKeySSI = keyGenFunction({data: shipment.senderId + shipment.shipmentId}, domain);
        utils.selectMethod(templateKeySSI)(templateKeySSI, (err, dsu) => {
            if (err)
                return callback(err);
            dsu.writeFile(INFO_PATH, JSON.stringify(shipment), (err) => {
                if (err)
                    return callback(err);
                console.log("Shipment /info ", JSON.stringify(shipment));
                createShipmentStatus(shipment.senderId, (err, statusSSI) => {
                    if (err)
                        return callback(err);
                    // Mount must take string version of keyssi
                    dsu.mount(STATUS_MOUNT_PATH, statusSSI.getIdentifier(), (err) => {
                        if (err)
                            return callback(err);
                        console.log(`OrderStatus DSU (${statusSSI.getIdentifier(true)}) mounted at '/status'`);

                        const finalize = function(callback){
                            createShipmentLines(shipment, statusSSI, (err, shipmentLines) => {
                                if (err)
                                    return callback(err);
                                const lines = JSON.stringify(shipmentLines.map(o => o.getIdentifier()));
                                dsu.writeFile(LINES_PATH, lines, (err) => {
                                    if (err)
                                        return callback(err);
                                    dsu.getKeySSIAsObject((err, keySSI) => {
                                        if (err)
                                            return callback(err);
                                        console.log("Finished creating Shipment " + keySSI.getIdentifier(true));
                                        callback(undefined, keySSI, shipmentLines, statusSSI.getIdentifier());
                                    });
                                });
                            });
                        };

                        if (!orderSSI)
                            return finalize(callback);

                        dsu.mount(ORDER_MOUNT_PATH, orderSSI, (err) => {
                            if (err)
                                return callback(err);
                           finalize(callback);
                        });
                    });
                });
            });
        });
    }

    let createAuthorized = function (shipment, orderSSI, callback) {
        let getEndpointData = function (shipment) {
            return {
                endpoint: endpoint,
                data: {
                    data: shipment.senderId + shipment.shipmentId
                }
            }
        }

        utils.getDSUService().create(domain, getEndpointData(shipment), (builder, cb) => {
            builder.addFileDataToDossier(INFO_PATH, JSON.stringify(shipment), (err) => {
                if (err)
                    return cb(err);
                createShipmentStatus(shipment.senderId, (err, statusSSI) => {
                    if (err)
                        return cb(err);
                    builder.mount(STATUS_MOUNT_PATH, statusSSI.getIdentifier(), (err) => {
                        if (err)
                            return cb(err);

                        const finalize = function(callback){
                            createShipmentLines(shipment, statusSSI, (err, orderLines) => {
                                if (err)
                                    return callback(err);
                                builder.addFileDataToDossier(LINES_PATH, JSON.stringify(orderLines.map(o => o.getIdentifier(true))), (err) => {
                                    if (err)
                                        return ccallback(err);
                                    callback();
                                });
                            });
                        }

                        if (!orderSSI)
                            return finalize(cb);

                        builder.mount(ORDER_MOUNT_PATH, orderSSI, (err) => {
                            if (err)
                                return cb(err);
                            finalize(cb);
                        });
                    });
                });
            });
        }, callback);
    }

    this.update = function(keySSI, shipment, id, callback){
        if (!callback && typeof id === 'function'){
            callback = id;
            id = shipment.senderId;
        }

        if (typeof shipment === 'object') {
            let err = shipment.validate();
            if (err)
                return callback(err);
        }
        const self = this;
        if (isSimple) {
            keySSI = utils.getKeySSISpace().parse(keySSI);
            utils.getResolver().loadDSU(keySSI, (err, dsu) => {
                if (err)
                    return callback(err);
                utils.getMounts(dsu, '/', STATUS_MOUNT_PATH,  (err, mounts) => {
                    if (err)
                        return callback(err);
                    if (!mounts[STATUS_MOUNT_PATH])
                        return callback(`Could not find status mount`);
                    dsu.readFile(`${STATUS_MOUNT_PATH}${INFO_PATH}`, (err, status) => {
                        if (err){
                            console.log(err.stack)
                            return callback(err);
                        }

                        try{
                            status = JSON.parse(status);
                        } catch (e){
                            return callback(e);
                        }
                        err = shipment.validate(status);
                        if (err)
                            return callback(err);
                        statusService.update(mounts[STATUS_MOUNT_PATH], shipment.status, shipment.senderId, (err) => {
                            if (err)
                                return callback(err);
                            self.get(keySSI, callback);
                        });
                    });
                });
            });
        } else {
            return callback(`Not implemented`);
        }
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

    /**
     * Creates the ShipmentCodeDSU for the shipment
     * @param {Shipment} shipment
     * @param {function} callback
     * @param {KeySSI} statusSSI keySSI to the OrderStatus DSU
     * @return {Object[]} keySSIs
     */
    let createShipmentCode = function (shipment, statusSSI, callback) {
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