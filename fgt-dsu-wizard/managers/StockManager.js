const {INFO_PATH, DB, DEFAULT_QUERY_OPTIONS, ANCHORING_DOMAIN} = require('../constants');
const Manager = require("../../pdm-dsu-toolkit/managers/Manager");
const {functionCallIterator} = require('../services').utils;
const Stock = require('../model/Stock');
const Batch = require('../model/Batch');
const StockStatus = require('../model/StockStatus');

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
 * @class StockManager
 * @extends Manager
 * @memberOf Managers
 */
class StockManager extends Manager{
    constructor(participantManager, serialization, aggregation, callback) {
        super(participantManager, DB.stock, ['name', 'gtin', 'manufName'], callback || aggregation);
        this.serialization = serialization;
        this.aggregation = callback ? aggregation : false;
        this.productService = undefined;
        this.batchService = undefined;
    }

    _getProduct(gtin, callback){
        if (!this.productService)
            this.productService = new (require('../services/ProductService'))(ANCHORING_DOMAIN);
        this.productService.getDeterministic(gtin, callback);
    }

    _getBatch(gtin, batch, callback){
        if (!this.batchService)
            this.batchService = new (require('../services/BatchService'))(ANCHORING_DOMAIN);
        this.batchService.getDeterministic(gtin, batch, callback)
    }

    /**
     * Creates a {@link Product} dsu
     * @param {string|number} [gtin] the table key
     * @param {Stock} stock
     * @param {function(err, keySSI, string)} callback where the string is the mount path relative to the main DSU
     */
    create(gtin, stock, callback) {
        if (!callback) {
            callback = stock;
            stock = gtin;
            gtin = stock.gtin;
        }
        let self = this;
        stock.quantity = stock.getQuantity();
        console.log(`Adding Stock for ${gtin} batches: ${stock.batches.map(b => b.batchNumber).join(', ')}`);
        self.insertRecord(gtin, stock, (err) => {
            if (err)
                return self._err(`Could not insert record with gtin ${gtin} on table ${self.tableName}`, err, callback);
            const path =`${self.tableName}/${gtin}`;
            console.log(`Stock for Product ${gtin} created stored at '${path}'`);
            callback(undefined, stock, path);
        });
    }

    /**
     * updates a product from the list
     * @param {string|number} [gtin] the table key
     * @param {Stock} newStock
     * @param {function(err, Stock)} callback
     * @override
     */
    update(gtin, newStock, callback){
        if (!callback){
            callback = newStock;
            newStock = gtin;
            gtin = newStock.gtin;
        }
        let self = this;
        self.updateRecord(gtin, newStock, (err) => {
            if (err)
                return self._err(`Could not update stock with gtin ${gtin}: ${err.message}`, err, callback);
            console.log(`Stock for Product ${gtin} updated`);
            callback(undefined, newStock)
        });
    }


    /**
     *
     * @param {Product} product
     * @param {Batch} batch
     * @param {function(err?, string[]?, Stock?)} callback
     */
    manage(product, batch, callback){
        const self = this;

        if (batch.length === 0)
            return callback();

        const gtin = product.gtin || product;

        const getBatch = function(gtin, batch, callback){
            self._getBatch(gtin, batch.batchNumber, (err, batchFromDSU) => {
                if (err)
                    return callback(err);
                batch = new Batch({
                    batchNumber: batchFromDSU.batchNumber,
                    expiry: batchFromDSU.expiry,
                    serialNumbers: batch.serialNumbers,
                    quantity: batch.quantity,
                    batchStatus: batchFromDSU.batchStatus
                })
                callback(undefined, batch);
            });
        }

        self.getOne(gtin, true, (err, stock) => {
            if (err){
                if (batch.quantity < 0)
                    return callback(`Trying to reduce from an unexisting stock`);

                const cb = function(product){
                    const newStock = new Stock(product);
                    getBatch(product.gtin, batch, (err, mergedBatch) => {
                        if (err)
                            return callback(err);
                        newStock.batches = [mergedBatch];
                        return self.create(gtin, newStock, (err, created, path) => {
                            if (err)
                                return callback(err);
                            callback(undefined, batch.serialNumbers || batch.quantity, newStock);
                        });
                    });
                }

                if (typeof product !== 'string')
                    return cb(product);

                return self._getProduct(product, (err, product) => err
                    ? callback(err)
                    : cb(product));
            }

            getBatch(gtin, batch, (err, updatedBatch) => {
                if (err)
                    return callback(err);

                const sb = stock.batches.map((b,i) => ({batch: b, index: i})).find(b => b.batch.batchNumber === batch.batchNumber);

                let serials;
                if (!sb){
                    if (batch.getQuantity() < 0)
                        return callback(`Given a negative amount on a unnexisting stock`);
                    stock.batches.push(updatedBatch);
                    console.log(`Added batch ${updatedBatch.batchNumber} with ${updatedBatch.serialNumbers ? updatedBatch.serialNumbers.length : updatedBatch.getQuantity()} items`);
                } else {
                    const newQuantity = sb.batch.getQuantity() + updatedBatch.getQuantity() ;
                    if (newQuantity < 0)
                        return callback(`Illegal quantity. Not enough Stock. requested ${batch.getQuantity() } of ${sb.batch.getQuantity() }`);
                    serials = sb.batch.manage(updatedBatch.getQuantity(), this.serialization);
                    stock.batches[sb.index] = new Batch({
                        batchNumber: updatedBatch.batchNumber,
                        expiry: updatedBatch.expiry,
                        batchStatus: updatedBatch.batchStatus,
                        quantity: sb.batch.getQuantity(),
                        serialNumbers: sb.batch.serialNumbers
                    });
                }

                self.update(gtin, stock, (err, results) => {
                    if (err)
                        return self._err(`Could not manage stock for ${gtin}: ${err.message}`, err, callback);
                    console.log(`Updated Stock for ${gtin} batch ${batch.batchNumber}. ${self.serialization && serials ? serials.join(', ') : ''}`);
                    callback(undefined, (serials && serials.length ? serials : undefined) || batch.serialNumbers || batch.quantity, results);
                });
            });


        });
    }

