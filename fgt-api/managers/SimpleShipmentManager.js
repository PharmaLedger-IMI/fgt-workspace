const {log} = require('../utils');
const Batch = require('../../fgt-dsu-wizard/model/Batch');
const Manager = require("../../pdm-dsu-toolkit/managers/Manager");
const {DB, DEFAULT_QUERY_OPTIONS, ANCHORING_DOMAIN} = require('../constants');
const {ShipmentStatus} = require('../../fgt-dsu-wizard/model');
const {SimpleShipment} = require('../model');
const {ROLE} = require("../../fgt-dsu-wizard/model/DirectoryEntry");


/**
 * Simple Shipment Manager Class - concrete ShipmentManager for issuedShipments.
 *
 * Manager Classes in this context should do the bridge between the controllers
 * and the services exposing only the necessary api to the controllers while encapsulating <strong>all</strong> business logic.
 *
 * All Manager Classes should be singletons.
 *
 * This complete separation of concerts is very beneficial for 2 reasons:
 * <ul>
 *     <li>Allows for testing since there's no browser dependent code (i think) since the DSUStorage can be 'mocked'</li>
 *     <li>Allows for different controllers access different business logic when necessary (while benefiting from the singleton behaviour)</li>
 * </ul>
 *
 * @param {ParticipantManager} participantManager
 * @param {function(err, Manager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @class SimpleShipmentManager
 * @extends ShipmentManager
 * @memberOf Managers
 */
class SimpleShipmentManager extends Manager {
    constructor(participantManager, callback) {
        super(participantManager, DB.simpleShipments, ['shipmentId', 'requesterId', 'orderId', 'senderId'], (err, manager) => {
            if (err)
                return callback ? callback(err) : console.log(err);
            manager.registerMessageListener((message, cb) => {
                manager.processMessageRecord(message, (err) => {
                    manager.refreshController(message.message);
                    cb(err);
                });
            });

            manager.stockManager = manager.stockManager || participantManager.getManager("StockManager");
            manager.directoryManager = manager.directoryManager || participantManager.getManager("DirectoryManager");

            if (callback)
                callback(undefined, manager);
        });

        this.participantManager = participantManager;
        this.stockManager = participantManager.getManager("StockManager");
        this.batchManager = participantManager.getManager("BatchManager");
        this.directoryManager = participantManager.getManager("DirectoryManager");
        this.simpleShipmentService = new (require('../services/SimpleShipmentService'))(ANCHORING_DOMAIN);
    }

    /**
     * Must wrap the DB entry in an object like:
     * <pre>
     *     {
     *         index1: ...
     *         index2: ...
     *         value: item
     *     }
     * </pre>
     * so the DB can be queried by each of the indexes and still allow for lazy loading
     * @param {string} [key]
     * @param {Shipment} item
     * @param {string|object} record
     * @return {object} the indexed object to be stored in the db
     * @protected
     * @override
     */
    _indexItem(key, item, record) {
        if (!record) {
            record = item;
            item = key;
            key = undefined;
        }
        const dbIndexes = {...super._indexItem(key, item, record)};
        this.indexes.forEach((index) => {
            dbIndexes[index] = item[index];
        })
        return dbIndexes;
    }

    /**
     * generates the db's key for the SimpleShipment
     * @param {SimpleShipment} simpleShipment
     * @return {string}
     * @protected
     */
    _genCompostKey(simpleShipment) {
        let shipmentId;
        const splitShipmentId = `${simpleShipment.shipmentId}`.split('-');
        if (this.getIdentity().id === simpleShipment.senderId) {
            if (splitShipmentId.length >= 2)
                shipmentId = splitShipmentId[splitShipmentId.length - 1];
            else
                shipmentId = simpleShipment.shipmentId;
        } else {
            if (splitShipmentId.length >= 2)
                shipmentId = simpleShipment.shipmentId;
            else
                shipmentId = `${simpleShipment.senderId}-${simpleShipment.shipmentId}`;
        }
        return shipmentId;
    }

