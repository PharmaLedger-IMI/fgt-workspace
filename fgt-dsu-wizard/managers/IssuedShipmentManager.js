const { DB, DEFAULT_QUERY_OPTIONS } = require('../constants');
const ShipmentManager = require("./ShipmentManager");
const getReceivedOrderManager = require("./ReceivedOrderManager");
const {Shipment, Order, OrderStatus, ShipmentStatus, Wholesaler, Batch} = require('../model');


/**
 * Issued Shipment Manager Class - concrete ShipmentManager for issuedShipments.
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
 * @class IssuedShipmentManager
 * @extends Manager
 * @memberOf Managers
 */
class IssuedShipmentManager extends ShipmentManager {
    constructor(participantManager, callback) {
        super(participantManager, DB.issuedShipments, ['requesterId'], callback);
        this.participantManager = participantManager;
        this.stockManager = participantManager.stockManager;
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
        if (!record){
            record = item;
            item = key;
            key = undefined;
        }
        return {...super._indexItem(key, item, record), requesterId: item.requesterId};
    }

    /**
     * Binds the {@link Shipment#shipmentId} to the shipment and fills in participant details;
     * @param {Shipment} shipment
     * @param {function(err, Shipment)} callback
     * @private
     */
    _bindParticipant(shipment, callback){
        shipment.shipmentId = shipment.shipmentId || Date.now();

        let self = this;
        self.getIdentity((err, wholesaler) => {
            if (err)
                return self._err(`Could not retrieve identity`, err, callback);
            wholesaler = new Wholesaler(wholesaler);
            shipment.senderId = wholesaler.id;
            shipment.shipFromAddress = wholesaler.originAddress || wholesaler.address;
            shipment.shipmentLines = shipment.shipmentLines.map(sl => {
                sl.senderId = wholesaler.id;
                sl.status = shipment.status;
                return sl;
            })
            callback(undefined, shipment);
        });
    }


    /**
     * Creates a {@link Shipment} dsu
     * @param {string} orderId the id to the received order that generates the shipment
     * @param {Shipment} shipment
     * @param {function(err, KeySSI, dbPath)} callback where the dbPath follows a "tableName/shipmentId" template.
     * @override
     */
    create(orderId, shipment, callback) {
        let self = this;

        const cb = function(err, ...results){
            if (err)
                return self.cancelBatch(err2 => {
                    callback(err);
                });
            callback(undefined, ...results);
        }

        const createInner = function(callback){
            const receivedOrderManager = getReceivedOrderManager(self.participantManager);
                const receivedOrderKey = receivedOrderManager._genCompostKey(shipment.requesterId, orderId);

            receivedOrderManager.getOne(receivedOrderKey, true, (err, order, orderDSU, orderSSI) => {
                if(err)
                    return cb(`Could not retrieve received order ${orderId}`);
                self.shipmentService.create(shipment, orderSSI, (err, keySSI, shipmentLinesSSIs) => {
                    if(err)
                        return cb(`Could not create product DSU for ${shipment}`);
                    const record = keySSI.getIdentifier();
                    console.log("Shipment SSI=" + record);
                    self.insertRecord(self._genCompostKey(shipment.requesterId, shipment.shipmentId), self._indexItem(shipment, record), (err) => {
                        if(err)
                            return cb(`Could not insert record with shipmentId ${shipment.shipmentId} on table ${self.tableName}`);

                        const path = `${self.tableName}/${shipment.shipmentId}`;
                        console.log(`Shipment ${shipment.shipmentId} created stored at DB '${path}'`);
                        const aKey = keySSI.getIdentifier();
                        self.sendMessagesAsync(shipment, shipmentLinesSSIs, aKey);
                        callback(undefined, keySSI, path);
                    });
                });
            });
        }

        const gtinIterator = function(gtins, batchesObj, callback){
            const gtin = gtins.shift();
            if (!gtin)
                return callback();
            if (!(gtin in batchesObj))
                return callback(`gtins not found in batches`);
            const batches = batchesObj[gtin];
            self.batchAllow(self.stockManager);
            self.stockManager.manageAll(gtin,  batches, (err, removed) => {
                self.batchDisallow(self.stockManager);

                if(err)
                    return cb(`Could not update Stock`);
                if (self.stockManager.serialization && self.stockManager.aggregation)
                    shipment.shipmentLines.filter(sl => sl.gtin === gtin && Object.keys(removed).indexOf(sl.batch) !== -1).forEach(sl => {
                        sl.serialNumbers = removed[sl.batch];
                    });
                else
                    shipment.shipmentLines = shipment.shipmentLines.map(sl => {
                        sl.serialNumbers = undefined;
                        return sl;
                    });
                gtinIterator(gtins, batchesObj, callback);
            })
        }

        const gtins = shipment.shipmentLines.map(sl => sl.gtin);
        const batchesObj = shipment.shipmentLines.reduce((accum, sl) => {
            accum[sl.gtin] = accum[sl.gtin] || [];
            accum[sl.gtin].push(new Batch({
                batchNumber: sl.batch,
                quantity: (-1) * sl.quantity
            }))
            return accum;
        }, {});

        const dbAction = function (gtins, batchesObj, callback){

            try {
                self.beginBatch();
            } catch (e){
                return self.batchSchedule(() => dbAction(gtins, batchesObj, callback));
                //return callback(e);
            }

            gtinIterator(gtins, batchesObj, (err) => {
                if(err)
                    return cb(`Could not retrieve info from stock`);
                console.log(`Shipment updated after Stock confirmation`);
                createInner((err, keySSI, path) => {
                    if(err)
                        return cb(`Could not create Shipment`);
                    self.commitBatch((err) => {
                        if(err)
                            return cb(err);
                        console.log(`Shipment ${shipment.shipmentId} created!`);
                        callback(undefined, keySSI, path);
                    });
                })
            });
        }

        dbAction(gtins, batchesObj, callback);
    }

