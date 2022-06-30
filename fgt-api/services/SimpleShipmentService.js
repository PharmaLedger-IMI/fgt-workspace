const utils = require('../../pdm-dsu-toolkit/services/utils');
const {STATUS_MOUNT_PATH, INFO_PATH, LINES_PATH, SIMPLE_SHIPMENT_MOUNT_PATH} = require('../constants');
const SimpleShipment = require('../model/SimpleShipment');
const {ShipmentStatus} = require('../../fgt-dsu-wizard/model');
const {log} = require('../utils');

/**
 * @param {string} domain: anchoring domain. defaults to 'default'
 * @param {strategy} strategy
 * @function SimpleShipmentService
 * @memberOf Services
 */
function SimpleShipmentService(domain, strategy) {
    const strategies = require("../../pdm-dsu-toolkit/services/strategy");

    domain = domain || "default";
    const shipmentLineService = new (require('../../fgt-dsu-wizard/services/ShipmentLineService'))(domain, strategy);
    const statusService = new (require('../../fgt-dsu-wizard/services/StatusService'))(domain, strategy);

    let isSimple = strategies.SIMPLE === (strategy || strategies.SIMPLE);

    this.resolveMAH = function (shipmentLine, callback) {
        const keyGen = require('../../fgt-dsu-wizard/commands/setProductSSI').createProductSSI;
        const productSSI = keyGen({gtin: shipmentLine.gtin}, domain);
        utils.getResolver().loadDSU(productSSI, (err, dsu) => {
            if (err)
                return callback(`Could not load Product DSU ${err}`);
            dsu.readFile(INFO_PATH, (err, data) => {
                if (err)
                    return callback(`Could not read product from dsu ${err}`);
                let product;
                try {
                    product = JSON.parse(data);
                } catch (e) {
                    return callback(`Could not parse Product data ${err}`)
                }
                callback(undefined, product.manufName);
            });
        });
    }

    /**
     * Resolves the DSU and loads the SimpleShipment object with all its properties, mutable or not
     * @param {KeySSI} keySSI
     * @param {function(err, SimpleShipment?, Archive?)} callback
     */
    this.get = function (keySSI, callback) {
        utils.getResolver().loadDSU(keySSI, {skipCache: true}, (err, dsu) => {
            if (err)
                return callback(err);
            dsu.readFile(INFO_PATH, (err, data) => {
                if (err)
                    return callback(err);
                let simpleShipment;

                try {
                    simpleShipment = JSON.parse(data);
                } catch (e) {
                    return callback(`Could not parse shipment in DSU ${keySSI.getIdentifier()}`);
                }

                simpleShipment = new SimpleShipment(simpleShipment);
                utils.getMounts(dsu, '/', STATUS_MOUNT_PATH, SIMPLE_SHIPMENT_MOUNT_PATH, (err, mounts) => {
                    if (err)
                        return callback(err);
                    if (!mounts[STATUS_MOUNT_PATH])
                        return callback(`Could not find status/simpleShipment mount`);
                    statusService.get(mounts[STATUS_MOUNT_PATH], (err, status) => {
                        if (err)
                            return callback(err);
                        simpleShipment.status = status;
                        dsu.readFile(LINES_PATH, (err, data) => {
                            if (err)
                                return callback(err);
                            let linesSSI;
                            try {
                                linesSSI = JSON.parse(data);
                            } catch (e) {
                                return callback(e);
                            }

                            const populateShipmentLineStatus = (accum, shipmentLinesSSIs, _callback) => {
                                const shipmentLineSSI = shipmentLinesSSIs.shift();
                                if (!shipmentLineSSI)
                                    return _callback(undefined, accum);
                                shipmentLineService.get(shipmentLineSSI, (err, shipmentLine) => {
                                    if (err)
                                        return _callback(err);
                                    accum.push(shipmentLine);
                                    populateShipmentLineStatus(accum, shipmentLinesSSIs, _callback);
                                })
                            }

                            populateShipmentLineStatus([], linesSSI.slice(), (err, shipmentLines) => {
                                if (err)
                                    return callback(err);
                                simpleShipment.shipmentLines = shipmentLines;
                                callback(undefined, simpleShipment, dsu, linesSSI);
                            })

                        });
                    });
                });
            });
        });
    }

    /**
     * Creates an shipment
     * @param {SimpleShipment} simpleShipment
     * @param {function(err, keySSI?)} callback
     */
    this.create = function (simpleShipment, callback) {
        simpleShipment = new SimpleShipment({...simpleShipment, status: ShipmentStatus.CREATED});
        const err = simpleShipment.validate();
        if (err)
            return callback(err);

        if (!isSimple)
            callback(`Strategy type to create a Simple Shipment is not supported.`);
        _createSimple(simpleShipment, callback);
    }

    const _createSimple = function (simpleShipment, callback) {
        const keyGenFunction = require('../../fgt-dsu-wizard/commands/setShipmentSSI').createShipmentSSI;
        const templateKeySSI = keyGenFunction({data: `${simpleShipment.requesterId}-${simpleShipment.orderId}`}, domain);
        utils.selectMethod(templateKeySSI)(templateKeySSI, (err, dsu) => {
            if (err)
                return callback(err);

            const cancelBatchCallback = function (err, ...results) {
                if (err)
                    return dsu.cancelBatch(_ => callback(err));
                callback(undefined, ...results);
            }

            try {
                dsu.beginBatch();
            } catch (e) {
                return callback(e);
            }

            dsu.writeFile(INFO_PATH, JSON.stringify(simpleShipment), (err) => {
                if (err)
                    return cancelBatchCallback(err);
                log("SimpleShipment /info ", JSON.stringify(simpleShipment));
                _createShipmentStatus(simpleShipment.senderId, (err, statusSSI) => {
                    if (err)
                        return cancelBatchCallback(err);
                    // Mount must take string version of keyssi
                    dsu.mount(STATUS_MOUNT_PATH, statusSSI.getIdentifier(), (err) => {
                        if (err)
                            return cancelBatchCallback(err);
                        log(`SimpleShipmentStatus DSU (${statusSSI.getIdentifier(true)}) mounted at ${STATUS_MOUNT_PATH}`);

                        _createShipmentLines(simpleShipment, statusSSI, (err, shipmentLinesKeySSIs) => {
                            if (err)
                                return cancelBatchCallback(err);
                            const lines = JSON.stringify(shipmentLinesKeySSIs.map(o => o.getIdentifier()));
                            dsu.writeFile(LINES_PATH, lines, (err) => {
                                if (err)
                                    return cancelBatchCallback(err);

                                dsu.commitBatch((err) => {
                                    if (err)
                                        return cancelBatchCallback(err);
                                    dsu.getKeySSIAsObject((err, keySSI) => {
                                        if (err)
                                            return callback(err);
                                        log("Finished creating SimpleShipment " + keySSI.getIdentifier(true));
                                        callback(undefined, keySSI, shipmentLinesKeySSIs, statusSSI.getIdentifier());
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    }

    /**
     * Creates the SimpleShipmentStatus DSU
     * @param {string} id the id for the operation
     * @param {string} [status]: defaults to ShipmentStatus.CREATED
     * @param {function(err, keySSI?)} callback
     */
    const _createShipmentStatus = function (id, status, callback) {
        if (!callback) {
            callback = status;
            status = ShipmentStatus.CREATED;
        }
        statusService.create(status, id, (err, keySSI) => {
            if (err)
                return callback(err);
            console.log(`SimpleShipmentStatus DSU created with SSI ${keySSI.getIdentifier(true)}`);
            callback(undefined, keySSI);
        });
    }

    /**
     * Creates ShipmentLines DSUs for each shipmentLine in {@link SimpleShipment}
     * @param {SimpleShipment} simpleShipment
     * @param {function} callback
     * @param {KeySSI} statusSSI keySSI to the SimpleShipmentStatus DSU
     * @return {Object[]} keySSIs
     */
    const _createShipmentLines = function (simpleShipment, statusSSI, callback) {
        statusSSI = statusSSI.derive();
        const iterator = function (accum, simpleShipment, shipmentLines, _callback) {
            let shipmentLine = shipmentLines.shift();
            if (!shipmentLine)
                return _callback(undefined, accum);
            shipmentLineService.create(simpleShipment.orderId, shipmentLine, statusSSI, (err, keySSI) => {
                if (err)
                    return _callback(err);
                accum.push(keySSI);
                iterator(accum, simpleShipment, shipmentLines, _callback);
            });
        }
        iterator([], simpleShipment, simpleShipment.shipmentLines.slice(), callback);
    }

    /**
     * @param {string} keySSI
     * @param {Status} statusUpdate
     * @param {string | number} participantId: participantId who is requesting update
     * @param {function(err, SimpleShipment?)} callback
     */
    this.update = function (keySSI, statusUpdate, participantId, callback) {
        if (!isSimple)
            return callback(`Update strategy not implemented.`);

        const self = this;
        self.get(keySSI, (err, simpleShipment) => {
            if (err)
                return callback(err);

            const oldStatus = simpleShipment.status.status;
            simpleShipment.status.status = statusUpdate.status;
            simpleShipment.status.extraInfo = statusUpdate.extraInfo;
            err = simpleShipment.validate(oldStatus);
            if (err)
                return callback(err);

            const allowedRequesterStatusUpdate = simpleShipment.allowedRequesterStatusUpdate();
            if (participantId === simpleShipment.requesterId && !allowedRequesterStatusUpdate)
                return callback(`Requester is not able to update to status: ${simpleShipment.status.status}.`);
            // shipmentStatus updated to REJECTED is allowed for sender and requester
            if (participantId === simpleShipment.senderId && !(simpleShipment.status.status === ShipmentStatus.REJECTED) && allowedRequesterStatusUpdate)
                return callback(`Shipment sender is not able to update to status: ${simpleShipment.status.status}.`);

            keySSI = utils.getKeySSISpace().parse(keySSI);
            utils.getResolver().loadDSU(keySSI, {skipCache: true}, (err, dsu) => {
                if (err)
                    return callback(err);

                const cancelBatchCallback = function (err, ...results) {
                    if (err)
                        return dsu.cancelBatch(_ => callback(err));
                    callback(undefined, ...results);
                }

                try {
                    dsu.beginBatch();
                } catch (e) {
                    return callback(e);
                }

                utils.getMounts(dsu, '/', STATUS_MOUNT_PATH, (err, mounts) => {
                    if (err)
                        return cancelBatchCallback(err);
                    if (!mounts[STATUS_MOUNT_PATH])
                        return cancelBatchCallback(`Missing mount ${STATUS_MOUNT_PATH}`);

                    statusService.update(mounts[STATUS_MOUNT_PATH], statusUpdate, participantId, (err) => {
                        if (err)
                            return cancelBatchCallback(err);
                        dsu.commitBatch((err) => {
                            if (err)
                                return cancelBatchCallback(err);
                            self.get(keySSI, callback);
                        });
                    });
                });
            });
        })
    }

}

module.exports = SimpleShipmentService;