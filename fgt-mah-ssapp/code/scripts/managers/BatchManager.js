/**
 * Batch Manager Class
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
class BatchManager {
    constructor(dsuStorage) {
        this.DSUStorage = dsuStorage;
        this.batchService = new (require('wizard').Services.BatchService)('traceability');
    }


    /**
     * Ensures the DSU Storage is properly Initialized and the necessary structure of the SSApp (Product wise) is set
     * @param {function(err)}callback
     * @private
     */
    _initialize(callback){
        this._enableDirectAccess((err) => {
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
     * Creates a {@link Batch} dsu
     * @param gtin
     * @param {Batch} batch
     * @param {function(err, keySSI, string)} callback where the string is the mount path relative to the main DSU
     */
    create(gtin, batch, callback) {
        this.batchService.create(gtin, batch, (err, keySSI) => {
            if (err)
                return callback(err);
            console.log(`Batch ${batch.batchNumber} created for product '${gtin}'`);
            callback(undefined, keySSI);
        });
    }

    /**
     * reads the specific Batch information from a given gtin (if exists and is registered to the mah)
     *
     * @param {string} gtin
     * @param {string} batchNumber
     * @param {function(err, Batch)} callback
     */
    getOne(gtin, batchNumber, callback){
        this.DSUStorage.getObject(`${PRODUCT_MOUNT_PATH}/gtin${this._getMountPath(batchNumber)}/${batchNumber}`, (err, batch) => {
            if (err)
                return callback(err);
            callback(undefined, batch);
        });
    }

    /**
     * Removes a product from the list (does not delete/invalidate DSU, simply 'forgets' the reference)
     * @param {string} gtin
     * @param {function(err)} callback
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
     * @param {function(err)} callback
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
     * @param {function(err, Product[])} callback
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
     * @param {function(err, Product[])} callback
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

let batchManager;
const getBatchManager = function (dsuStorage) {
    if (!batchManager)
        batchManager = new BatchManager(dsuStorage);
    return batchManager;
}

export {
    getBatchManager
}