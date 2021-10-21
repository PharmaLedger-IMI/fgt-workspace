const {ANCHORING_DOMAIN, DB} = require('../constants');
const Manager = require("../../pdm-dsu-toolkit/managers/Manager");
const Batch = require('../model').Batch;
const getStockManager = require('./StockManager');

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
 * @extends Manager
 * @memberOf Managers
 */
class BatchManager extends Manager{
    constructor(participantManager, callback) {
        super(participantManager, DB.batches, ['gtin', 'batchNumber', 'expiry'], callback);
        this.stockManager = getStockManager(participantManager);
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
     * Util function that loads a BatchDSU and reads its information
     * @param {string|KeySSI} keySSI
     * @param {function(err, Batch, Archive)} callback
     * @protected
     * @override
     */
    _getDSUInfo(keySSI, callback){
        return this.batchService.get(keySSI, callback);
    }

    /**
     * Creates a {@link Batch} dsu
     * @param {Product} product
     * @param {Batch} batch
     * @param {function(err, keySSI, string)} callback first keySSI if for the batch, the second for its' product dsu
     * @override
     */
    create(product, batch, callback) {
        let self = this;

        const gtin = product.gtin;

        self.batchService.create(gtin, batch, (err, keySSI) => {
            if (err)
                return callback(err);
            const record = keySSI.getIdentifier();
            const dbKey = self._genCompostKey(gtin, batch.batchNumber);

            const dbAction = function(dbKey, record, gtin, batch, product, callback){

                const cb = function(err, ...results){
                    if (err)
                        return self.cancelBatch(err2 => {
                            callback(err);
                        });
                    callback(undefined, ...results);
                }

                try {
                    self.beginBatch();
                } catch (e){ 
                    return self2.batchSchedule(() => dbAction(dbKey, record, gtin, batch, product, callback));
                    //return callback(e);
                }

                self.insertRecord(dbKey, self._indexItem(gtin, batch, record), (err) => {
                    if(err){
                        console.log(`Could not inset record with gtin ${gtin} and batch ${batch.batchNumber} on table ${self.tableName}`);
                        return cb(err);
                    }
                    const path =`${self.tableName}/${dbKey}`;
                    console.log(`batch ${batch.batchNumber} created stored at '${path}'`);
    
                    self.batchAllow(self.stockManager);
    
                    self.stockManager.manage(product, batch, (err) => {   
                        self.batchDisallow(self.stockManager);

                        if(err){
                            console.log(`Error Updating Stock for ${product.gtin} batch ${batch.batchNumber}: ${err.message}`);
                            return cb(err);
                        }
                        console.log(`Stock for ${product.gtin} batch ${batch.batchNumber} updated`);
                        self.commitBatch((err) => {
                            if(err)
                                return cb(err);
                            callback(undefined, keySSI, path);
                        });                
                    });
                });
            }

            dbAction(dbKey, record, gtin, batch, product, callback);

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
        return callback(`Batch DSUs cannot be updated`);
    }

    /**
     * Converts the text typed in a general text box into the query for the db
     * Subclasses should override this
     * @param {string} keyword
     * @return {string[]} query
     * @protected
     * @override
     */
    _keywordToQuery(keyword){
        keyword = keyword || '.*';
        return [`gtin like /${keyword}/g`];
    }
}

/**
 * @param {BaseManager} participantManager
 * @param {function(err, Manager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @returns {BatchManager}
 * @memberOf Managers
 */
const getBatchManager = function (participantManager, callback) {
    let manager;
    try {
       manager = participantManager.getManager(BatchManager);
        if (callback)
            return callback(undefined, manager);
    } catch (e){
       manager = new BatchManager(participantManager, callback);
    }

    return manager;
}

module.exports = getBatchManager;
