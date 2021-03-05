const PRODUCT_MOUNT_PATH = "/products";

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
     * Initializes the mount points required for Products
     * @param {function(err, string[])} callback
     * @private
     */
    _createMountFolders(callback){
        let mount_folders = [PRODUCT_MOUNT_PATH].map(p => p[0] === '/' ? p.substr(1) : p);
        let folders = [];
        let self = this;
        let iterator = function(folderList){
            let folder = folderList.shift();
            if (!folder)
                return callback(undefined, folders);
            self.DSUStorage.readDir(folder, (err, files) => {
                if (!err)
                    return iterator(folderList);
                self.DSUStorage.createFolder(folder, (err) => {
                    if (err)
                        return callback(err);
                    folders.push(folder);
                    iterator(folderList);
                });
            });
        }
        iterator(mount_folders.slice());
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
     * @param {function(err, keySSI, string)} callback where the string is the mount path
     */
    createProduct(product, callback) {
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
     * reads the product information from a given gtin (if exists and is registered to the mah)
     * @param {string} gtin
     * @param {function(err, Product)} callback
     */
    getProduct(gtin, callback){
        this.DSUStorage.getObject(`${this._getMountPath(product.gtin)}/info`, (err, product) => {
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

    /**
     * Lists all registered products
     * @param {function(err, Product[])} callback
     */
    listProducts(callback) {
        let self = this;
        self._initialize(() => {
            self.DSUStorage.listMountedDossiers(PRODUCT_MOUNT_PATH, (err, mounts) => {
                if (err)
                    return callback(err);
                console.log(`Found ${mounts.length} products at ${PRODUCT_MOUNT_PATH}`);
                mounts = mounts.map(m => {
                    return {
                        path: `${PRODUCT_MOUNT_PATH}/${m.path}`,
                        identifier: m.identifier
                    };
                })
                self._readAll(mounts, callback);
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
     * @param {function(err, Product[])} callbackasfda
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
    getProductManager
}