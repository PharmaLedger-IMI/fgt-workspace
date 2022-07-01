
const {Api, OPERATIONS} = require('../Api');
const Stock = require("../../fgt-dsu-wizard/model/Stock");
const {BadRequest} = require("../utils/errorHandler");

const STOCK_GET = Object.assign({}, OPERATIONS.GET, {pathParams: ['gtin']});
const STOCK_GET_2 = Object.assign({}, OPERATIONS.GET, {pathParams: ['gtin', ["batch"]]});

module.exports = class StockTraceabilityApi extends Api {
    manager;

    constructor(server, participantManager) {
        super(server, 'stockTraceability', participantManager, [STOCK_GET, STOCK_GET_2], Stock);
        try {
            this.manager = participantManager.getManager("StockManager");
        } catch (e) {
            throw new Error(`Could not get ${this.endpoint}Manager: ${e}`);
        }
    }

    /**
     * @param gtin
     * @param callback
     */
    getOne(gtin, batch, callback) {
        if (!callback) {
            callback = batch;
            batch = undefined;
        }
        const query = batch ? {batch} : {}; // batch, partnersId (array)
        this.manager.getStockTraceability(gtin, query, (err, stock) => {
            if (err)
                return callback(new BadRequest(err));
            callback(undefined, stock);
        });
    }

    /**
     * @param {{}}queryParams
     * @param callback
     */
    getAll(queryParams, callback) {
        super.getAll(queryParams, callback);
    }
}