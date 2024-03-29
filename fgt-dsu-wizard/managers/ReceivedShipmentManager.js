const { DB, DEFAULT_QUERY_OPTIONS } = require('../constants');
const ShipmentManager = require("./ShipmentManager");
const {Order, Stock, OrderLine, OrderStatus} = require('../model');

const getIssuedOrderManager = require('./IssuedOrderManager');
const {toPage, paginate} = require("../../pdm-dsu-toolkit/managers/Page");

/**
 * Received Shipment Manager Class - concrete ShipmentManager for received Shipments.
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
 * @class ReceivedShipmentManager
 * @extends ShipmentManager
 * @memberOf Managers
 */
class ReceivedShipmentManager extends ShipmentManager {
    constructor(participantManager, callback) {
        super(participantManager, DB.receivedShipments, ['senderId', 'requesterId'], (err, manager) => {
            if (err)
                return callback ? callback(err) : console.log(err);

            getIssuedOrderManager(participantManager, (err, issuedOrderManager) => {
                if (err)
                    console.log(`Could not get IssuedOrderManager:`, err);
                else
                    manager.issuedOrderManager = issuedOrderManager;

                manager.registerMessageListener((message, cb) => {
                    manager.processMessageRecord(message, (err) => {
                        manager.refreshController();
                        cb(err);
                    });
                });

                if (callback)
                    callback(undefined, manager);
            });
        });

        this.issuedOrderManager = this.issuedOrderManager || undefined;
    }


    /**
     * Not necessary for this manager
     * @override
     */
    create(key, item, callback) {
        callback(`This manager does not have this functionality`);
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
        return {...super._indexItem(key, item, record), senderId: item.senderId, requesterId: item.requesterId}
    };

    /**
     * Lists all received orders.
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

        super.getAll(readDSU, options, callback);
    }

    /**
     * Processes the received messages, saves them to the the table and deletes the message
     * @param {*} message
     * @param {function(err?)} callback
     * @protected
     * @override
     */
    _processMessageRecord(message, callback) {
        let self = this;
        if (!message || typeof message !== "string")
            return callback(`Message ${message} does not have  non-empty string with keySSI. Skipping record.`);

        self._getDSUInfo(message, (err, shipmentObj, shipmentDsu) => {
            if (err)
                return self._err(`Could not read DSU from message keySSI in record ${message}. Skipping record.`, err, callback);

            console.log(`ReceivedShipment`, shipmentObj);
            const shipmentId = shipmentObj.shipmentId;
            if (!shipmentId)
                return callback("ReceivedShipment doest not have an shipmentId. Skipping record.");
            const shipmentKey = self._genCompostKey(shipmentObj.senderId, shipmentId);

            const cb = function(err){
                if (err)
                    return self._err(`Could not insert record:\n${err.message}`, err, callback);
                self.issuedOrderManager._getDSUInfo(shipmentObj.orderSSI, (err, orderObj) => {
                    if (err)
                        return self._err(`Could not read order Info`, err, callback);
                    self.issuedOrderManager.updateOrderByShipment(orderObj.orderId, message, shipmentObj, callback);
                });
            }

            self.getRecord(shipmentKey, (err, record) => {
                if (err){
                    console.log(`received new ReceivedShipment`, shipmentObj)
                    return self.insertRecord(shipmentKey, self._indexItem(shipmentId, shipmentObj, message), cb);
                }
                console.log(`Updating ReceivedShipment`, shipmentObj)
                self.updateRecord(shipmentKey, self._indexItem(shipmentKey, shipmentObj, message), cb);
            });
        });
    };

    /**
     * updates an item
     *
     * @param {string} [key] key is optional so child classes can override them
     * @param {Shipment} shipment
     * @param {function(err, Shipment?, Archive?)} callback
     */
    update(key, shipment, callback){
        callback(`Functionality not available`);
    }
}


/**
 * @param {ParticipantManager} participantManager
 * @param {function(err, Manager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @returns {ReceivedShipmentManager}
 * @memberOf Managers
 */
const getReceivedShipmentManager = function (participantManager, callback) {
    let manager;
    try {
        manager = participantManager.getManager(ReceivedShipmentManager);
        if (callback)
            return callback(undefined, manager);
    } catch (e){
        manager = new ReceivedShipmentManager(participantManager, callback);
    }

    return manager;
}

module.exports = getReceivedShipmentManager;
