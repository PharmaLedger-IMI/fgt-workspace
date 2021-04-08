const {INFO_PATH, ANCHORING_DOMAIN, DB} = require('../constants');
const Manager = require("../../pdm-dsu-toolkit/managers/Manager");
const Product = require('../model').Product;


/**
 * Product Manager Class
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
class ProductManager extends Manager{
    constructor(baseManager) {
        super(baseManager, DB.products);
        this.productService = new (require('../services').ProductService)(ANCHORING_DOMAIN);
        this.batchManager = require('./BatchManager')(baseManager);
    }

    /**
     * Creates a {@link Product} dsu
     * @param {Product} product
     * @param {function(err, keySSI, string)} callback where the string is the mount path relative to the main DSU
     */
    create(product, callback) {
        let self = this;
        self.productService.create(product, (err, keySSI) => {
            if (err)
                return callback(err);
            const record = keySSI.getIdentifier();
            self.storage.insertRecord(product.gtin, record, (err) => {
                if (err)
                    return callback(err);
                const path =`${this.tableName}/${record}`;
                console.log(`Product ${product.gtin} created stored at '${path}'`);
                callback(undefined, keySSI, path);
            });
        });
    }

    /**
     * reads ssi for that gtin in the db. loads is and reads the info at '/info'
     * @param {string} gtin
     * @param {function(err, Product)} callback
     */
    getOne(gtin, callback) {
        let self = this;
        self.getRecord(gtin, (err, productSSI) => {
            if (err)
                return callback(err);
            const keySSI = self._getKeySSISpace().parse(productSSI);
            self._loadDSU(keySSI, (err, dsu) => {
                if (err)
                    return callback(err);
                dsu.readFile(INFO_PATH, (err, data) => err
                    ? callback(err)
                    : callback(undefined, new Product(JSON.parse(data))));
            });
        });
    }

    /**
     * Removes a product from the list (does not delete/invalidate DSU, simply 'forgets' the reference)
     * @param {string} gtin
     * @param {function(err)} callback
     */
    remove(gtin, callback) {
        let self = this;
        self.deleteRecord(gtin, callback);
    }

    /**
     * Lists all registered products
     * @param {function(err, Product[])} callback
     */
    getAll(callback) {
        let self = this;
        self.query(() => true, undefined, 100, callback);
    }

    /**
     *
     * @param model
     * @returns {Product}
     */
    fromModel(model){
        return new Product(super.fromModel(model));
    }
}

let productManager;
/**
 * @param {Archive} dsu
 * @returns {ProductManager}
 */
const getProductManager = function (dsu) {
    if (!productManager)
        productManager = new ProductManager(dsu);
    return productManager;
}

module.exports = getProductManager;