const { DB, DEFAULT_QUERY_OPTIONS } = require('../constants');
const OrderManager = require("./OrderManager");
const Order = require('../model').Order;
const Stock = require('../model').Stock;
const OrderLine = require('../model').OrderLine;
const OrderStatus = require('../model').OrderStatus;

/**
 * Issued Order Manager Class - concrete OrderManager for issuedOrders.
 * @param {ParticipantManager} participantManager the top-level manager for this participant, which knows other managers.
 */
class ReceivedOrderManager extends OrderManager {
    constructor(participantManager) {
        super(participantManager, DB.receivedOrders, ['orderId', 'requesterId']);
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

    // /**
    //  * Loads Stock that gtin in the db. loads is and reads the info at '/info'
    //  * @param {string} gtin
    //  * @param {boolean} [readDSU] defaults to true. decides if the manager loads and reads from the dsu or not
    //  * @param {function(err, object|KeySSI, Archive)} callback returns the Product if readDSU and the dsu, the keySSI otherwise
    //  */
    // getOne(gtin, readDSU,  callback) {
    //     if (!callback){
    //         callback = readDSU;
    //         readDSU = true;
    //     }
    //     let self = this;
    //     self.getRecord(gtin, (err, stock) => {
    //         if (err)
    //             return self._err(`Could not load Stock for product ${gtin} on table ${self._getTableName()}`, err, callback);
    //         stock = new Stock(stock);
    //         if (!readDSU)
    //             return callback(undefined, stock);
    //         // sort the orderlines
    //     });
    // }

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

let receivedOrderManager;
/**
 * @param {ParticipantManager} participantManager
 * @param {boolean} force
 * @returns {OrderManager}
 */
const getReceivedOrderManager = function (participantManager, force) {
    if (!receivedOrderManager || force)
        receivedOrderManager = new ReceivedOrderManager(participantManager);
    return receivedOrderManager;
}

module.exports = getReceivedOrderManager;
