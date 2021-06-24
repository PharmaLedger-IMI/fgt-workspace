const {INFO_PATH, DB, DEFAULT_QUERY_OPTIONS} = require('../constants');
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
    constructor(participantManager, serialization, callback) {
        super(participantManager, DB.stock, ['name', 'gtin', 'manufName'], callback);
        this.serialization = serialization;
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


    manage(product, batch, callback){
        const self = this;

        if (batch.length === 0)
            return callback();

        const gtin = product.gtin || product;

        self.getOne(gtin, true, (err, stock) => {
            if (err){
                if (batch.quantity < 0)
                    return callback(`Trying to reduce from an unexisting stock`);
                if (typeof product === 'string')
                    return callback(`Must provide a product when adding to stock`)
                const newStock = new Stock(product);
                newStock.batches = [batch];
                return self.create(gtin, newStock, callback);
            }

            const sb = stock.batches.find(b => b.batchNumber === batch.batchNumber);

            let serials;
            if (!sb){
                if (batch.getQuantity() < 0)
                    return callback(`Given a negative amount on a unexisting stock`);
                stock.batches.push(batch);
                console.log(`Added batch ${batch.batchNumber} with ${batch.serialNumbers ? batch.serialNumbers.length : batch.getQuantity()} items`);
            } else {
                const newQuantity = sb.getQuantity()  + batch.getQuantity() ;
                if (newQuantity < 0)
                    return callback(`Illegal quantity. Not enough Stock. requested ${batch.getQuantity() } of ${sb.getQuantity() }`);
                serials = sb.manage(batch.getQuantity() , this.serialization);
            }

            self.update(gtin, stock, (err) => {
                if (err)
                    return self._err(`Could not manage stock for ${gtin}: ${err.message}`, err, callback);
                console.log(`Updated Stock for ${gtin} batch ${batch.batchNumber}. ${self.serialization && serials ? serials.join(', ') : ''}`);
                callback(undefined, serials || batch.serialNumbers || batch.quantity);
            });
        });
    }

    manageAll(product, batches, callback){
        const self = this;
        const iterator = function(product){
            return function(batches, callback){
                return self.manage(product, batches, callback);
            }
        }

        functionCallIterator(iterator(product).bind(this), ['batchNumber'], batches, (err, results) => {
            if (err)
                return self._err(`Could not perform manage all on Stock`, err, callback);
            results = Object.keys(results).reduce((accum, key) => {
                accum[key] = results[key][0];
                return accum;
            }, {})
            callback(undefined, results);
        });
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
            newStocks = gtin;
            gtins = newStock.map(s => s.gtin);
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
            callback(undefined, records);
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