    /**
     * Creates a {@link SimpleShipment} dsu
     * @param {SimpleShipment} simpleShipment
     * @param {function(err?, KeySSI?, dbPath?)} callback where the dbPath follows a "tableName/shipmentId" template.
     * @override
     */
    create(simpleShipment, callback) {
        let self = this;

        const callbackCancelBatch = (err, ...results) => {
            if (err)
                return self.cancelBatch((_) => callback(err));
            callback(undefined, ...results);
        }

        const addPartnerToDirectory = (simpleShipment, callback) => {
            const {requesterId, senderId} = simpleShipment;
            const partnerId = self.getIdentity().id === requesterId ? senderId : requesterId;
            const partnerPrefix = partnerId.slice(0, 3);
            const partner = {id: partnerId, role: ROLE[partnerPrefix]}
            if (!partner.role)
                return callback(`Not found a valid role to partner ${partnerId}`);
            const directoryKey = self.directoryManager._genCompostKey(partner);
            self.batchAllow(self.directoryManager);
            self.directoryManager.getOne(directoryKey, false, (err, _partner) => {
                if (!err && _partner) { // early return, partner already exists in directory
                    self.batchDisallow(self.directoryManager);
                    return callback(undefined, _partner);
                }

                self.directoryManager.create(partner, (err, partnerDbRecord) => {
                    self.batchDisallow(self.directoryManager);
                    if (err) {
                        log(`Partner ${partnerDbRecord.id} as ${partnerDbRecord.role} cannot be added to directory. Skipping...`);
                        return callback(undefined, undefined);
                    }
                    log(`Added partner ${partnerDbRecord.id} as ${partnerDbRecord.role} to directory from shipment ${simpleShipment.shipmentId}`);
                    return callback(undefined, partnerDbRecord);
                })
            })
        }

        const createInner = function (_callback) {
            simpleShipment.shipmentId = self._genCompostKey(simpleShipment);
            self.simpleShipmentService.create(simpleShipment, (err, keySSI, shipmentLinesSSIs) => {
                if (err)
                    return callbackCancelBatch(err);
                const shipmentSSI = keySSI.getIdentifier();
                const readSSI = keySSI.derive().getIdentifier();
                log("Shipment SSI=" + shipmentSSI);
                self.insertRecord(simpleShipment.shipmentId, self._indexItem(simpleShipment, shipmentSSI), (err) => {
                    if (err)
                        return callbackCancelBatch(`Could not insert record with shipmentId ${simpleShipment.shipmentId} on table ${self.tableName}. Trying to insert a existing record.`);

                    const path = `${self.tableName}/${simpleShipment.shipmentId}`;
                    log(`Shipment ${simpleShipment.shipmentId} created stored at DB '${path}'`);

                    addPartnerToDirectory(simpleShipment, (err, _) => {
                        if (err)
                            return callbackCancelBatch(err);
                        if (self.getIdentity().id === simpleShipment.senderId)
                            self.sendMessagesAsync(simpleShipment, shipmentLinesSSIs, readSSI);
                        _callback(undefined, keySSI, path);
                    });
                });
            });
        }

        const gtinIterator = function (gtins, batchesObj, _callback) {
            const gtin = gtins.shift();
            if (!gtin)
                return _callback();
            if (!(gtin in batchesObj))
                return _callback(`gtin ${gtin} not found in batches`);
            const batches = batchesObj[gtin];
            self.batchAllow(self.stockManager);
            self.stockManager.manageAll(gtin, batches, (err, removed) => {
                self.batchDisallow(self.stockManager);

                if (err)
                    return callbackCancelBatch(`Could not update Stock`);
                if (self.stockManager.serialization && self.stockManager.aggregation)
                    simpleShipment.shipmentLines.filter(sl => sl.gtin === gtin && Object.keys(removed).indexOf(sl.batch) !== -1).forEach(sl => {
                        sl.serialNumbers = removed[sl.batch];
                    });
                else
                    simpleShipment.shipmentLines = simpleShipment.shipmentLines.map(sl => {
                        sl.serialNumbers = undefined;
                        return sl;
                    });
                gtinIterator(gtins, batchesObj, _callback);
            })
        }

        const dbAction = function (gtins, batchesObj, _callback) {
            try {
                self.beginBatch();
            } catch (e) {
                return self.batchSchedule(() => dbAction(gtins, batchesObj, _callback));
            }

            createInner((err, keySSI, path) => {
                if (err)
                    return callbackCancelBatch(`Could not create Shipment`);

                if (self.getIdentity().id === simpleShipment.requesterId)
                    return self.commitBatch((err) => {
                        if (err)
                            return callbackCancelBatch(err);
                        log(`Shipment created from orderId: ${simpleShipment.orderId}`);
                        _callback(undefined, keySSI, path);
                    });

                gtinIterator(gtins, batchesObj, (err) => {
                    if (err)
                        return callbackCancelBatch(`Could not retrieve info from stock`);
                    log(`Shipment updated after Stock confirmation`);
                    self.commitBatch((err) => {
                        if (err)
                            return callbackCancelBatch(err);
                        log(`Shipment created from orderId: ${simpleShipment.orderId}`);
                        _callback(undefined, keySSI, path);
                    });
                });
            })
        }

        // multiplier factor to add or remove from stock
        const factor = (self.getIdentity().id === simpleShipment.requesterId) ? 1 : (-1);

        const validateAndAggBatchesByGtin = (shipmentLines, accum, _callback) => {
            const sl = shipmentLines.shift();
            if (!sl)
                return _callback(undefined, accum);

            self.batchManager.getOne(sl.gtin, sl.batch, (err, _) => {
                if (err)
                    return _callback(err);

                accum[sl.gtin].push(new Batch({
                    batchNumber: sl.batch,
                    quantity: factor * sl.quantity
                }))
                validateAndAggBatchesByGtin(shipmentLines, accum, _callback);
            });
        }

        validateAndAggBatchesByGtin(simpleShipment.shipmentLines, {}, (err, aggBatchesByGtin) => {
            if (err)
                return callback(err);
            dbAction(Object.keys(aggBatchesByGtin), aggBatchesByGtin, callback);
        });
    }

