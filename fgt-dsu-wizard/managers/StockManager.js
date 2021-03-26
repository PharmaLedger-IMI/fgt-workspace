const Manager = require("../../pdm-dsu-toolkit/managers/Manager");
const Product = require('../model').Product;
const Batch = require('../model').Batch;
const STOCK_PATH = require('../constants').STOCK_PATH;

const STATUS = {
    IN_STOCK: "instock",
    RESERVED: "reserved",
    IN_TRANSIT: "intransit"
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
 * @param {Archive} storageDSU the DSU where the storage should happen
 */
class StockManager extends Manager{
    constructor(storageDSU) {
        super(storageDSU);
        this.stock = this._genDummyStock();
    }

    _getFromStatus(){
        let stock = {};
        Object.values(STATUS).forEach(s => stock[s] = {});
        return stock;
    }

    _genDummyStock(){
        let gtins = [1, 435, 1241, 435346]
        let batches = ["TS134", "FD214", "UY2345"];

        let stock = {};
        gtins.forEach((gtin, i) => {
            let bat = {}
            batches.forEach(batch => {
                bat[batch] = {
                    expiry: "cenas",
                    quantity: 300
                }
            });
            stock[gtin] = {
                name: "Product" + i,
                stock: bat
            };
        });
        let tempStock = this._getFromStatus();
        tempStock[STATUS.IN_STOCK] = stock;
        return tempStock;
    }

    get(callback){
        if (this.stock)
            return callback(undefined, this.stock);
        this.storage.getObject(STOCK_PATH, (err, stock) => {
           if (err)
               return callback(err);
           this.stock = stock;
           console.log("Retrieved stock");
           callback(undefined, this.toModel(stock));
        });
    }

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

    update(callback){
        this.storage.writeFile(STOCK_PATH, JSON.stringify(this.stock), (err) => {
            if (err)
                return callback(err);
            console.log("Updated stock!");
            callback();
        });
    }

    toModel(filteredStock, model){
        return Object.entries(filteredStock).map(([key, value]) => {
            return {
                gtin: key,
                name: value.name,
                batches: Object.keys(value.stock).join(', '),
                quantity:Object.values(value.stock).reduce((total, val) => total + val.quantity, 0)
            }
        });
    }
}

let stockManager;
/**
 * @param {Archive} dsu
 * @returns {StockManager}
 */
const getStockManager = function (dsu) {
    if (!stockManager)
        stockManager = new StockManager(dsu);
    return stockManager;
}

module.exports = getStockManager;