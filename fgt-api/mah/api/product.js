
const {Api, OPERATIONS} = require('../../Api');
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
}