    /**
     * @param {string | number} shipmentId
     * @param {boolean} readDSU
     * @param {function(err, SimpleShipment?)} callback
     */
    getOne(shipmentId, readDSU, callback) {
        this.getRecord(shipmentId, (err, record) => {
            if (err)
                return callback(err);
            this.simpleShipmentService.get(record.value, (err, simpleShipment, dsu, linesSSI) => {
                if (err)
                    return callback(err);
                callback(undefined, simpleShipment);
            })
        });
    }

    /**
     * Lists all SimpleShipments.
     * @param {boolean} [readDSU] defaults to true. decides if the manager loads and reads from the dsu's {@link INFO_PATH} or not
     * @param {object} [options] query options. defaults to {@link DEFAULT_QUERY_OPTIONS}
     * @param {function(err, SimpleShipment[]?)} callback
     */
    getAll(readDSU, options, callback) {
        const self = this;
        const defaultOptions = () => Object.assign({}, DEFAULT_QUERY_OPTIONS);

        if (!callback) {
            if (!options) {
                callback = readDSU;
                options = defaultOptions();
                readDSU = true;
            }
            if (typeof readDSU === 'boolean') {
                callback = options;
                options = defaultOptions();
            }
            if (typeof readDSU === 'object') {
                callback = options;
                options = readDSU;
                readDSU = true;
            }
        }

        options = options || defaultOptions();

        super.getAll(readDSU, options, (err, result) => {
            if (err)
                return callback(`Could not parse SimpleShipments`);
            log(`Parsed ${result.length} simpleShipments`);

            const statusPopulateIterator = (accum, records, _callback) => {
                const record = records.shift();
                if (!record)
                    return _callback(undefined, accum);
                self.getOne(record.shipmentId, true, (err, simpleShipment) => {
                    if (err)
                        return _callback(err);
                    accum.push(simpleShipment);
                    statusPopulateIterator(accum, records, _callback);
                })
            }

            statusPopulateIterator([], result.slice(), (err, simpleShipments) => {
                if (err)
                    return callback(err);
                callback(undefined, simpleShipments);
            })
        });
    }

