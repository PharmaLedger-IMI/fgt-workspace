const {INFO_PATH, PRODUCT_MOUNT_PATH, ANCHORING_DOMAIN} = require('../constants');
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
    constructor(storageDSU) {
        super(storageDSU);
        this.productService = new (require('../services').ProductService)(ANCHORING_DOMAIN);
        this.batchManager = require('./BatchManager')(storageDSU);
    }

    /**
     * Returns the mount path for a given gtin
     * @private
     */
    _getMountPath(gtin){
        return `${PRODUCT_MOUNT_PATH}/${gtin}`;
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
            let mount_path = this._getMountPath(product.gtin);
            self.storage.mount(mount_path, keySSI.getIdentifier(), (err) => {
                if (err)
                    return callback(err);
                console.log(`Product ${product.gtin} created and mounted at '${mount_path}'`);
                callback(undefined, keySSI, mount_path);
            });
        });
    }

    /**
     * reads the product information (the /info path) from a given gtin (if exists and is registered to the mah)
     * @param {string} gtin
     * @param {function(err, Product)} callback
     */
    getOne(gtin, callback){
        this.storage.getObject(`${this._getMountPath(gtin)}${INFO_PATH}`, (err, product) => {
            if (err)
                return callback(err);
            callback(undefined, product);
        });
    }

    /**
     * Removes a product from the list (does not delete/invalidate DSU, simply 'forgets' the reference)
     * @param {string} gtin
     * @param {function(err)} callback
     */
    remove(gtin, callback) {
        let self = this;
        let mount_path = this._getMountPath(gtin);
        self.storage.unmount(mount_path, (err) => {
            if (err)
                return callback(err);
            console.log(`Product ${gtin} removed from mount point ${mount_path}`);
            callback();
        });
    }

    /**
     * Edits/Overwrites the product details
     * @param {string} gtin
     * @param {function(err)} callback
     */
    edit(gtin, callback) {
        let self = this;
        let mount_path = this._getMountPath(gtin);
        self.storage.writeFile(`${mount_path}${INFO_PATH}`, (err) => {
            if (err)
                return callback(err);
            console.log(`Product ${gtin} updated`);
            callback();
        });
    }

    /**
     * Lists all registered products
     * @param {function(err, Product[])} callback
     */
    getAll(callback) {
        super.listMounts(PRODUCT_MOUNT_PATH, (err, mounts) => {
            if (err)
                return callback(err);
            console.log(`Found ${mounts.length} products at ${PRODUCT_MOUNT_PATH}`);
            mounts = mounts.map(m => {
                m.gtin = m.path;
                m.path = `${PRODUCT_MOUNT_PATH}/${m.path}`;
                return m;
            });
            super.readAll(mounts, callback);
        });
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