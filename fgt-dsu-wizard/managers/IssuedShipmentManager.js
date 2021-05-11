const { DB, DEFAULT_QUERY_OPTIONS } = require('../constants');
const ShipmentManager = require("./ShipmentManager");
const {Shipment, Order, OrderStatus, ShipmentStatus} = require('../model');

/**
 * Issued Shipment Manager Class - concrete OrderManager for issuedShipments.
 *
 * @param {ParticipantManager} participantManager the top-level manager for this participant, which knows other managers.
 * @param {string} tableName the default table name for this manager eg: MessageManager will write to the messages table
 * @param {string[]} indexes the indexes to be applied to the table in the db. cannot be undefined
 * @param {function(err, Manager)} callback
 * @module managers
 * @class IssuedShipmentManager
 */
class IssuedShipmentManager extends ShipmentManager {
    constructor(participantManager, callback) {
        super(participantManager, DB.issuedShipments, ['requesterId'], callback);
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
     * @param {string} key
     * @param {Order} item
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
     * Creates a {@link Shipment} dsu
     * @param {string|number} [shipmentId] the table key
     * @param {Shipment} shipment
     * @param {function(err, sReadSSI, dbPath)} callback where the dbPath follows a "tableName/shipmentId" template.
     */
    create(shipmentId, shipment, callback) {
        if (!callback){
            callback = shipment;
            shipment = shipmentId;
            shipmentId = shipment.orderId;
        }
        let self = this;

        // messages to all MAHs.
        // the shipment is the same for the orderlines and their ssis because of the way the code is written
        const sendShipmentLinesToMAH = function(shipmentLines, shipmentLinesSSI, callback) {
            const shipmentLine = shipmentLines.shift();
            let ssi = shipmentLinesSSI.shift();

            if (!shipmentLine){
                console.log(`All orderlines transmited to MAH`)
                return callback();
            }
            self.shipmentService.resolveMAH(shipmentLine, (err, mahId) => {
                if (err)
                    return self._err(`Could not resolve MAH for ${shipmentLine}`, err, callback);
                if (typeof ssi !== 'string')
                    ssi = ssi.getIdentifier();
                self.sendMessage(mahId, DB.shipmentLines, ssi, (err) => {
                    if (err)
                        return self._err(`Could not send message to MAH ${mahId} for orderLine ${JSON.stringify(shipmentLine)} with ssi ${ssi}`, err, callback);
                    console.log(`Shipmentline ${JSON.stringify(shipmentLine)} transmitted to MAH ${mahId}`);
                    callback();
                })
            });

            sendShipmentLinesToMAH(shipmentLines, shipmentLinesSSI, callback);
        }

        self.shipmentService.create(shipment, (err, keySSI, shipmentLinesSSIs) => {
            if (err)
                return self._err(`Could not create product DSU for ${shipment}`, err, callback);
            const keySSIStr = keySSI.getIdentifier();
            const sReadSSI = keySSI.derive();
            const record = sReadSSI.getIdentifier();
            console.log("Order seedSSI="+ keySSIStr + " sReadSSI=" + record);
            self.insertRecord(super._genCompostKey(shipment.senderId, shipment.shipmentId), self._indexItem(shipment, record), (err) => {
                if (err)
                    return self._err(`Could not insert record with shipmentId ${shipment.shipmentId} on table ${self.tableName}`, err, callback);
                const path = `${self.tableName}/${shipment.shipmentId}`;
                console.log(`Shipment ${shipmentId} created stored at DB '${path}'`);
                // send a message to senderId
                // TODO send the message before inserting record ? The message gives error if senderId does not exist/not listening.
                // TODO derive sReadSSI from keySSI
                const aKey = keySSI.getIdentifier();
                this.sendMessage(shipment.requesterId, DB.receivedShipments, aKey, (err) => {
                    if (err)
                        return self._err(`Could not sent message to ${shipment.shipmentId} with ${DB.receivedShipments}`, err, callback);
                    console.log("Message sent to "+shipment.requesterId+", "+DB.receivedShipments+", "+aKey);
                    sendShipmentLinesToMAH([...shipment.shipmentLines], [...shipmentLinesSSIs], (err) => err
                            ? self._err(`Could not transmit shipmentLines to The manufacturers`, err, callback)
                            : callback(undefined, keySSI, path));
                });
            });
        });
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
}

let issuedShipmentManager;
/**
 * @param {ParticipantManager} participantManager
 * @param {boolean} [force] defaults to false. overrides the singleton behaviour and forces a new instance.
 * Makes Participant Manager required again!
 * @param {function(err, Manager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @returns {IssuedShipmentManager}
 */
const getIssuedShipmentManager = function (participantManager, force, callback) {
    if (!issuedShipmentManager || force)
        issuedShipmentManager = new IssuedShipmentManager(participantManager);
    return issuedShipmentManager;
}

module.exports = getIssuedShipmentManager;