    sendMessagesAsync(shipment, shipmentLinesSSIs, aKey){
        if (!aKey){
            aKey = shipmentLinesSSIs;
            shipmentLinesSSIs = undefined;
        }

        const self = this;
        self.sendMessage(shipment.requesterId, DB.receivedShipments, aKey, (err) =>
            self._messageCallback(err ? `Could not sent message to ${shipment.shipmentId} with ${DB.receivedShipments}: ${err}` : err,
                `Message sent to ${shipment.requesterId}, ${DB.receivedShipments}, ${aKey}`));
        if (shipmentLinesSSIs)
            self.sendShipmentLinesToMAH([...shipment.shipmentLines], [...shipmentLinesSSIs], (err) =>
                self._messageCallback( err ? `Could not transmit shipmentLines to The manufacturers` : 'Lines Notice sent to Manufacturers'));
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

    /**
     * Lists all issued orders.
     * @param {boolean} [readDSU] defaults to true. decides if the manager loads and reads from the dsu's {@link INFO_PATH} or not
     * @param {object} [options] query options. defaults to {@link DEFAULT_QUERY_OPTIONS}
     * @param {function(err, Order[])} callback
     */
    getAll(readDSU, options, callback) {
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

        let self = this;
        super.getAll(readDSU, options, (err, result) => {
            if (err)
                return self._err(`Could not parse IssuedShipments ${JSON.stringify(result)}`, err, callback);
            console.log(`Parsed ${result.length} shipments`);
            callback(undefined, result);
        });
    }

    /**
     * updates an Issued Shipment
     *
     * @param {string} [key] key is optional so child classes can override them
     * @param {Shipment} shipment
     * @param {function(err, Shipment?, Archive?)} callback
     */
    update(key, shipment, callback){
        if (!callback){
            callback = shipment;
            shipment = key;
            key = this._genCompostKey(shipment.requesterId, shipment.shipmentId);
        }
        const self = this;
        super.update(key, shipment, (err, updatedShipment, keySSI, orderId, linesSSIs) => {
            if (err)
                return self._err(`Could not update Shipment`, err, callback);
            try {
                self.sendMessagesAsync(updatedShipment, linesSSIs, keySSI);
            } catch (e) {
                console.log(e);
            }
            callback(undefined, updatedShipment, keySSI);
        });
    }

    updateByOrder(shipmentId, order, callback){
        const shipmentKey = this._genCompostKey(order.requesterId, shipmentId);
        const self = this;
        self.getOne(shipmentKey, false, (err, record) => {
            if (err)
                return self._err(`Could not get Shipment to update`, err, callback);
            self._getDSUInfo(record, (err, shipment) => {
                if (err)
                    return self._err(`Unable to read shipment DSU`, err, callback);
                shipment.status = order.status
                self.shipmentService.update(record, shipment, (err, updatedShipment, dsu, orderId, shipmentLinesSSIs) => {
                    if (err)
                        return self._err(`Could not update shipment dsu`, err, callback);
                    self.updateRecord(shipmentKey, self._indexItem(shipmentKey, updatedShipment, record), (err) => {
                        if (err)
                            return self._err(`Could not update shipment record`, err, callback);
                        self.sendShipmentLinesToMAH([...shipment.shipmentLines], [...shipmentLinesSSIs], (err) =>
                            self._messageCallback( err ? `Could not transmit shipmentLines to The manufacturers` : 'Lines Notice sent to Manufacturers'));
                        self.refreshController({
                            mode: 'issued',
                            shipment: updatedShipment
                        });
                        callback();
                    });
                });
            });
        });
    }
}

/**
 * @param {ParticipantManager} participantManager
 * @param {function(err, Manager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @returns {IssuedShipmentManager}
 * @memberOf Managers
 */
const getIssuedShipmentManager = function (participantManager,  callback) {
    let manager;
    try {
        manager = participantManager.getManager(IssuedShipmentManager);
        if (callback)
            return callback(undefined, manager);
    } catch (e){
        manager = new IssuedShipmentManager(participantManager, callback);
    }

    return manager;
}

module.exports = getIssuedShipmentManager;
