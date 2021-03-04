const PRODUCT_MOUNT_PATH = "/products";

/**
 * Helper Class to handle batch creation and its mount on the MAH ssapp.
 * Basically a specialized wrapper around {@link DSUStorage}
 * @param {DSUStorage} dsuStorage the controllers dsu storage
 */
class BatchManagerService {
    constructor(dsuStorage) {
        this.DSUStorage = dsuStorage;
        this.batchService = require('wizard').Services.BatchService;
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
     * @param {function<err>}callback
     * @private
     */
    _initialize(callback){
        this._enableDirectAccess((err) => {
            if (err)
                return callback(err);
            this._createMountFolders((err, created) => {
                if (err)
                    return callback(err);
                console.log(`Folders ${created} have been created`);
                callback();
            })
        });
    }

    /**
     * Initializes the mount points required for Products
     * @param {function<err, string[]>} callback
     * @private
     */
    _createMountFolders(callback){
        let mount_folders = [PRODUCT_MOUNT_PATH];
        let folders = [];
        let iterator = function(folderList){
            let folder = folderList.shift();
            if (!folder)
                return callback(undefined, folders);
            this.DSUStorage.readDir(folder, (err, files) => {
                if (!err)
                    return iterator(folderList);
                this.DSUStorage.createFolder(folder, (err) => {
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
     * @param {function<err, keySSI, string>} callback where the string is the mount path
     */
    createProduct(product, callback) {
        this._initialize(() => {
            this.batchService.create(product, (err, keySSI) => {
                if (err)
                    return callback(err);
                let mount_path = this._getMountPath(product.gtin);
                this.DSUStorage.mount(mount_path, keySSI.getIdentifier(), (err) => {
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
     * @param {function<err, Product>} callback
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
     * @param {function<err>} callback
     */
    removeProduct(gtin, callback) {
        this._initialize(() => {
            let mount_path = this._getMountPath(gtin);
            this.DSUStorage.unmount(mount_path, (err) => {
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
     * @param {function<err>} callback
     */
    editProduct(gtin, callback) {
        this._initialize(() => {
            let mount_path = this._getMountPath(gtin);
            this.DSUStorage.writeFile(`${mount_path}/info`, (err) => {
                if (err)
                    return callback(err);
                console.log(`Product ${gtin} updated`);
                callback();
            });
        });
    }

    /**
     * Lists all registered products
     * @param {function<err, Product[]>} callback
     */
    listProducts(callback) {
        this._initialize(() => {
            this.DSUStorage.listMountedDossiers(PRODUCT_MOUNT_PATH, (err, mounts) => {
                if (err)
                    return callback(err);
                console.log(`Found ${mounts.length} products at ${PRODUCT_MOUNT_PATH}`);
                this._readAll(mounts, callback);
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
     * @param {function<err, Product[]>} callback
     * @private
     */
    _readAll(mounts, callback){
        let self = this;
        let products = [];
        let iterator = function(m){
            let mount = m.shift();
            if (!mount)
                return callback(undefined, products);
            self.DSUStorage.getObject(`${mount.path}/info`, (err, product) => {
                if (err)
                    return callback(err);
                product.push(product);
                iterator(m);
            });
        }
        iterator(mounts.slice());
    }
}

let batchManagerService;
const getInstance = function (dsuStorage) {
    if (!batchManagerService)
        batchManagerService = new BatchManagerService(dsuStorage);
    return batchManagerService;
}

export {
    getInstance
}