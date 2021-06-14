const { DB, DEFAULT_QUERY_OPTIONS } = require('../constants');
const OrderManager = require("./OrderManager");
const getStockManager = require("./StockManager");
const {Order} = require('../model');

/**
 * Issued Order Manager Class - concrete OrderManager for issuedOrders.
 * @param {ParticipantManager} participantManager the top-level manager for this participant, which knows other managers.
 * @module Managers
 */
class ReceivedOrderManager extends OrderManager {
    constructor(participantManager, callback) {
        super(participantManager, DB.receivedOrders, ['orderId', 'requesterId'], (err, manager) => {
            if (err)
                return callback ? callback(err) : console.log(err);
            manager.registerMessageListener((message) => {
                manager.processMessageRecord(message, (err) => {
                    if (err)
                        console.log(`Could not process message: ${err}`);
                    if (manager.controller)
                        manager.controller.refresh();
                });
            });
            if (callback)
                callback(undefined, manager);
        });
        this.stockManager = getStockManager(participantManager);
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
        return {...super._indexItem(key, item, record), requesterId: item.requesterId}
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

        const orderSReadSSIStr = message;
        self._getDSUInfo(orderSReadSSIStr, (err, orderObj, orderDsu) => {
            if (err)
                return self._err(`Could not read DSU from message keySSI in record ${record}. Skipping record.`, err, callback);

            console.log(`ReceivedOrder`, orderObj);
            const orderId = orderObj.orderId;
            if (!orderId)
                return callback("ReceivedOrder doest not have an orderId. Skipping record.");

            self.insertRecord(self._genCompostKey(orderObj.requesterId, orderId), self._indexItem(orderId, orderObj, orderSReadSSIStr), callback);
        });
    };
}


/**
 * @param {ParticipantManager} participantManager
 * @param {function(err, Manager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @returns {OrderManager}
 * @module Managers
 */
const getReceivedOrderManager = function (participantManager,  callback) {
    let manager;
    try {
        manager = participantManager.getManager(ReceivedOrderManager);
        if (callback)
            return callback(undefined, manager);
    } catch (e){
        manager = new ReceivedOrderManager(participantManager, callback);
    }

    return manager;
}

module.exports = getReceivedOrderManager;
