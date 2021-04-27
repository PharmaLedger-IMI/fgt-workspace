const {INFO_PATH, ANCHORING_DOMAIN, DB, DEFAULT_QUERY_OPTIONS} = require('../constants');
const Manager = require("../../pdm-dsu-toolkit/managers/Manager");
const Batch = require('../model').Batch;

/**
 * Batch Manager Class
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
 * @class BatchManager
 */
class BatchManager extends Manager{
    constructor(participantManager, callback) {
        super(participantManager, DB.batches, ['gtin', 'batchNumber'], callback);
        this.productService = new (require('../services/ProductService'))(ANCHORING_DOMAIN);
        this.batchService = new (require('../services/BatchService'))(ANCHORING_DOMAIN);
    }

    /**
     * generates the db's key for the batch
     * @param {string|number} gtin
     * @param {string|number} batchNumber
     * @return {string}
     * @private
     */
    _genCompostKey(gtin, batchNumber){
        return `${gtin}-${batchNumber}`;
    }

    /**
     * Must wrap the entry in an object like:
     * <pre>
     *     {
     *         index1: ...
     *         index2: ...
     *         value: item
     *     }
     * </pre>
     * so the DB can be queried by each of the indexes and still allow for lazy loading
     * @param {string} key
     * @param {Batch} item
     * @param {string|object} record
     * @return {object} the indexed object to be stored in the db
     * @protected
     * @override
     */
    _indexItem(key, item, record){
        return {
            gtin: key,
            batchNumber: item.batchNumber,
            expiry: item.expiry,
            value: record
        }
    };

    /**
     * Creates a {@link Batch} dsu
     * @param {string|number} gtin
     * @param {Batch} batch
     * @param {function(err, keySSI, string)} callback first keySSI if for the batch, the second for its' product dsu
     * @override
     */
    create(gtin, batch, callback) {
        let self = this;
        self.batchService.create(gtin, batch, (err, keySSI) => {
            if (err)
                return callback(err);
            const record = keySSI.getIdentifier();
            const dbKey = self._genCompostKey(gtin, batch.batchNumber);
            self.insertRecord(dbKey, self._indexItem(gtin, batch, record), (err) => {
                if (err)
                    return self._err(`Could not inset record with gtin ${gtin} and batch ${batch.batchNumber} on table ${self.tableName}`, err, callback);
                const path =`${self.tableName}/${dbKey}`;
                console.log(`batch ${batch.batchNumber} created stored at '${path}'`);
                callback(undefined, keySSI, path);
            });
        });
    }

    /**
     * reads the specific Batch information from a given gtin (if exists and is registered to the mah)
     *
     * @param {string|number} gtin
     * @param {string|number} batchNumber
     * @param {boolean} [readDSU] defaults to true. decides if the manager loads and reads from the dsu or not
     * @param {function(err, Batch|KeySSI, Archive)} callback returns the batch if readDSU, the keySSI otherwise
     * @override
     */
    getOne(gtin, batchNumber, readDSU, callback){
        let key;
        if (!callback){
            if (typeof batchNumber === 'boolean'){
                key = gtin;
                callback = readDSU;
                readDSU = batchNumber;
            } else {
                callback = readDSU;
                readDSU = true;
                key = this._genCompostKey(gtin, batchNumber)
            }
        } else {
            key = this._genCompostKey(gtin, batchNumber);
        }
        super.getOne(key, readDSU, callback);
    }

    /**
     * Removes a product from the list (does not delete/invalidate DSU, simply 'forgets' the reference)
     * @param {string|number} gtin
     * @param {string|number} batchNumber
     * @param {function(err)} callback
     * @override
     */
    remove(gtin, batchNumber, callback) {
        super.remove(this._genCompostKey(gtin, batchNumber), callback);
    }

    /**
     *
     * @param model
     * @returns {Batch}
     * @override
     */
    fromModel(model){
        return new Batch(super.fromModel(model));
    }

    /**
     * updates a Batch from the list
     * @param {string|number} gtin
     * @param {Batch} newBatch
     * @param {function(err, Batch, Archive)} callback
     * @override
     */
    update(gtin, newBatch, callback){
        super.update(this._genCompostKey(gtin, newBatch.batchNumber), newBatch, callback);
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
            query: ['__timestamp > 0'],
            sort: "asc"
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
                return callback(undefined, records.map(r => self._genCompostKey(r.gtin, r.batchNumber)));
            records = records.map(r => r.value);
            self._iterator(records.slice(), self._getDSUInfo.bind(self), (err, result) => {
                if (err)
                    return self._err(`Could not parse ${self._getTableName()}s ${JSON.stringify(records)}`, err, callback);
                console.log(`Parsed ${result.length} ${self._getTableName()}s`);
                callback(undefined, result);
            });
        });
    }

    /**
     * Converts the text typed in a general text box into the query for the db
     * Subclasses should override this
     * @param {string} keyword
     * @return {string[]} query
     * @protected
     */
    _keywordToQuery(keyword){
        keyword = keyword || '.*';
        return [`gtin like /${keyword}/g`];
    }
}

let batchManager;
/**
 * @param {BaseManager} [participantManager] only required the first time, if not forced
 * @param {boolean} [force] defaults to false. overrides the singleton behaviour and forces a new instance.
 * Makes BaseManager required again!
 * @param {function(err, Manager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @returns {BatchManager}
 */
const getBatchManager = function (participantManager, force, callback) {
    if (typeof force === 'function'){
        callback = force;
        force = false;
    }
    if (!batchManager || force)
        batchManager = new BatchManager(participantManager, callback);
    return batchManager;
}

module.exports = getBatchManager;
