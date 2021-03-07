import {getBatchManager} from "./BatchManager.js";

const PRODUCT_MOUNT_PATH = "/products";
const BATCH_MOUNT_PATH = "/batches";
const Product = require('wizard').Model.Product;

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
 * @param {DSUStorage} dsuStorage the controllers dsu storage
 */
class ProductManager {
    constructor(dsuStorage) {
        this.DSUStorage = dsuStorage;
        this.productService = new (require('wizard').Services.ProductService)("traceability");
        this.batchManager = getBatchManager(this.DSUStorage);
    }

    /**
     * Returns the mount path for a given gtin
     * @private
     */
    _getMountPath(gtin){
        return `${PRODUCT_MOUNT_PATH}/${gtin}`;
    }

    /**
     * Ensures the DSU Storage is properly Initialized and the necessary structure of the SSApp (Product wise) is set
     * @param {function(err)}callback
     * @private
     */
    _initialize(callback){
        let self = this;
        self._enableDirectAccess((err) => {
            if (err)
                return callback(err);
            callback();
        });
    }

    /**
     * @see DSUStorage#enableDirectAccess
     * @private
     */
    _enableDirectAccess(callback){
        if(!this.DSUStorage.directAccessEnabled)
            return this.DSUStorage.enableDirectAccess(callback);
        callback();
    }

    /**
     * Creates a {@link Product} dsu
     * @param {Product} product
     * @param {function(err, keySSI, string)} callback where the string is the mount path relative to the main DSU
     */
    create(product, callback) {
        let self = this;
        self._initialize(() => {
            self.productService.create(product, (err, keySSI) => {
                if (err)
                    return callback(err);
                let mount_path = this._getMountPath(product.gtin);
                self.DSUStorage.mount(mount_path, keySSI.getIdentifier(), (err) => {
                    if (err)
                        return callback(err);
                    console.log(`Product ${product.gtin} created and mounted at '${mount_path}'`);
                    callback(undefined, keySSI, mount_path);
                });
            });
        });
    }

    /**
     * reads the product information (the /info path) from a given gtin (if exists and is registered to the mah)
     * @param {string} gtin
     * @param {function(err, Product)} callback
     */
    getOne(gtin, callback){
        this.DSUStorage.getObject(`${this._getMountPath(gtin)}/info`, (err, product) => {
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
    removeProduct(gtin, callback) {
        let self = this;
        self._initialize(() => {
            let mount_path = this._getMountPath(gtin);
            self.DSUStorage.unmount(mount_path, (err) => {
                if (err)
                    return callback(err);
                console.log(`Product ${gtin} removed from mount point ${mount_path}`);
                callback();
            });
        });
    }

    /**
     * Edits/Overwrites the product details
     * @param {string} gtin
     * @param {function(err)} callback
     */
    editProduct(gtin, callback) {
        let self = this;
        self._initialize(() => {
            let mount_path = this._getMountPath(gtin);
            self.DSUStorage.writeFile(`${mount_path}/info`, (err) => {
                if (err)
                    return callback(err);
                console.log(`Product ${gtin} updated`);
                callback();
            });
        });
    }

    addBatch(gtin, batch, callback){
        let self = this;
        let keySSI = self.batchManager.create(gtin, batch, (err, dsu) => {
            if (err)
                return callback(err);
            self.DSUStorage.mount(`${PRODUCT_MOUNT_PATH}/${gtin}${BATCH_MOUNT_PATH}/${batch.batchNumber}`, keySSI, (err, mount) => {
                if (err)
                    return callback(err);
                console.log(`Batch ${batch.batchNumber} mounted at '${mount}'`);
                callback(undefined, keySSI, mount);
            });
        });
        // let keySSI = this.productService.generateKey(gtin);
        // require('resolver').loadDSUForExistingSSI(keySSI, (err, dsu) => {
        //     if (err)
        //         return callback(err);
        // }
        // self._listProductMounts((err, mounts) => {
        //     if (err)
        //         return callback(err);
        //     let filtered = mounts.filter(m => m.gtin === gtin);
        //     if (!filtered || filtered.length !== 1)
        //         return callback("Error fetching product");
        //     let productSSI = filtered[0].identifier;
        //     self.batchManager.create(productSSI, batch ,(err, keySSI, mount) => {
        //         if (err)
        //             return callback(err);
        //         console.log(`Batch number ${batch.batchNumber} created and mounted onto product ${gtin} at ${mount}`);
        //         callback(undefined, keySSI, mount);
        //     });
        // });
    }

    /**
     * Lists all registered products
     * @param {function(err, Product[])} callback
     */
    listProducts(callback) {
        let self = this;
        self._listProductMounts((err,mounts) => {
            if (err)
                return callback(err);
            self._readAll(mounts, callback);
        });
    }

    _listProductMounts(callback){
        let self = this;
        self._initialize(() => {
            self.DSUStorage.listMountedDossiers(PRODUCT_MOUNT_PATH, (err, mounts) => {
                if (err)
                    return callback(err);
                console.log(`Found ${mounts.length} products at ${PRODUCT_MOUNT_PATH}`);
                mounts = mounts.map(m => {
                    return {
                        gtin: m.path,
                        path: `${PRODUCT_MOUNT_PATH}/${m.path}`,
                        identifier: m.identifier
                    };
                })
                callback(undefined, mounts);
            });
        });
    }

    /**
     * Resolve mounts and read DSUs
     * @param {object[]} mounts where each object is:
     * <pre>
     *     {
     *         path: mountPath,
     *         identifier: keySSI
     *     }
     * </pre>
     * @param {function(err, Product[])} callback
     * @private
     */
    _readAll(mounts, callback){
        let self = this;
        let products = [];
        let iterator = function(m){
            let mount = m.shift();
            if (!mount)
                return callback(undefined, Object.keys(products).map(key => products[key]));
            self.DSUStorage.getObject(`${mount.path}/info`, (err, product) => {
                if (err)
                    return callback(err);
                products.push(product);
                iterator(m);
            });
        }
        iterator(mounts.slice());
    }

    /**
     *
     * @param model
     * @returns {Product}
     */
    modelToProduct(model){
        return new Product({
            gtin: model.gtin.value,
            name: model.name.value,
            description: model.description.value,
            manufName: model.manufName.value
        });
    }

    productToModel(product, model){
        model = model || {};
        for (let prop in product)
            if (product.hasOwnProperty(prop)){
                if (!model[prop])
                    model[prop] = {};
                model[prop].value = product[prop];
            }

        return model;
    }
}

let productManager;
/**
 * @param {DSUStorage} dsuStorage
 * @returns {ProductManager}
 */
const getProductManager = function (dsuStorage) {
    if (!productManager) {
        if (!dsuStorage)
            throw new Error("No DSUStorage provided");
        productManager = new ProductManager(dsuStorage);
    }
    return productManager;
}

export {
    getProductManager,
    PRODUCT_MOUNT_PATH
}