    /**
     * updates one SimpleShipment status (just the SimpleShipment can be updated)
     * @param {string | number} shipmentId
     * @param {Status} statusUpdate
     * @param {function(err, SimpleShipment?, Archive?)} callback
     */
    update(shipmentId, statusUpdate, callback) {
        const self = this;
        self.getRecord(shipmentId, (err, record) => {
            if (err)
                return callback(err);
            const shipmentSSI = record.value;
            self.simpleShipmentService.update(shipmentSSI, statusUpdate, self.getIdentity().id, (err, updatedSimpleShipment, keySSI, linesSSIs) => {
                if (err)
                    return callback(err);

                self.updateRecord(shipmentId, self._indexItem(shipmentId, updatedSimpleShipment, shipmentSSI), (err) => {
                    if (err)
                        return callback(`Could not update Shipment from shipmentId ${shipmentId}. ${err}`);
                    try {
                        self.sendMessagesAsync(updatedSimpleShipment, linesSSIs, shipmentSSI);
                    } catch (e) {
                        log(e);
                    }

                    // early return, don't need to add to stock
                    if (!(updatedSimpleShipment.requesterId === self.getIdentity().id && updatedSimpleShipment.status.status === ShipmentStatus.CONFIRMED))
                        return callback(undefined, updatedSimpleShipment, shipmentSSI);

                    // if requester and shipmentStatus confirmed, need to add to stock
                    const callbackCancelBatch = (err, ...results) => {
                        if (err)
                            return self.cancelBatch((_) => callback(err));
                        callback(undefined, ...results);
                    }

                    const dbAction = (gtins, batchesObj, _callback) => {
                        try {
                            self.beginBatch();
                        } catch (e) {
                            return self.batchSchedule(() => dbAction(gtins, batchesObj, _callback));
                        }

                        const gtinIterator = function(accum, gtins, batchObj, _callback){
                            const gtin = gtins.shift();
                            if (!gtin)
                                return _callback(undefined, accum);
                            const batches = batchObj[gtin];
                            self.batchAllow(self.stockManager);
                            self.stockManager.manageAll(gtin, batches, (err, newStocks) => {
                                self.batchDisallow(self.stockManager);
                                if (err)
                                    return _callback(err);

                                const cb = function(){
                                    accum[gtin] = accum[gtin] || [];
                                    accum[gtin].push(newStocks);
                                    gtinIterator(accum, gtins, batchObj, _callback);
                                }

                                self.batchAllow(self.directoryManager);
                                const key = self.directoryManager._genCompostKey("product", gtin);
                                self.directoryManager.getOne(key, (err, entry) => {
                                    if (!err) {
                                        self.batchDisallow(self.directoryManager);
                                        return cb();
                                    }
                                    self.directoryManager.saveEntry("product", gtin, (err) => {
                                        self.batchDisallow(self.directoryManager);
                                        if (err)
                                            return callback(err);
                                        cb()
                                    })
                                })
                            });
                        }

                        gtinIterator({}, gtins, batchesObj, (err) => {
                            if (err)
                                return callbackCancelBatch(`Could not update Stock`);
                            self.commitBatch((err) => {
                                if (err)
                                    return callbackCancelBatch(err);
                                log(`Stock updated from shipmentId: ${updatedSimpleShipment.shipmentId}`);
                                _callback(undefined, updatedSimpleShipment, shipmentSSI);
                            });
                        });
                    }

                    const aggBatchesByGtin = updatedSimpleShipment.shipmentLines.reduce((accum, sl) => {
                        if (!accum.hasOwnProperty(sl.gtin))
                            accum[sl.gtin] = [];
                        accum[sl.gtin].push(new Batch({
                            batchNumber: sl.batch,
                            quantity: sl.quantity
                        }))
                        return accum;
                    }, {});

                    dbAction(Object.keys(aggBatchesByGtin), aggBatchesByGtin, callback);
                });
            })
        });
    }

