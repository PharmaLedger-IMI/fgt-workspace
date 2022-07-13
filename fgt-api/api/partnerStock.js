
const {Api, OPERATIONS} = require('../Api');
const Stock = require("../../fgt-dsu-wizard/model/Stock");
const {BadRequest} = require("../utils/errorHandler");

const GET_BY_GTIN = Object.assign({}, OPERATIONS.GET, {pathParams: ['gtin']});
const GET_BY_BATCH = Object.assign({}, OPERATIONS.GET, {pathParams: ['gtin', 'batch']});

module.exports = class PartnerStockApi extends Api {
    manager;

    constructor(server, participantManager) {
        super(server, 'partnerStock', participantManager, [GET_BY_GTIN, GET_BY_BATCH], Stock);
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
        const query = batch ? {batch} : {};
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