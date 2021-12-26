
const {Api, OPERATIONS} = require('../Api');
const Sale = require("../../fgt-dsu-wizard/model/Sale");
const {BadRequest, NotImplemented} = require("../utils/errorHandler");

const SALE_GET = Object.assign({}, OPERATIONS.GET, {pathParams: ['saleId']});

module.exports = class SaleApi extends Api {
    manager;

    constructor(server, participantManager) {
        super(server, 'sale', participantManager, [OPERATIONS.CREATE, SALE_GET], Sale);
        try {
            this.manager = participantManager.getManager("SaleManager");
        } catch (e) {
            throw new Error(`Could not get ${this.endpoint}Manager: ${e}`);
        }
    }

    /**
     * @param {Sale} sale
     * @param {function(err?, Sale?)} callback
     */
    create(sale, callback){
        const self = this;

        const [err, _sale] = self._validate(sale);
        if (err)
            return callback(new BadRequest(err));

        self.manager.create(_sale, (err, insertedSale) => {
            if (err)
                return callback(new NotImplemented(err));
            callback(undefined, insertedSale);
        });
    }

    /**
     * @param {string[]} [keys] can be optional if can be generated from model object
     * @param {[{}]} body a list of model objects
     * @param {function(err?, [{}]?, KeySSI[]?)} callback
     */
    createAll(keys, body, callback) {
        super.createAll(keys, body, callback);
    }

    /**
     * @param saleId
     * @param callback
     */
    getOne(saleId, callback) {
        this.manager.getOne(saleId, true, callback)
    }

    /**
     * @param queryParams
     * @param callback
     */
    getAll(queryParams, callback) {
        super.getAll(queryParams, callback);
    }
}