    /**
     * updates one or more SimpleShipment status (just the SimpleShipment can be updated)
     * @param {string[]} [keys] object keys that identify the record to be updated
     * @param {Object[]} statusUpdate: object with fields to be updated
     * @param {function(err, SimpleShipment[])} callback
     */
    updateAll(keys, statusUpdate, callback) {
        return super.updateAll(keys, statusUpdate, callback);
    }

    _processMessageRecord(message, callback) {
        const self = this;
        if (!message)
            return callback(`Message ${message} empty. Skipping record.`);

        const _updateReceiveShipment = (simpleShipment, statusUpdate, callback) => {
            self.getRecord(simpleShipment.shipmentId, (err, record) => {
                if (err)
                    return callback(err);

                const shipmentSSI = record.value;
                // when receive a message/shipment, who update record is the "opposite" partner
                const partnerUpdaterId = (simpleShipment.requesterId === self.getIdentity().id) ? simpleShipment.senderId : simpleShipment.requesterId;
                self.simpleShipmentService.update(shipmentSSI, statusUpdate, partnerUpdaterId, (err, updatedSimpleShipment, keySSI, linesSSIs) => {
                    if (err)
                        return callback(err);

                    self.updateRecord(simpleShipment.shipmentId, self._indexItem(updatedSimpleShipment.shipmentId, updatedSimpleShipment, shipmentSSI), (err) => {
                        if (err)
                            return callback(`Could not update Shipment from shipmentId ${simpleShipment.shipmentId}. ${err}`);
                        callback(undefined, updatedSimpleShipment, shipmentSSI);
                    });
                })
            });
        }

        if (typeof message === "string") {
            // #91 process an string mespsage with a keySSI.
            // These are not sent anymore, but it could be an old unprocessed message.
            self.simpleShipmentService.get(message, (err, receiveSimpleShipment) => {
                if (err)
                    return callback(err);
    
                receiveSimpleShipment.shipmentId = self._genCompostKey(receiveSimpleShipment);
                self.getOne(receiveSimpleShipment.shipmentId, true, (err, simpleShipment) => {
                    if (err)
                        return self.create(receiveSimpleShipment, (err, insertSimpleShipment) => callback(err));
    
                    _updateReceiveShipment(simpleShipment, receiveSimpleShipment.status, (err, updatedSimpleShipment) => callback(err))
                });
            });
        } else if (typeof message === "object") {
            // #91 process an object message with a simpleShipment
            const receiveSimpleShipment = new SimpleShipment(message); // A shallow clone object.
            if (!receiveSimpleShipment["shipmentId"])
                return callback(`Message ${message} object misses property shipmentId. Skipping record.`);
            receiveSimpleShipment.shipmentId = self._genCompostKey(receiveSimpleShipment);
            self.getOne(receiveSimpleShipment.shipmentId, true, (err, simpleShipment) => {
                if (err)
                    return self.create(receiveSimpleShipment, (err, insertSimpleShipment) => callback(err));
    
                _updateReceiveShipment(simpleShipment, receiveSimpleShipment.status, (err, updatedSimpleShipment) => callback(err))
            });
        } else {
            return callback(`Message ${message} is not an object, and neither a string, but a ${typeof message}. Skipping record.`);
        }
    };




