
const {Api, OPERATIONS} = require('../Api');
const Product = require('../../fgt-dsu-wizard/model/Product');

const PRODUCT_GET = Object.assign({}, OPERATIONS.GET, {pathParams: ['gtin']});

class ProductApi extends Api {
    manager;

    constructor(server, participantManager) {
        super(server, 'product', participantManager, [OPERATIONS.CREATE, PRODUCT_GET], Product);
        try {
            this.manager = participantManager.getManager("ProductManager");
        } catch (e) {
            throw new Error(`Could not get ${this.endpoint}Manager: ${e}`);
        }

    }

    /**
     * @param {Product} product
     * @param {function(err?, Product?, KeySSI?)} callback
     * @override
     */
    create(product, callback){
        const self = this;

        const [err, _product] = self._validate(product);
        if (err)
            return callback(err);

        self.manager.create(_product, (err, keySSI) => {
            if (err)
                return callback(err);
            self.manager.getOne(_product.gtin, true, (err, insertedProduct) => {
                if (err)
                    return callback(err);
                callback(undefined, {...insertedProduct, keySSI: keySSI.derive().getIdentifier()});
            });
        });
    }

    /**
     * @param {[Products]} products
     * @param {function(err?, [{}]?, KeySSI[]?)} callback
     */
    createAll(keys, models, callback) {
        return super.createAll(keys, models, callback);
    }

    /**
     * @param gtin
     * @param {function(err?, Product?)} callback
     */
    getOne(gtin, callback) {
        this.manager.getOne(gtin, true, (err, product) => {
            if (err)
                return callback(err);
            callback(undefined, product);
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

module.exports = ProductApi;