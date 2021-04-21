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
        super(participantManager, DB.receivedOrders);
        this.participantManager = participantManager; // jpsl: TODO needed to work aroung the Manager.getMessages()
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
     * @param {Product} item
     * @param {string|object} record
     * @return {object} the indexed object to be stored in the db
     * @protected
     * @override
     */
    _indexItem(key, item, record) {
        return {
            orderId: key,
            value: record
        }
    };

    /**
     * Lists all received orders.
     * @param {boolean} [readDSU] defaults to true. decides if the manager loads and reads from the dsu's {@link INFO_PATH} or not
     * @param {object} [options] query options. defaults to {@link DEFAULT_QUERY_OPTIONS}
     * @param {function(err, Order[])} callback
     */
    getAll(readDSU, options, callback) {
        const defaultOptions = () => Object.assign({}, DEFAULT_QUERY_OPTIONS, {
            query: ['orderId like /.*/g']
        });

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

        let self = this;

        super.getAll(readDSU, options, (err, result) => {
            if (err)
                return self._err(`Could not parse ReceivedOrders ${JSON.stringify(result)}`, err, callback);
            console.log(`Parsed ${result.length} orders`);
            callback(undefined, result);
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
     * Process incoming, looking for receivedOrder messages.
     * @param {function(err)} callback
     */
    processMessages(callback) {
        let self = this;
        console.log("Processing messages");
        // TODO: self.getMessages() is broken. Go to the messageManager directly.
        // jpsl to Tiago: IMHO, the entry point for this should start at the participant, and not at the ReceivedOrderManager.
        // TODO optimize and ask for api = receivedOrders only
        self.participantManager.messenger.getMessages((err, records) => {
            console.log("Processing records: ", err, records);
            if (err)
                return callback(err);
            const processMessageRecord = function (record, callback) {
                // Process one record. If the message is broken, DO NOT DELETE IT, log to console, and skip to the next.
                console.log(`Processing record`, record);
                if (!record.api || record.api != DB.receivedOrders) {
                    console.log(`Message record ${record} does not have api=${DB.receivedOrders}`);
                    return callback();
                }
                if (!record.message || typeof record.message != "string") {
                    console.log(`Message record ${record} does not have property message as non-empty string with keySSI.`);
                    return callback();
                }
                const orderSReadSSIStr = record.message;
                self._getDSUInfo(orderSReadSSIStr, (err, orderObj, orderDsu) => {
                    if (err) {
                        console.log(`Could not read DSU from message keySSI in record ${record}`);
                        return callback();
                    }
                    console.log(`ReceivedOrder`, orderObj);
                    const orderId = orderObj.orderId;
                    if (!orderId) {
                        console.log("ReceivedOrder doest not have an orderId");
                        return callback();
                    }
                    self.insertRecord(orderId, self._indexItem(orderId, orderObj, orderSReadSSIStr), (err) => {
                        if (err) {
                            console.log("insertRecord failed", err);
                            return callback();
                        }
                        // and then delete message after processing.
                        console.log("Going to delete messages's record", record);
                        self.participantManager.messenger.deleteMessage(record, callback);
                        callback();
                    });
                });
            };
            const iterateRecords = function (records, callback) {
                if (!records || !Array.isArray(records))
                    return callback(`Message records ${records} is not an array!`);
                if (records.length <= 0)
                    return callback(); // done
                const record = records.shift();
                processMessageRecord(record, (err) => {
                    if (err)
                        return callback(err);
                    iterateRecords(records);
                });
            };
            iterateRecords([...records], callback);
        });
    }
}

let receivedOrderManager;
/**
 * @param {ParticipantManager} participantManager
 * @returns {OrderManager}
 */
const getReceivedOrderManager = function (participantManager, force) {
    if (!receivedOrderManager || force)
        receivedOrderManager = new ReceivedOrderManager(participantManager);
    return receivedOrderManager;
}

module.exports = getReceivedOrderManager;
