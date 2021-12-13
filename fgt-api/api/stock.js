
const {Api, OPERATIONS} = require('../Api');
const Stock = require("../../fgt-dsu-wizard/model/Stock");

const STOCK_GET = Object.assign({}, OPERATIONS.GET, {pathParams: ['gtin']});

module.exports = class StockApi extends Api {
    stockManager;

    constructor(server, participantManager) {
        super(server, 'stock', participantManager, [STOCK_GET], Stock);
        try {
            this.stockManager = participantManager.getManager("StockManager");
        } catch (e) {
            throw new Error(`Could not get ${this.endpoint}Manager: ${e}`);
        }
    }

    /**
     * @param gtin
     * @param callback
     */
    getOne(gtin, callback) {
        this.stockManager.getOne(gtin, true, (err, stock) => {
            if (err)
                return callback(err);
            callback(undefined, stock);
        })
    }

    /**
     * @param query
     * @param callback
     */
    getAll(query, callback) {
        this.stockManager.getAll(true, (err, stockList) => {
            if (err)
                return callback(err);
            callback(undefined, stockList);
        })
    }
}