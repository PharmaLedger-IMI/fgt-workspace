
const {Api, OPERATIONS} = require('../Api');
const Sale = require("../../fgt-dsu-wizard/model/Sale");
const {BadRequest, NotFound, InternalServerError} = require("../utils/errorHandler");

const SALE_GET = Object.assign({}, OPERATIONS.GET, {pathParams: ['saleId']});

module.exports = class SaleApi extends Api {
    manager;

    constructor(server, participantManager) {
        super(server, 'sale', participantManager, [OPERATIONS.CREATE, SALE_GET], Sale);
        try {
            this.manager = participantManager.getManager("SaleManager");
            this.stockManager = participantManager.getManager("StockManager");
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

        if (!sale.productList || !Array.isArray(sale.productList))
            return callback(new BadRequest(`productList is null or a not valid.`));

        const gtinsUnique = Array.from(new Set(sale.productList.map(p => p.gtin)));
        self.stockManager.getAll({query: [`gtin like /${gtinsUnique.map(gtin => gtin).join('|')}/g`]}, (err, stock) => {
            if (err || gtinsUnique.length !== stock.length)
                return callback(new NotFound(`GTIN not found in stock.`));

            const fillManufNameIterator = (_stock, callback) => {
                const stockProduct = _stock.shift();
                if (!stockProduct)
                    return callback();

                sale.productList.filter((p) => p.gtin === stockProduct.gtin).map((p) => {
                    p.manufName = stockProduct.manufName;
                    return p;
                });
                fillManufNameIterator(_stock, callback);
            }

            fillManufNameIterator(stock.slice(), () => {
                const [err, _sale] = self._validate({
                    ...sale,
                    sellerId: this.manager.getIdentity().id
                });
                if (err)
                    return callback(new BadRequest(err));

                self.manager.create(_sale, (err, insertedSale, path, keySSIs) => {
                    if (err) {
                        if (err instanceof Error)
                            return callback(new InternalServerError(err.message));
                        return callback(new BadRequest(err));
                    }
                    callback(undefined, {...insertedSale, keySSIs: keySSIs});
                });
            })
        })
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
        this.manager.getOne(saleId, true, (err, sale) => {
            if (err)
                return callback(new BadRequest(err));
            callback(undefined, sale);
        })
    }

    /**
     * @param queryParams
     * @param callback
     */
    getAll(queryParams, callback) {
        super.getAll(queryParams, callback);
    }
}