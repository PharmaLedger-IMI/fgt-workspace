const { DB, DEFAULT_QUERY_OPTIONS } = require('../constants');
const ShipmentManager = require("./ShipmentManager");
const {Shipment, Order, OrderStatus, ShipmentStatus, Wholesaler} = require('../model');

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
        shipment.shipmentId = shipment.shipmentId || (new Date()).toISOString();

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
     * @param {string} orderSSI the readSSI to the order that generates the shipment
     * @param {string|number} [shipmentId] the table key
     * @param {Shipment} shipment
     * @param {function(err, sReadSSI, dbPath)} callback where the dbPath follows a "tableName/shipmentId" template.
     * @override
     */
    create(orderSSI, shipment, callback) {
        let self = this;

        self.shipmentService.create(shipment, orderSSI, (err, keySSI, shipmentLinesSSIs) => {
            if (err)
                return self._err(`Could not create product DSU for ${shipment}`, err, callback);
            const record = keySSI.getIdentifier();
            console.log("Shipment SSI=" + record);
            self.insertRecord(super._genCompostKey(shipment.requesterId, shipment.shipmentId), self._indexItem(shipment, record), (err) => {
                if (err)
                    return self._err(`Could not insert record with shipmentId ${shipment.shipmentId} on table ${self.tableName}`, err, callback);
                const path = `${self.tableName}/${shipment.shipmentId}`;
                console.log(`Shipment ${shipment.shipmentId} created stored at DB '${path}'`);
                const aKey = keySSI.getIdentifier();
                self.sendMessage(shipment.requesterId, DB.receivedShipments, aKey, (err) =>
                    self._messageCallback(err ? `Could not sent message to ${shipment.shipmentId} with ${DB.receivedShipments}: ${err}` : err,
                        `Message sent to ${shipment.requesterId}, ${DB.receivedShipments}, ${aKey}`));

                self.sendShipmentLinesToMAH([...shipment.shipmentLines], [...shipmentLinesSSIs], (err) => err
                        ? self._err(`Could not transmit shipmentLines to The manufacturers`, err, callback)
                        : callback(undefined, keySSI, path));
            });
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
    if (typeof force === 'function'){
        callback = force;
        force = false;
    }
    if (!issuedShipmentManager || force)
        issuedShipmentManager = new IssuedShipmentManager(participantManager, callback);
    return issuedShipmentManager;
}

module.exports = getIssuedShipmentManager;
