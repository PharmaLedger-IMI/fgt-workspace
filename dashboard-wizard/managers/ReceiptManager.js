const {INFO_PATH, DB, DEFAULT_QUERY_OPTIONS} = require('../../fgt-dsu-wizard/constants');
const ApiManager = require("./ApiManager");
const Receipt = require('../../fgt-dsu-wizard/model/Receipt');
const IndividualReceipt = require('../../fgt-dsu-wizard/model/IndividualReceipt');

const ACTION = {
    REQUEST: 'request',
    REQUEST_ALL: 'requestAll',
    RESPONSE: 'response',
    CREATE: 'create'
}

class RequestCache {
    cache = {};
    timeout;

    constructor(timeout) {
        this.timeout = timeout;
    }

    checkPendingRequest(id) {
        return id in this.cache;
    }

    submitRequest(id, callback){
        if (id in this.cache)
            return callback(`Id already Exists!`);
        this.cache[id] = callback;

        const self = this;
        setTimeout(() => {
            if (self.timeout && self.checkPendingRequest(id))
                callback(new Error(`Unable to contact manufName, message canceled by timeout after ${self.timeout / 1000}s.`))
        }, self.timeout || 0)
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
class ReceiptManager extends ApiManager{
    constructor(participantManager, callback) {
        super(participantManager, DB.receipts, ['batchNumber', 'gtin', 'sellerId', 'serialNumber', 'manufName', 'status'],  callback);
        this.requestCache = new RequestCache(25000);
        this.stockManager = participantManager.stockManager;
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
        return super.getOne(id, readDSU, callback);
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

        super.getAll(readDSU, options, callback)
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