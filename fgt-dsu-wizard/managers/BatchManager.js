const {ANCHORING_DOMAIN, DB} = require('../constants');
const Manager = require("../../pdm-dsu-toolkit/managers/Manager");
const {Batch, Notification} = require('../model');
const getStockManager = require('./StockManager');
const getNotificationManager = require('./NotificationManager');

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
        this.notificationManager = getNotificationManager(participantManager);
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
            status: item.batchStatus.status,
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
                    return self.batchSchedule(() => dbAction(dbKey, record, gtin, batch, product, callback));
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
        if (!callback)
            return callback(`No gtin Provided...`);

        const self = this;
        const key = this._genCompostKey(gtin, newBatch.batchNumber);
        self.getRecord(key, (err, record) => {
            if (err)
                return self._err(`Unable to retrieve record with key ${key} from table ${self._getTableName()}`, err, callback);
            self.batchService.update(gtin, record.value, newBatch, (err, updatedBatch, batchDsu) => {
                if (err)
                    return self._err(`Could not Update Batch DSU`, err, callback);

                const cb = function(err, ...results){
                    if (err)
                        return self.cancelBatch((err2) => {
                            callback(err);
                        });
                    callback(undefined, ...results);
                }

                const dbOperation = function (gtin, updatedBatch, record, callback){
                    try {
                        self.beginBatch();
                    } catch(e) {
                        return self.batchSchedule(() => dbOperation(gtin, updatedBatch, record, callback));
                    }

                    self.updateRecord(key, self._indexItem(gtin, updatedBatch, record.value), (err) => {
                        if (err)
                            return cb(err);
                        callback(undefined, updatedBatch, batchDsu);

                        self.stockManager.getOne(gtin, true, (err, stock) => {
                            if (err)
                                return cb(err); //TODO: if not in stock, it must be in transit. handle shipments.
                            const batch = stock.batches.find(b => b.batchNumber === updatedBatch.batchNumber);
                            if (!batch)
                                return cb(`could not find batch`)  //TODO: if not in stock, it must be in transit. handle shipments.
                            batch.batchStatus = updatedBatch.batchStatus;
                            self.batchAllow(self.stockManager);
                            self.stockManager.update(gtin, stock, (err) => {
                                self.batchDisallow(self.stockManager);
                                if (err)
                                    return cb(err);
                                self.commitBatch((err) => {
                                    if (err)
                                        return cb(err);
                                    self.stockManager.refreshController()

                                    self.stockManager.getStockTraceability(self.getIdentity().id, gtin, batch.batchNumber, (err, results) => {
                                        if (err || !results){
                                            console.log(`Could not calculate partners with batch to send`, err, results);
                                            return callback(undefined, newBatch);
                                        }

                                        const {partnersStock} = results;
                                        if (!partnersStock){
                                            console.log(`No Notification required. No stock found outside the producer for gtin ${gtin}, batch ${batch.batchNumber}`);
                                            return callback(undefined, newBatch);
                                        }


                                        const toBeNotified = Object.keys(partnersStock);

                                        const batchNotification = new Notification({
                                            subject: self.tableName,
                                            body: {
                                                gtin: gtin,
                                                batch: {
                                                    batchNumber: batch.batchNumber,
                                                    expiry: batch.expiry,
                                                    batchStatus: batch.batchStatus
                                                }
                                            }
                                        });

                                        self.notificationManager.pushToAll(toBeNotified, batchNotification, (err) => {
                                            if (err)
                                                console.log(`Could not send notifications to partners`, err);
                                            callback(undefined, newBatch);
                                        });
                                    });
                                });
                            });
                        });
                    });
                }

                dbOperation(gtin, updatedBatch, record, callback);
            });
        });
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
