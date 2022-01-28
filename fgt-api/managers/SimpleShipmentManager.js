const {log} = require('../utils');
const Batch = require('../../fgt-dsu-wizard/model/Batch');
const Manager = require("../../pdm-dsu-toolkit/managers/Manager");
const {BadRequest, InternalServerError} = require("../utils/errorHandler");
const {DB, DEFAULT_QUERY_OPTIONS, ANCHORING_DOMAIN} = require('../constants');


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
        super(participantManager, DB.issuedShipments, ['requesterId', 'orderId', 'senderId'], callback);
        this.participantManager = participantManager;
        this.stockManager = participantManager.getManager("StockManager");

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
     * @param {string|number} requesterId
     * @param {string|number} orderId
     * @return {string}
     * @protected
     */
    _genCompostKey(requesterId, orderId) {
        return `${requesterId}-${orderId}`;
    }

    /**
     * Creates a {@link SimpleShipment} dsu
     * @param {SimpleShipment} simpleShipment
     * @param {function(err?, KeySSI?, dbPath?)} callback where the dbPath follows a "tableName/shipmentId" template.
     * @override
     */
    create(simpleShipment, callback) {
        let self = this;
        const dbKey = this._genCompostKey(simpleShipment.requesterId, simpleShipment.orderId);

        const callbackCancelBatch = (err, ...results) => {
            if (err)
                return self.cancelBatch((_) => callback(err));
            callback(undefined, ...results);
        }

        const createInner = function (_callback) {
            self.simpleShipmentService.create(simpleShipment, (err, keySSI, shipmentLinesSSIs) => {
                if (err)
                    return callbackCancelBatch(`Could not create product DSU for ${simpleShipment.orderId}`);
                const shipmentSSI = keySSI.getIdentifier();
                log("Shipment SSI=" + shipmentSSI);
                self.insertRecord(dbKey, self._indexItem(simpleShipment, shipmentSSI), (err) => {
                    if (err)
                        return callbackCancelBatch(new BadRequest(`Could not insert record with orderId ${simpleShipment.orderId} on table ${self.tableName}. Trying to insert a existing record.`));

                    const path = `${self.tableName}/${simpleShipment.orderId}`;
                    log(`Shipment ${dbKey} created stored at DB '${path}'`);
                    self.sendMessagesAsync(simpleShipment, shipmentLinesSSIs, shipmentSSI);
                    _callback(undefined, keySSI, path);
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

            gtinIterator(gtins, batchesObj, (err) => {
                if (err)
                    return callbackCancelBatch(`Could not retrieve info from stock`);
                log(`Shipment updated after Stock confirmation`);
                createInner((err, keySSI, path) => {
                    if (err)
                        return callbackCancelBatch(`Could not create Shipment`);
                    self.commitBatch((err) => {
                        if (err)
                            return callbackCancelBatch(err);
                        log(`Shipment created from orderId: ${simpleShipment.orderId}`);
                        _callback(undefined, keySSI, path);
                    });
                })
            });
        }

        const aggBatchesByGtin = simpleShipment.shipmentLines.reduce((accum, sl) => {
            if (!accum.hasOwnProperty(sl.gtin))
                accum[sl.gtin] = [];
            accum[sl.gtin].push(new Batch({
                batchNumber: sl.batch,
                quantity: (-1) * sl.quantity
            }))
            return accum;
        }, {});

        dbAction(Object.keys(aggBatchesByGtin), aggBatchesByGtin, callback);
    }

    /**
     * @param {string | number} requesterId
     * @param {string | number} orderId
     * @param {boolean} readDSU
     * @param {function(err, SimpleShipment?)} callback
     */
    getOne(requesterId, orderId, readDSU, callback) {
        const key = this._genCompostKey(requesterId, orderId);
        this.getRecord(key, (err, record) => {
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
                return callback(new InternalServerError(`Could not parse SimpleShipments`));
            log(`Parsed ${result.length} simpleShipments`);

            const statusPopulateIterator = (accum, records, _callback) => {
                const record = records.shift();
                if (!record)
                    return _callback(undefined, accum);
                self.getOne(record.requesterId, record.orderId, true, (err, simpleShipment) => {
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
     * Returns a page object from provided dsuQuery or a keyword
     * @param {number} itemsPerPage
     * @param {number} page
     * @param {string | string[] } searchBy: dsuQuery or keyword
     * @param {string} sort
     * @param {boolean} readDSU
     * @param {function(err, Page)}callback
     */
    getPage(itemsPerPage, page, searchBy, sort, readDSU, callback) {
        return super.getPage.call(this, itemsPerPage, page, searchBy, sort, readDSU, callback);
    }

    /**
     * updates one SimpleShipment status (just the SimpleShipment can be updated)
     * @param {string | number} requesterId
     * @param {string  | number} orderId
     * @param {SimpleShipment} statusUpdate
     * @param {function(err, Shipment?, Archive?)} callback
     */
    update(requesterId, orderId, statusUpdate, callback) {
        const self = this;
        const key = self._genCompostKey(requesterId, orderId);
        self.getRecord(key, (err, record) => {
            if (err)
                return callback(new BadRequest(err));
            self.simpleShipmentService.update(record.value, statusUpdate, requesterId, (err, updatedSimpleShipment, keySSI, linesSSIs) => {
                if (err)
                    return callback(`Could not update Shipment from orderId ${orderId}. ${err}`);
                try {
                    self.sendMessagesAsync(updatedSimpleShipment, linesSSIs, keySSI);
                } catch (e) {
                    log(e);
                }
                callback(undefined, updatedSimpleShipment, keySSI);
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
        self.sendMessage(shipment.requesterId, DB.stock, aKey, (err) =>
            self._messageCallback(err ? `Could not sent message to ${shipment.shipmentId} with ${DB.receivedShipments}: ${err}` : err,
                `Message sent to ${shipment.requesterId}, ${DB.receivedShipments}, ${aKey}`));
        if (shipmentLinesSSIs)
            self.sendShipmentLinesToMAH([...shipment.shipmentLines], [...shipmentLinesSSIs], (err) =>
                self._messageCallback(err ? `Could not transmit shipmentLines to The manufacturers` : 'Lines Notice sent to Manufacturers'));
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
