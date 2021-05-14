const { DB, DEFAULT_QUERY_OPTIONS } = require('../constants');
const ShipmentManager = require("./ShipmentManager");
const {Order, Stock, OrderLine, OrderStatus} = require('../model');

/**
 * Issued Order Manager Class - concrete ShipmentManager for issuedOrders.
 * @param {ParticipantManager} participantManager the top-level manager for this participant, which knows other managers.
 */
class ReceivedShipmentManager extends ShipmentManager {
    constructor(participantManager, callback) {
        super(participantManager, DB.receivedShipments, ['requesterId'], callback);
        const self = this;
        this.registerMessageListener((message) => {
            self.processMessageRecord(message, (err) => {
                if (err)
                    console.log(`Could not process message: ${err}`);
                if (self.controller)
                    self.controller.refresh();
            });
        });
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
        return {...super._indexItem(key, item, record), senderId: item.senderId}
    };

    /**
     * Converts the text typed in a general text box into the query for the db
     * Subclasses should override this
     * @param {string} keyword
     * @return {string[]} query
     * @protected
     * @override
     */
    _keywordToQuery(keyword) {
        keyword = keyword || '.*';
        return [`orderId like /${keyword}/g`];
    }

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
     * @param {function(err)} callback
     * @protected
     * @override
     */
    _processMessageRecord(message, callback) {
        let self = this;
        if (!message || typeof message !== "string")
            return callback(`Message ${message} does not have  non-empty string with keySSI. Skipping record.`);

        self._getDSUInfo(message, (err, shipmentObj, orderDsu) => {
            if (err)
                return self._err(`Could not read DSU from message keySSI in record ${record}. Skipping record.`, err, callback);

            console.log(`ReceivedShipment`, shipmentObj);
            const shipmentId = shipmentObj.shipmentId;
            if (!shipmentId)
                return callback("ReceivedShipment doest not have an shipmentId. Skipping record.");

            self.insertRecord(self._genCompostKey(shipmentObj.requesterId, shipmentId), self._indexItem(shipmentId, shipmentObj, message), callback);
        });
    };
}

let receivedShipmentManager;
/**
 * @param {ParticipantManager} participantManager
 * @param {boolean} [force] defaults to false. overrides the singleton behaviour and forces a new instance.
 * Makes Participant Manager required again!
 * @param {function(err, Manager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @returns {ReceivedShipmentManager}
 */
const getReceivedShipmentManager = function (participantManager, force, callback) {
    if (!receivedShipmentManager || force)
        receivedShipmentManager = new ReceivedShipmentManager(participantManager, callback);
    return receivedShipmentManager;
}

module.exports = getReceivedShipmentManager;
