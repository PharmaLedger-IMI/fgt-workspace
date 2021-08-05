const {INFO_PATH, DB, DEFAULT_QUERY_OPTIONS, ANCHORING_DOMAIN} = require('../constants');
const Manager = require("../../pdm-dsu-toolkit/managers/Manager");
const Receipt = require('../model/Receipt');

/**
 * Stock Manager Class
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
 * @class ReceiptManager
 * @extends Manager
 * @memberOf Managers
 */
class ReceiptManager extends Manager{
    constructor(participantManager, callback) {
        super(participantManager, DB.receipts, ['id', 'products', 'sellerId'],  (err, manager) => {
            if (err)
                return callback ? callback(err) : console.log(err);
            manager.registerMessageListener((message) => {
                manager.processMessageRecord(message, (err) => {
                    if (err)
                        console.log(`Could not process message: ${err}`);
                    manager.refreshController();
                });
            });
            if (callback)
                callback(undefined, manager);
        });

        this.saleService = new (require('../services').SaleService)(ANCHORING_DOMAIN);
    }

    /**
     *
     * @param key
     * @param item
     * @param {Receipt} record
     * @return {{}}
     * @private
     */
    _indexItem(key, item, record) {
        if (!record){
            record = item;
            item = key;
            key = item.id;
        }
        return Object.assign(record, {
            value: record,
            products: record.productList
                .map(ip => `${ip.gtin}-${ip.batchNumber}-${ip.serialNumber}`)
                .join(',')})
    }

    _genCompostKey(receipt){
        return `${receipt.senderId}-${receipt.id}`;
    }

    _getDSUInfo(keySSI, callback){
        this.saleService.get(keySSI, callback);
    }

    _processMessageRecord(message, callback) {
        let self = this;
        if (!message || typeof message !== "string")
            return callback(`Message ${message} does not have  non-empty string with keySSI. Skipping record.`);

        let products;
        try {
            products = JSON.parse(message);
        } catch (e) {
            products = [message];
        }

        const lines = [];

        const productsIterator = function(linesCopy, callback){
            const lineSSI = linesCopy.shift();
            if (!lineSSI)
                return callback(undefined, lines);
            self._getDSUInfo(lineSSI, (err, shipmentLine, shipmentLineDsu) => {
                if (err) {
                    console.log(`Could not read DSU from message keySSI in record ${message}. Skipping record.`);
                    return callback();
                }
                const compostKey = self._genCompostKey(shipmentLine.requesterId, shipmentLine.senderId, shipmentLine.gtin, shipmentLine.createdOn);

                const cb = function(err){
                    if (err)
                        return self._err(`Could not insert/update record for ShipmentLine ${compostKey}`, err, callback);
                    productsIterator(linesCopy, callback);
                }

                self.getRecord(compostKey,  (err, record) => {
                    if (!err){
                        console.log(`Received ShipmentLine`, shipmentLine);
                        return self.insertRecord(compostKey, self._indexItem(undefined, shipmentLine, lineSSI), cb);
                    }
                    console.log(`Updating ShipmentLine`, shipmentLine);
                    self.updateRecord(compostKey, self._indexItem(undefined, shipmentLine, lineSSI), cb);
                });
            });
        }

        productsIterator(products.slice(), (err, newLines) => {
            if (err)
                return self._err(`Could not register all receipts`, err, callback);
            console.log(`Receipts successfully registered: ${JSON.stringify(newLines)}`);
            callback(undefined, lines);
        });
    };

    /**
     * Creates a {@link Sale} entry
     * @param {Sale} receipt
     * @param {function(err, keySSI, string)} callback where the string is the mount path relative to the main DSU
     */
    create(receipt, callback) {
        return callback(`Receipts cannot be manufactured`);
    }

    /**
     * updates a product from the list
     * @param {string|number} [id] the table key
     * @param {Receipt} newReceipt
     * @param {function(err, Sale?)} callback
     * @override
     */
    update(id, newReceipt, callback){
        return callback(`All sales are final`);
    }

    /**
     * reads ssi for that gtin in the db. loads is and reads the info at '/info'
     * @param {string} id
     * @param {boolean} [readDSU] defaults to true. decides if the manager loads and reads from the dsu or not
     * @param {function(err, Receipt|KeySSI, Archive)} callback returns the Product if readDSU and the dsu, the keySSI otherwise
     * @override
     */
    getOne(id, readDSU,  callback) {
        if (!callback){
            callback = readDSU;
            readDSU = true;
        }
        let self = this;
        self.getRecord(id, (err, receipt) => {
            if (err)
                return self._err(`Could not load record with key ${id} on table ${self._getTableName()}`, err, callback);
            if (!readDSU)
                return callback(undefined, new Receipt(receipt));
            self._getDSUInfo(receipt.value, callback)
        });
    }

    /**
     * Lists all registered items according to query options provided
     * @param {boolean} [readDSU] defaults to true. decides if the manager loads and reads from the dsu's {@link INFO_PATH} or not
     * @param {object} [options] query options. defaults to {@link DEFAULT_QUERY_OPTIONS}
     * @param {function(err, object[])} callback
     * @override
     */
    getAll(readDSU, options, callback){
        const defaultOptions = () => Object.assign({}, DEFAULT_QUERY_OPTIONS, {
            query: [
                "__timestamp > 0",
                'id like /.*/g'
            ],
            sort: "dsc"
        });

        if (!callback){
            if (!options){
                callback = readDSU;
                options = defaultOptions();
                readDSU = true;
            }
            if (typeof readDSU === 'boolean'){
                callback = options;
                options = defaultOptions();
            }
            if (typeof readDSU === 'object'){
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
                return callback(undefined, records.map(Receipt));
            self._iterator(records.map(r => r.value), self._getDSUInfo.bind(self), (err, result) => {
                if (err)
                    return self._err(`Could not parse ${self._getTableName()}s ${JSON.stringify(records)}`, err, callback);
                console.log(`Parsed ${result.length} ${self._getTableName()}s`);
                callback(undefined, result);
            });
        });
    }
}


/**
 * @param {ParticipantManager} participantManager
 * @param {function(err, Manager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @returns {ReceiptManager}
 * @memberOf Managers
 */
const getReceiptManager = function (participantManager, callback) {
    let manager;
    try {
        manager = participantManager.getManager(ReceiptManager);
        if (callback)
            return callback(undefined, manager);
    } catch (e){
        manager = new ReceiptManager(participantManager, callback);
    }

    return manager;
}

module.exports = getReceiptManager;