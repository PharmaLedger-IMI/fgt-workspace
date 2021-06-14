const { DB, DEFAULT_QUERY_OPTIONS, ANCHORING_DOMAIN } = require('../constants');
const OrderLine = require('../model').OrderLine;
const Manager = require("../../pdm-dsu-toolkit/managers/Manager");
/**
 * Issued OrderLine Manager Class.
 * @param {ParticipantManager} participantManager the top-level manager for this participant, which knows other managers.
 */
class ShipmentLineManager extends Manager {
    constructor(participantManager, callback) {
        super(participantManager, DB.shipmentLines, ['gtin', 'date', 'batch', 'requesterId', 'senderId'], (err, manager) => {
            if (err)
                return callback(err);
            manager.registerMessageListener((message) => {
                manager.processMessageRecord(message, (err) => {
                    if (err)
                        console.log(`Could not process message: ${err}`);
                    if (manager.controller)
                        manager.controller.refresh();
                });
            });
            callback(undefined, manager);
        });
        this.shipmentLineService = new (require('../services/ShipmentLineService'))(ANCHORING_DOMAIN);
    }

    /**
     * generates the db's key for the ShipmentLine
     * @param {string|number} requesterId
     * @param {string|number} senderId
     * @param {string|number} gtin
     * @param {string|number} date
     * @return {string}
     * @protected
     */
    _genCompostKey(requesterId, senderId, gtin, date){
        return `${requesterId}-${senderId}-${gtin}-${date}`;
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
     * @param {ShipmentLine} item
     * @param {string|object} record
     * @return {object} the indexed object to be stored in the db
     * @protected
     * @override
     */
    _indexItem(key, item, record) {
        return {
            gtin: item.gtin,
            date: Date.now(),
            batch: item.batch,
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
     * reads ssi for that OrderLine in the db. loads is and reads the info at '/info' and the status at '/status/info
     * @param {string} key
     * @param {boolean} [readDSU] defaults to true. decides if the manager loads and reads from the dsu or not
     * @param {function(err, object|KeySSI, Archive)} callback returns the Product if readDSU and the dsu, the keySSI otherwise
     */
    getOne(key, readDSU,  callback) {
        if (!callback){
            callback = readDSU;
            readDSU = true;
        }
        let self = this;
        self.getRecord(key, (err, itemSSI) => {
            if (err)
                return self._err(`Could not load record with key ${key} on table ${self._getTableName()}`, err, callback);
            if (!readDSU)
                return callback(undefined, itemSSI);
            self.shipmentLineService.get(itemSSI.value || itemSSI, callback);
        });
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
                return callback(undefined, records.map(r => r.pk));
            self._iterator(records.map(r => r.value), self.shipmentLineService.get, (err, result) => {
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

        let shipmentLines;
        try {
            shipmentLines = JSON.parse(message);
        } catch (e) {
            shipmentLines = [message];
        }

        const lines = [];

        const shipmentLineIterator = function(linesCopy, callback){
            const lineSSI = linesCopy.shift();
            if (!lineSSI)
                return callback(undefined, lines);
            self._getDSUInfo(lineSSI, (err, shipmentLine, shipmentLineDsu) => {
                if (err) {
                    console.log(`Could not read DSU from message keySSI in record ${message}. Skipping record.`);
                    return callback();
                }
                console.log(`Received ShipmentLine`, shipmentLine);
                const indexedItem = self._indexItem(undefined, shipmentLine, lineSSI);
                const compostKey = self._genCompostKey(shipmentLine.requesterId, shipmentLine.senderId, shipmentLine.gtin, indexedItem.date);
                self.insertRecord(compostKey, indexedItem, (err) => {
                    if (err)
                        return self._err(`Could not insert record for ShipmentLine ${compostKey}`, err, callback);
                    shipmentLineIterator(linesCopy, callback);
                });
            });
        }

        shipmentLineIterator(shipmentLines.slice(), (err, newLines) => {
            if (err)
                return self._err(`Could not register all shipmentlines`, err, callback);
            console.log(`ShipmentLines successfully registered: ${JSON.stringify(newLines)}`);
            callback(undefined, lines);
        });
    };
}

let shipmentLineManager;
/**
 * @param {ParticipantManager} participantManager
 * @param {function(err, Manager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @returns {ShipmentLineManager}
 */
const getShipmentLineManager = function (participantManager,  callback) {
    let manager;
    try {
        manager = participantManager.getManager(ShipmentLineManager);
        if (callback)
            return callback(undefined, manager);
    } catch (e){
        manager = new ShipmentLineManager(participantManager, callback);
    }

    return manager;
}

module.exports = getShipmentLineManager;
