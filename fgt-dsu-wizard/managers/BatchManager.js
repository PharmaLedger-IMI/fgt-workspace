const {INFO_PATH, PRODUCT_MOUNT_PATH, BATCH_MOUNT_PATH, ANCHORING_DOMAIN} = require('../constants');
const Manager = require("../../pdm-dsu-toolkit/managers/Manager");
const Batch = require('../model').Batch;

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
 * @param {Archive} storageDSU the DSU where the storage should happen
 */
class BatchManager extends Manager{
    constructor(storageDSU) {
        super(storageDSU);
        this.productService = new (require('wizard').Services.ProductService)(ANCHORING_DOMAIN);
        this.batchService = new (require('wizard').Services.BatchService)(ANCHORING_DOMAIN);
        this.keyCache = {};
    }

    /**
     * Returns the mount path for a given gtin & batch
     * @private
     */
    _getMountPath(gtin, batchNumber){
        return `${PRODUCT_MOUNT_PATH}/${gtin}${BATCH_MOUNT_PATH}/${batchNumber}`;
    }

    _getProductKey(gtin){
        if (!this.keyCache[gtin])
            this.keyCache[gtin] = this.productService.generateKey(gtin);
        return this.keyCache[gtin];
    }

    _getBatchKey(gtin, batch){
        let key = gtin + '' + batch;
        if (!this.keyCache[key])
            this.keyCache[key] = this.batchService.generateKey(gtin, batch);
        return this.keyCache[key];
    }

    /**
     * Creates a {@link Batch} dsu
     * @param gtin
     * @param {Batch} batch
     * @param {function(err, keySSI, keySSI)} callback first keySSI if for the batch, the second for its' product dsu
     */
    create(gtin, batch, callback) {
        this.batchService.create(gtin, batch, (err, keySSI) => {
            if (err)
                return callback(err);
            console.log(`Batch ${batch.batchNumber} created for product '${gtin}'`);
            let key = this._getProductKey(gtin);
            super.loadDSU(key, (err, dsu) => {
                if (err)
                    return callback(err);
                let path = `${BATCH_MOUNT_PATH}/${batch.batchNumber}`
                dsu.mount(path, keySSI.getIdentifier(), (err) => {
                    if (err)
                        return callback(err);
                    console.log(`Batch ${batch.batchNumber} mounted at '${path}' for product ${gtin}`);
                    callback(undefined, keySSI, key);
                });
            });
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
        this.storage.getObject(this._getMountPath(gtin, batchNumber), (err, batch) => {
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
    remove(gtin, callback) {
        let mount_path = this._getMountPath(gtin);
        this.storage.unmount(mount_path, (err) => {
            if (err)
                return callback(err);
            console.log(`Product ${gtin} removed from mount point ${mount_path}`);
            callback();
        });
    }

    /**
     *
     * @param model
     * @returns {Batch}
     */
    fromModel(model){
        return new Batch({
            batchNumber: model.batchNumber.value,
            expiry: model.expiry.value,
            serialNumbers: JSON.parse(JSON.stringify(model.serialNumbers.value))
        });
    }

    /**
     * Edits/Overwrites the product details
     * @param {string} gtin
     * @param {string} batchNumber
     * @param {function(err)} callback
     */
    edit(gtin, batchNumber,  callback) {
        super.initialize(() => {
            let mount_path = this._getMountPath(gtin, batchNumber);
            this.storage.writeFile(`${mount_path}${INFO_PATH}`, (err) => {
                if (err)
                    return callback(err);
                console.log(`Product ${gtin} updated`);
                callback();
            });
        });
    }

    getAll(gtin, callback){
        let self = this;
        let key = this._getProductKey(gtin);
        this.loadDSU(key, (err, dsu) => {
           if (err)
               return callback(err);
           dsu.listMountedDSUs(BATCH_MOUNT_PATH, (err, mounts) => {
               if (err)
                   return callback(err);
               mounts = mounts.map(m => {
                   m.batchNumber = m.path;
                   m.path = self._getMountPath(gtin, m.path);
                   return m;
               });
               super.readAll(mounts, callback);
           });
        });
    }
}

let batchManager;
/**
 * @param {Archive} dsu
 * @returns {BatchManager}
 */
const getBatchManager = function (dsu) {
    if (!batchManager)
        batchManager = new BatchManager(dsu);
    return batchManager;
}

module.exports = getBatchManager;
