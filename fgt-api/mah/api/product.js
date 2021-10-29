
const {Api, OPERATIONS} = require('../../Api');
const {functionCallIterator} = require('../../utils');
const Product = require('../../../fgt-dsu-wizard/model/Product');

class ProductApi extends Api {
    productManager;

    constructor(server, participantManager) {
        super(server, 'product', participantManager, [OPERATIONS.CREATE, OPERATIONS.GET]);
        try {
            this.productManager = participantManager.getManager("ProductManager");
        } catch (e) {
            throw new Error(`Could not get ${this.endpoint}Manager: ${e}`);
        }

    }

    /**
     *
     * @param {string} [gtin]
     * @param {Product} product
     * @param {function(err?, Product?, KeySSI?)} callback
     * @override
     */
    create(gtin, product, callback){
        if (!callback){
            callback = product;
            product = gtin;
            gtin = product.gtin;
        }

        const self = this;

        self.productManager.create(product, (err, keySSI) => {
            if (err)
                return callback(err);
            self.getOne(product.gtin, true, (err, savedProduct) => {
                if (err)
                    return callback(err);
                callback(undefined, savedProduct, keySSI.getIdentifier());
            });
        });
    }

    /**
     * Creates a new Model Object
     * @param {string[]} [keys] can be optional if can be generated from model object
     * @param {[{}]} models a list of model objects
     * @param {function(err?, [{}]?, KeySSI[]?)} callback
     */
    createAll(keys, models, callback){
        const self = this;
        try{
            self.productManager.beginBatch();
        } catch (e) {
            return self.productManager.batchSchedule(() => self.createAll.call(self, keys, models, callback));
        }

        functionCallIterator(this.create.bind(this), keys, models, (err, ...results) => {
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
}