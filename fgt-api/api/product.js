
const {Api, OPERATIONS} = require('../Api');
const Product = require('../../fgt-dsu-wizard/model/Product');

const PRODUCT_GET = Object.assign({}, OPERATIONS.GET, {pathParams: ['gtin']});

class ProductApi extends Api {
    productManager;

    constructor(server, participantManager) {
        super(server, 'product', participantManager, [OPERATIONS.CREATE, PRODUCT_GET], Product);
        try {
            this.productManager = participantManager.getManager("ProductManager");
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

        self.productManager.create(_product, (err, keySSI) => {
            if (err)
                return callback(err);
            self.productManager.getOne(_product.gtin, true, (err, insertedProduct) => {
                if (err)
                    return callback(err);
                callback(undefined, insertedProduct, keySSI.getIdentifier());
            });
        });
    }

    /**
     * @param {[Products]} products
     * @param {function(err?, [{}]?, KeySSI[]?)} callback
     */
    createAll(products, callback){
        const self = this;
        try{
            self.productManager.beginBatch();
        } catch (e) {
            return self.productManager.batchSchedule(() => self.createAll.call(self, products, callback));
        }

        super.createAll([], products, (err, ...results) => {
            if (err){
                console.log(err);
                return self.productManager.cancelBatch((_) => callback(err));
            }

            self.productManager.commitBatch((err) => {
                if (err){
                    console.log(err);
                    return self.productManager.cancelBatch((_) => callback(err));
                }
                const [created, keySSIs] = results;
                callback(undefined, created, keySSIs);
            });
        });
    }

    /**
     * @param gtin
     * @param {function(err?, Product?)} callback
     */
    getOne(gtin, callback) {
        this.productManager.getOne(gtin, true, (err, product) => {
            if (err)
                return callback(err);
            callback(undefined, product);
        })
    }

    /**
     * @param keys
     * @param {function(err?, [Product]?)} callback
     */
    getAll(keys, callback) {
        this.productManager.getAll(true, (err, products) => {
            if (err)
                return callback(err);
            callback(undefined, products);
        })
    }

}

module.exports = ProductApi;