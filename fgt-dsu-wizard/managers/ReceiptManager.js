const {INFO_PATH, DB, DEFAULT_QUERY_OPTIONS, ANCHORING_DOMAIN} = require('../constants');
const Manager = require("../../pdm-dsu-toolkit/managers/Manager");
const Receipt = require('../model/Receipt');
const IndividualReceipt = require('../model/IndividualReceipt');
const {toPage, paginate} = require("../../pdm-dsu-toolkit/managers/Page");

const ACTION = {
    REQUEST: 'request',
    RESPONSE: 'response',
    CREATE: 'create'
}

class RequestCache {
    cache = {};

    submitRequest(id, callback){
        if (id in this.cache)
            return callback(`Id already Exists!`);
        this.cache[id] = callback;
        console.log(`Tracking request ${id} submitted`);
    }

    getRequest(id){
        if (!(id in this.cache))
            throw new Error(`Id does not exist in cache!`);
        const cb = this.cache[id];
        delete this.cache[id];
        return cb;
    }
}

class ReceiptMessage {
    id;
    action;
    message;
    requesterId;
    error;

    constructor(receiptMessage){
        if (typeof receiptMessage !== undefined)
            for (let prop in receiptMessage)
                if (receiptMessage.hasOwnProperty(prop))
                    this[prop] = receiptMessage[prop];

        if (!this.action || (!this.error && !this.message))
            throw new Error(`Needs id, action and a error or message`);
        if (this.action === ACTION.REQUEST && !this.id)
            this.id = (`${Date.now()}` + Math.random()).replace('.', '')
        if (this.action === ACTION.REQUEST && !this.requesterId)
            throw new Error("Needs a requester Id for that action");
    }
}

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
        super(participantManager, DB.receipts, ['batchNumber', 'gtin', 'sellerId', 'serialNumber', 'manufName', 'status'],  (err, manager) => {
            if (err)
                return callback ? callback(err) : console.log(err);
            manager.registerMessageListener((message, cb) => {
                manager.processMessageRecord(message, (err) => {
                    manager.refreshController();
                    cb(err);
                });
            });
            if (callback)
                callback(undefined, manager);
        });

        this.requestCache = new RequestCache();
        this.stockManager = participantManager.stockManager;
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
            key = this._genCompostKey(item);
        }
        return Object.assign(item, {
            value: record
           })
    }

    /**
     * @param {IndividualReceipt} individualReceipt
     * @returns {string}
     */
    _genCompostKey(individualReceipt){
        return `${individualReceipt.gtin}-${individualReceipt.batchNumber}-${individualReceipt.serialNumber}`;
    }

    _convertKey(receiptId) {
        const [gtin, batchNumber, serialNumber] = receiptId.split('-');
        return {gtin, batchNumber, serialNumber};
    }

    _getDSUInfo(keySSI, callback){
        const self = this;
        this.saleService.get(keySSI, (err, sale) => {
            if (err)
                return self._err(`Unable to read Sale DSU ${keySSI}`, err, callback);
            callback(undefined, new Receipt(sale));
        });
    }

    _processMessageRecord(message, callback) {
        let self = this;

        const createReceipt = () => {
            if (!message || !Array.isArray(message))
                return callback(`Message ${message} does not have  non-empty string with keySSI. Skipping record.`);

            const cb = function(err, ...results){
                if (err)
                    return self.cancelBatch(err2 => {
                        callback(err);
                    });
                callback(undefined, ...results);
            }

            const receipts = message;

            const lines = [];

            const receiptIterator = function(receiptsCopy, callback){
                const receiptSSI = receiptsCopy.shift();
                if (!receiptSSI)
                    return callback(undefined, lines);
                self._getDSUInfo(receiptSSI, (err, receipt) => {
                    if (err) {
                        console.log(`Could not read DSU from Receipt keySSI in record ${message}. Skipping record.`);
                        return callback(err);
                    }

                    const individualReceiptIterator = function(indReceiptCopy, accumulator, callback){
                        if (!callback){
                            callback = accumulator;
                            accumulator = [];
                        }
                        const indReceipt = indReceiptCopy.shift();
                        if (!indReceipt)
                            return callback(undefined, accumulator);

                        const compostKey = self._genCompostKey(indReceipt);
                        self.getRecord(compostKey, (err, rec) => {
                            if (!err){
                                console.log(rec);
                                return callback(`There is already an entry for this individual product ${compostKey}, and all sales are final!`);
                            }

                            self.insertRecord(compostKey, self._indexItem(compostKey, indReceipt, receiptSSI), (err) => {
                                if (err)
                                    return self._err(`Could not insert new Individual Receipt ${compostKey} in the db`, err, callback);
                                accumulator.push(compostKey);
                                console.log(`New Individual Receipt added: ${compostKey}`);
                                individualReceiptIterator(indReceiptCopy, accumulator, callback);
                            });
                        });
                    }

                    individualReceiptIterator(receipt.productList.slice(), callback);
                });
            }

            const dbAction = function(receipts, callback){
                try {
                    self.beginBatch();
                } catch (e){
                    return self.batchSchedule(() => dbAction(receipts, callback));
                    //return callback(e);
                }

                receiptIterator(receipts.slice(), (err, newIndividualReceipts) => {
                    if (err)
                        return cb(`Could not register all receipts`);
                    self.commitBatch((err) => {
                        if(err)
                            return cb(err);
                        console.log(`Receipts successfully registered: ${JSON.stringify(newIndividualReceipts)}`);
                        callback(undefined, newIndividualReceipts);
                    });
                });
            }

            dbAction(receipts, callback);
        }

        switch (message.action) {
            case ACTION.REQUEST:
                const receiptId = message.message;
                return self.getOne(receiptId, true, (err, receipt) => {
                    if ((!err && receipt) && receipt.sellerId !== message.requesterId) {
                        err = new Error(`Receipt requester must be the seller.`);
                        receipt = undefined;
                    }
                    self._replyToMessage(message.id, message.requesterId, err, receipt, self._messageCallback)
                    callback();
                });
            case ACTION.RESPONSE:
                let cb;
                try {
                    cb = self.requestCache.getRequest(message.id);
                } catch (e) {
                    return callback(e);
                }
                cb(message.error, message.message);
                return callback();
            default:
                createReceipt();
                callback();
        }
    };

    _replyToMessage(messageId, requesterId, error, receipt, callback){
        const reply = new ReceiptMessage({
            id: messageId,
            action: ACTION.RESPONSE,
            message: receipt,
            requesterId: requesterId,
            error: error ? error.message || error : undefined
        });
        this.sendMessage(requesterId, reply, callback);
    }

    /**
     * Creates a {@link Sale} entry
     * @param {IndividualReceipt} receipt
     * @param {function(err?, keySSI?, string?)} callback where the string is the mount path relative to the main DSU
     */
    create(receipt, callback) {
        callback(`Receipts cannot be manufactured`);
    }

    /**
     * updates a product from the list
     * @param {string|number} [id] the table key
     * @param {IndividualReceipt} newReceipt
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
     * @param {function(err, IndividualReceipt|KeySSI, Archive)} callback returns the Product if readDSU and the dsu, the keySSI otherwise
     * @override
     */
    getOne(id, readDSU,  callback) {
        if (!callback){
            callback = readDSU;
            readDSU = true;
        }
        let self = this;
        self.stockManager._getProduct(self._convertKey(id).gtin, (err, product) => {
            if (err)
                return self._err(`Could not find product from receiptId on stock.`, err, callback);

            const identity = self.getIdentity().id;
            if (identity === product.manufName) {
                return self.getRecord(id, (err, receipt) => {
                    if (err)
                        return self._err(`Could not load record with key ${id} on table ${self._getTableName()}`, err, callback);
                    if (!readDSU)
                        return callback(undefined, receipt.pk);
                    callback(undefined, new IndividualReceipt(receipt));
                });
            }

            const message = new ReceiptMessage({
                id: identity + Date.now(),
                action: ACTION.REQUEST,
                message: id,
                requesterId: identity
            });
            self.requestCache.submitRequest(message.id, callback);
            self.sendMessage(product.manufName, message, self._messageCallback);
        })
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
                return callback(undefined, records.map(r => r.pk));
            callback(undefined, records.map( r => new IndividualReceipt(r)));
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