    /**
     * messages to all MAHs.
     * the shipment is the same for the orderlines and their ssis because of the way the code is written
     * @param shipmentLines
     * @param shipmentLinesSSI
     * @param callback
     * @return {*}
     */
    sendShipmentLinesToMAH(shipmentLines, shipmentLinesSSI, callback) {
        const self = this;
        if (shipmentLines.length !== shipmentLinesSSI.length)
            return callback(`Invalid arguments`);

        const orderLineIterator = function (linesCopy, mahs, callback) {
            if (!callback) {
                callback = mahs;
                mahs = [];
            }

            const shipmentLine = linesCopy.shift();

            if (!shipmentLine) {
                log(`All MAHs resolved`)
                return callback(undefined, mahs);
            }

            self.simpleShipmentService.resolveMAH(shipmentLine, (err, mahId) => {
                if (err)
                    return self._err(`Could not resolve MAH for ${shipmentLine}`, err, callback);
                mahs.push(mahId);
                orderLineIterator(linesCopy, mahs, callback);
            });
        }

        orderLineIterator(shipmentLines.slice(), (err, resolvedMahs) => {
            if (err)
                return self._err(`Error resolving MAHs`, err, callback);

            const byMAH = resolvedMahs.reduce((accum, mah, i) => {
                (accum[mah] = accum[mah] || []).push(shipmentLinesSSI[i]);
                return accum;
            }, {});

            Object.keys(byMAH).forEach(mahId => {
                const ssis = byMAH[mahId].map(k => typeof k === 'string' ? k : k.getIdentifier());
                const message = JSON.stringify(ssis);
                self.sendMessage(mahId, DB.shipmentLines, message, (err) =>
                    self._messageCallback(err ? `Could not send message to MAH ${mahId} for shipmentLines ${JSON.stringify(byMAH[mahId])} with ssis ${ssis} ${err}` : err,
                        `ShipmentLines ${message} transmitted to MAH ${mahId}`));
            });

            callback();
        });
    }

    sendMessagesAsync(shipment, shipmentLinesSSIs, aKey) {
        if (!aKey) {
            aKey = shipmentLinesSSIs;
            shipmentLinesSSIs = undefined;
        }

        const self = this;
        const participantId = (shipment.requesterId === self.getIdentity().id) ? shipment.senderId : shipment.requesterId;

        // #91 send shipment as JSON object instead of the keySSI
        // Should object be cloned and stripped of the shipmentLines ?
        // self.sendMessage(participantId, DB.simpleShipments, aKey, (err) => { 
        self.sendMessage(participantId, DB.simpleShipments, shipment, (err) => {
            if (err)
                return self._messageCallback(err ? `Could not sent message to ${participantId} with ${DB.receivedShipments}: ${err}` : err);
            self._messageCallback(err, `Message sent to ${participantId}, ${DB.receivedShipments}, ${aKey}`);

            if (shipmentLinesSSIs)
                self.sendShipmentLinesToMAH([...shipment.shipmentLines], [...shipmentLinesSSIs], (err) =>
                    self._messageCallback(err ? `Could not transmit shipmentLines to The manufacturers` : 'Lines Notice sent to Manufacturers'));
        });
    }

    /**
     *
     * @param err
     * @param message
     * @protected
     * @override
     */
    _messageCallback(err, message) {
        super._messageCallback(err, message);
    }
}

/**
 * @param {ParticipantManager} participantManager
 * @param {function(err, Manager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @returns {IssuedShipmentManager}
 * @memberOf Managers
 */
const getSimpleShipmentManager = function (participantManager, callback) {
    let manager;
    try {
        manager = participantManager.getManager(SimpleShipmentManager);
        if (callback)
            return callback(undefined, manager);
    } catch (e) {
        manager = new SimpleShipmentManager(participantManager, callback);
    }

    return manager;
}

module.exports = getSimpleShipmentManager;