    /**
     *
     * @param {string} product gtin
     * @param {Batch[]} batches
     * @param {function(err?, {}?)} callback where {} as batchnumber as keys, as the added/removed serials as value
     */
    manageAll(product, batches, callback){
        const self = this;
        
        const dbAction = function(product, batches, callback){
            

            const iterator = function(product){
                return function(batch, callback){
                    return self.manage(product, batch, (err, serials, stock) => {
                        if (err)
                            return callback(err);
                        callback(undefined, batch, serials, stock);
                    });
                }
            }
    
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
                return self.batchSchedule(() => dbAction(product, batches, callback));
                //return callback(e);
            }

            functionCallIterator(iterator(product).bind(this), batches, (err, ...results) => {
                if (err)
                    return cb(`Could not perform manage all on Stock`);

                self.commitBatch((err) => {
                    if(err)
                        return cb(err);
                    const newStocks = [];
                    const mergedResult = results.reduce((accum, result) => {
                        accum[result[0].batchNumber] = accum[result[0].batchNumber] || [];
                        try {
                            accum[result[0].batchNumber].push(...(Array.isArray(result[1]) ? result[1] : [result[1]]))
                        } catch (e) {
                            console.log(e)
                        }
                        if (result.length >= 3)
                            newStocks.push(result[2])
                        return accum;
                    }, {});
        
                    callback(undefined, mergedResult, newStocks);
                });      
            });
        }

        dbAction(product, batches, callback);

    }

    /**
     * updates a product from the list
     * @param {string[]|number[]} [gtins] the table key
     * @param {Stock[]} newStocks
     * @param {function(err, Stock[])} callback
     * @override
     */
    updateAll(gtins, newStocks, callback){
        if (!callback){
            callback = newStocks;
            newStocks = gtins;
            gtins = newStocks.map(s => s.gtin);
        }
        let self = this;
        super.updateAll(gtins, newStocks, (err) => {
            if (err)
                return self._err(`Could not update products`, err, callback);
            console.log(`Products ${JSON.stringify(gtins)} updated`);
            callback(undefined, newStocks)
        });
    }

    /**
     * reads ssi for that gtin in the db. loads is and reads the info at '/info'
     * @param {string} gtin
     * @param {boolean} [readDSU] defaults to true. decides if the manager loads and reads from the dsu or not
     * @param {function(err, Stock|KeySSI, Archive)} callback returns the Product if readDSU and the dsu, the keySSI otherwise
     * @override
     */
    getOne(gtin, readDSU,  callback) {
        if (!callback){
            callback = readDSU;
            readDSU = true;
        }
        let self = this;
        self.getRecord(gtin, (err, stock) => {
            if (err)
                return self._err(`Could not load record with key ${gtin} on table ${self._getTableName()}`, err, callback);
            callback(undefined, new Stock(stock));
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
            query: ['gtin like /.*/g']
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
            callback(undefined, records.map(r => new Stock(r)));
        });
    }

    toModel(filteredStock, model){
        return Object.entries(filteredStock).map(([key, value]) => {
            return {
                gtin: key,
                name: value.name,
                batches: value.stock
            }
        });
    }
}


/**
 * @param {ParticipantManager} participantManager
 * @param {boolean} [serialization] defaults to true.
 * @param {function(err, Manager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @returns {StockManager}
 * @memberOf Managers
 */
const getStockManager = function (participantManager, serialization, callback) {
    if (!callback){
        callback = serialization;
        serialization = true;
    }
    let manager;
    try {
        manager = participantManager.getManager(StockManager);
        if (callback)
            return callback(undefined, manager);
    } catch (e){
        manager = new StockManager(participantManager, serialization, callback);
    }

    return manager;
}

module.exports = getStockManager;