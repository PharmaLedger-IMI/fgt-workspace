const {INFO_PATH, DB, DEFAULT_QUERY_OPTIONS} = require('../constants');
const Manager = require("../../pdm-dsu-toolkit/managers/Manager");
const Stock = require('../model/Stock');
const Batch = require('../model/Batch');
const StockStatus = require('../model/StockStatus');

/**
 * Manager Classes in this context should do the bridge between the controllers
 * and the services exposing only the necessary api to the controllers while encapsulating <strong>all</strong> business logic.
 *
 * All Manager Classes should be singletons.
 *
 * This complete separation of concerns is very beneficial for 2 reasons:
 * <ul>
 *     <li>Allows for testing since there's no browser dependent code (i think) since the DSUStorage can be 'mocked'</li>
 *     <li>Allows for different controllers access different business logic when necessary (while benefiting from the singleton behaviour)</li>
 * </ul>
 *
 * @param {Database} storage the DSU where the storage should happen or more commonly the Database Object
 * @param {BaseManager} baseManager the base manager to have access to the identity api
 * @param {function(err, Manager)} [callback] optional callback for when the assurance that the table has already been indexed is required.

 * @module managers
 * @class StockManager
 */
class StockManager extends Manager{
    constructor(baseManager, callback) {
        super(baseManager, DB.stock, ['name', 'gtin', 'manufName'], callback);
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
        self.insertRecord(gtin, stock, (err) => {
            if (err)
                return self._err(`Could not insert record with gtin ${gtin} on table ${self.tableName}`, err, callback);
            const path =`${self.tableName}/${gtin}`;
            console.log(`Stock ${gtin} created stored at '${path}'`);
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
                return self._err(`Could not update product with gtin ${gtin}`, err, callback);
            console.log(`Product ${gtin} updated`);
            callback(undefined, newStock)
        });
    }

    /**
     * reads ssi for that gtin in the db. loads is and reads the info at '/info'
     * @param {string} gtin
     * @param {boolean} [readDSU] defaults to true. decides if the manager loads and reads from the dsu or not
     * @param {function(err, Product|KeySSI, Archive)} callback returns the Product if readDSU and the dsu, the keySSI otherwise
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
            callback(undefined, stock);
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
                return callback(undefined, records.map(r => r.gtin));
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

let stockManager;
/**
 * @param {ParticipantManager} [participantManager] only required the first time, if not forced
 * @param {boolean} [force] defaults to false. overrides the singleton behaviour and forces a new instance.
 * Makes Participant Manager required again!
 * @param {function(err, Manager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @returns {StockManager}
 */
const getStockManager = function (participantManager, force, callback) {
    if (typeof force === 'function'){
        callback = force;
        force = false;
    }
    if (!stockManager || force)
        stockManager = new StockManager(participantManager, callback);
    return stockManager;
}

module.exports = getStockManager;