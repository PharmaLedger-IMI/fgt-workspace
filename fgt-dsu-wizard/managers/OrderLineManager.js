const { DB, DEFAULT_QUERY_OPTIONS } = require('../constants');
const OrderLine = require('../model').OrderLine;
const Manager = require("../../pdm-dsu-toolkit/managers/Manager");
/**
 * Issued OrderLine Manager Class.
 * @param {ParticipantManager} participantManager the top-level manager for this participant, which knows other managers.
 */
class OrderLineManager extends Manager {
    constructor(participantManager, callback) {
        super(participantManager, DB.orderLines, ['gtin', 'date', 'requesterId', 'senderId'], callback);
        const self = this;
        this.registerMessageListener((message) => {
            self.processMessageRecord(message, (err) => {
                if (err)
                    console.log(`Error processing message: ${message}`);
                });
            });
    }

    /**
     * generates the db's key for the OrderLine
     * @param {string|number} requesterId
     * @param {string|number} gtin
     * @param {string|number} date
     * @return {string}
     * @protected
     */
    _genCompostKey(requesterId, gtin, date){
        return `${requesterId}-${gtin}-${date}`;
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
     * @param {OrderLine} item
     * @param {string|object} record
     * @return {object} the indexed object to be stored in the db
     * @protected
     * @override
     */
    _indexItem(key, item, record) {
        return {
            gtin: item.gtin,
            date: Date.now(),
            requesterId: item.requesterId,
            senderId: item.senderId,
            value: record
        }
    };

    /**
     * Converts the text typed in a general text box into the query for the db
     * Subclasses should override this
     * @param {string} keyword
     * @return {string[]} query
     * @protected
     */
    _keywordToQuery(keyword) {
        keyword = keyword || '.*';
        return [`gtin like /${keyword}/g`];
    }

    /**
     * Lists all received orders.
     * @param {boolean} [readDSU] defaults to true. decides if the manager loads and reads from the dsu's {@link INFO_PATH} or not
     * @param {object} [options] query options. defaults to {@link DEFAULT_QUERY_OPTIONS}
     * @param {function(err, Order[])} callback
     */
    getAll(readDSU, options, callback) {
        const defaultOptions = () => Object.assign({}, DEFAULT_QUERY_OPTIONS, {
            query: ['date > 0'],
            sort: 'dsc'
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

        options = options || defaultOptions();

        let self = this;
        self.query(options.query, options.sort, options.limit, (err, records) => {
            if (err)
                return self._err(`Could not perform query`, err, callback);
            if (!readDSU)
                return callback(undefined, records.map(r => r.orderId));
            records = records.map(r => r.value);
            self._iterator(records.slice(), self._getDSUInfo.bind(self), (err, result) => {
                if (err)
                    return self._err(`Could not parse ${self._getTableName()}s ${JSON.stringify(records)}`, err, callback);
                console.log(`Parsed ${result.length} ${self._getTableName()}s`);
                callback(undefined, result);
            });
        });
    }

    _processMessageRecord(message, callback) {
        let self = this;
        if (!message || typeof message !== "string")
            return callback(`Message ${message} does not have  non-empty string with keySSI. Skipping record.`);

        const orderLineSSI = message;
        self._getDSUInfo(orderLineSSI, (err, orderLine, orderDsu) => {
            if (err) {
                console.log(`Could not read DSU from message keySSI in record ${message}. Skipping record.`);
                return callback();
            }
            console.log(`Received OrderLine`, orderLine);
            const indexedItem = self._indexItem(undefined, orderLine, orderLineSSI);
            self.insertRecord(self._genCompostKey(orderLine.requesterId, orderLine.gtin, indexedItem.date), indexedItem, callback);
        });
    };
}

let orderLineManager;
/**
 * @param {ParticipantManager} participantManager
 * @param {boolean} [force] defaults to false. overrides the singleton behaviour and forces a new instance.
 * Makes BaseManager required again!
 * @param {function(err, Manager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @returns {OrderLineManager}
 */
const getOrderLineManager = function (participantManager, force, callback) {
    if (typeof force === 'function'){
        callback = force;
        force = false;
    }
    if (!orderLineManager || force)
        orderLineManager = new OrderLineManager(participantManager, callback);
    return orderLineManager;
}

module.exports = getOrderLineManager;
