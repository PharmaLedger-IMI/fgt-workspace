const { DB, DEFAULT_QUERY_OPTIONS } = require('../constants');
const OrderManager = require("./OrderManager");
const Order = require('../model').Order;
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
            self._processMessageRecord(message, (err) => {
                if (err)
                    console.log(`Could not process message: ${err}`);
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

        let self = this;
        self.query(options.query, options.sort, options.limit, (err, records) => {
            if (err)
                return self._err(`Could not perform query`, err, callback);
            if (!readDSU)
                return callback(undefined, records.map(r => self._genCompostKey(r.requesterId, r.orderId)));
            records = records.map(r => r.value);
            self._iterator(records.slice(), self._getDSUInfo.bind(self), (err, result) => {
                if (err)
                    return self._err(`Could not parse ${self._getTableName()}s ${JSON.stringify(records)}`, err, callback);
                console.log(`Parsed ${result.length} ${self._getTableName()}s`);
                callback(undefined, result);
            });
        });
        /*
        let orderLine1 = new OrderLine('123', 1, '', '');
        let orderLine2 = new OrderLine('321', 5, '', '');
        let order1 = new Order("IOID1", "TPID1", 'WHSID555', "SA1", OrderStatus.CREATED, [orderLine1, orderLine2]);
        let order2 = new Order("IOID2", "TPID2", 'WHSID432', "SA1", OrderStatus.CREATED, [orderLine1, orderLine2]);
        return callback(undefined, [
            order1,order2,order1,order2,order1,order2,order1,order2,
            order1,order2,order1,order2,order1,order2,order1,order2,
            order1,order2,order1,order2,order1,order2,order1,order2,
            order1,order2,order1,order2,order1,order2,order1,order2,
            order1,order2,order1,order2,order1,order2,order1,order2,
            order1,order2,order1,order2,order1,order2,order1,order2,
            order1,order2,order1,order2,order1,order2,order1,order2,
            order1,order2,order1,order2,order1,order2,order1,order2,
        ]);
        */

        /*
        super.listMounts(RECEIVED_ORDERS_MOUNT_PATH, (err, mounts) => {
            if (err)
                return callback(err);
            console.log(`Found ${mounts.length} orders at ${ISSUED_ORDERS_MOUNT_PATH}`);
            mounts = mounts.map(m => {
                console.log("Listing mounted m", m);
                m.path = `${ISSUED_ORDERS_MOUNT_PATH}/${m.path}`;
                return m;
            });
            super.readAll(mounts, callback);
        });
        */
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
