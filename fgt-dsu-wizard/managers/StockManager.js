const {INFO_PATH, DB} = require('../constants');
const Manager = require("../../pdm-dsu-toolkit/managers/Manager");
const Stock = require('../model/Stock');
const Batch = require('../model/Batch');

const STATUS = {
    IN_STOCK: "instock",
    RESERVED: "reserved",
    IN_TRANSIT: "intransit"
}

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
 * @module managers
 * @class Manager
 */
class StockManager extends Manager{
    constructor(baseManager) {
        super(baseManager, DB.stock);
        this.stock = this._genDummyStock();
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
                return self._err(`Could not inset record with gtin ${gtin} on table ${self.tableName}`, err, callback);
            const path =`${self.tableName}/${gtin}`;
            console.log(`Product ${gtin} created stored at '${path}'`);
            callback(undefined, stock, path);
        });
    }

    /**
     * reads ssi for that gtin in the db. loads is and reads the info at '/info'
     * @param {string} gtin
     * @param {boolean} [readDSU] defaults to true. decides if the manager loads and reads from the dsu or not
     * @param {function(err, Stock|KeySSI, Archive)} callback returns the Product if readDSU and the dsu, the keySSI otherwise
     */
    getOne(gtin, readDSU,  callback) {
        //super.getOne(gtin, false, callback);
        return new Stock({
            gtin: gtin,
            name: "cenas",
            batches: this._getBatches()
        });
    }

    /**
     * Removes a product from the list (does not delete/invalidate DSU, simply 'forgets' the reference)
     * @param {string|number} gtin
     * @param {function(err)} callback
     */
    remove(gtin, callback) {
        super.remove(gtin, callback);
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
        let self = this;
        self.query(options.query, options.sort, options.limit, (err, records) => {
            if (err)
                return self._err(`Could not perform query`, err, callback);
            if (!readDSU)
                return callback(undefined, records);
            super._iterator(records.slice(), super._getDSUInfo, (err, result) => {
                if (err)
                    return self._err(`Could not parse batches ${JSON.stringify(records)}`, err, callback);
                console.log(`Parsed ${result.length} batches`);
                callback(undefined, result);
            });
        });
    }

    _getFromStatus(){
        let stock = {};
        Object.values(STATUS).forEach(s => stock[s] = {});
        return stock;
    }

    _getGtins(){
        return [178567958612, 178567959872, 1785667958612, 178547698612];
    }

    _getBatches(){
        let batches = ["TS134", "FD214", "UY2345"];
        let bat = [];
        batches.forEach(batch =>{
            let b = new Batch({
                batchNumber: batch,
                expiry: 'cenas',
                serialNumbers: [123546789, 987654321, 987123564]
            });
            b.quantity = 300;
            bat.push(b);
        });
        return bat;
    }

    _genDummyStock(){
        let gtins = this._getGtins();
        let batches = ["TS134", "FD214", "UY2345"];

        let stock = {};
        gtins.forEach((gtin, i) => {
            let bat = [];
            batches.forEach(batch =>{
                let b = new Batch({
                    batchNumber: batch,
                    expiry: 'cenas',
                    serialNumbers: [123546789, 987654321, 987123564]
                });
                b.quantity = 300;
                bat.push(b);
            })
            stock[gtin] = {
                name: "Product" + i,
                batches: bat
            };
        });
        let tempStock = this._getFromStatus();
        tempStock[STATUS.IN_STOCK] = stock;
        return tempStock;
    }
    //
    // getAll(callback){
    //     if (this.stock)
    //         return callback(undefined, this.stock);
    //     // this.storage.getObject(STOCK_PATH, (err, stock) => {
    //     //    if (err)
    //     //        return callback(err);
    //     //    this.stock = stock;
    //     //    console.log("Retrieved stock");
    //     //    callback(undefined, this.toModel(stock));
    //     // });
    // }

    /**
     * @param {STATUS} [status] defaults to {@link STATUS.IN_STOCK}
     * @param callback
     */
    getByStatus(status, callback){
        if (typeof status === 'function'){
            callback = status;
            status = STATUS.IN_STOCK;
        }

        if (!status in this.stock)
            return callback("Status not found in stock");
        callback(undefined, this.stock[status]);
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
 * @param {DB} database
 * @param {BaseManager} baseManager
 * @returns {StockManager}
 */
const getStockManager = function (baseManager) {
    if (!stockManager)
        stockManager = new StockManager(baseManager);
    return stockManager;
}

module.exports = getStockManager;