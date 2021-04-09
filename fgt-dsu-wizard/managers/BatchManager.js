const {INFO_PATH, ANCHORING_DOMAIN, DB} = require('../constants');
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
 * @param {ParticipantManager} participantManager
 */
class BatchManager extends Manager{
    constructor(participantManager) {
        super(participantManager, DB.batches);
        this.productService = new (require('wizard').Services.ProductService)(ANCHORING_DOMAIN);
        this.batchService = new (require('wizard').Services.BatchService)(ANCHORING_DOMAIN);
        this._getBatch = super._getDSUInfo;
    }

    /**
     * generates the db's key for the batch
     * @param {string|number} gtin
     * @param {string|number} batchNumber
     * @return {string}
     * @private
     */
    _genCompostKey(gtin, batchNumber){
        return `${gtin}-${batchNumber}`;
    }

    /**
     * Reads the Batch (parsed from the json at the {@link INFO_PATH}) from DSU from the provided KeySSI
     * @param {string|KeySSI} keySSI
     * @param {function(err, Batch)} callback
     * @see Manager#_getDSUInfo
     * @private
     */
    _getBatch(keySSI, callback);

    /**
     * Creates a {@link Batch} dsu
     * @param {string|number} gtin
     * @param {Batch} batch
     * @param {function(err, keySSI, string)} callback first keySSI if for the batch, the second for its' product dsu
     */
    create(gtin, batch, callback) {
        let self = this;
        self.batchService.create(gtin, batch, (err, keySSI) => {
            if (err)
                return callback(err);
            const record = keySSI.getIdentifier();
            const dbKey = self._genCompostKey(gtin, batch.batchNumber);
            self.insertRecord(dbKey, record, (err) => {
                if (err)
                    return self._err(`Could not inset record with gtin ${gtin} and batch ${batch.batchNumber} on table ${self.tableName}`, err, callback);
                const path =`${self.tableName}/${dbKey}`;
                console.log(`batch ${batch.batchNumber} created stored at '${path}'`);
                callback(undefined, keySSI, path);
            });
        });
    }

    /**
     * reads the specific Batch information from a given gtin (if exists and is registered to the mah)
     *
     * @param {string|number} gtin
     * @param {string|number} batchNumber
     * @param {boolean} [readDSU] defaults to true. decides if the manager loads and reads from the dsu or not
     * @param {function(err, Batch|KeySSI)} callback returns the batch if readDSU, the keySSI otherwise
     */
    getOne(gtin, batchNumber, readDSU, callback){
        if (!callback){
            callback = readDSU;
            readDSU = true;
        }
        let self = this;
        self.getRecord(self._genCompostKey(gtin, batchNumber), (err, batchSSI) => {
            if (err)
                return self._err(`Could not load record with gtin ${gtin} and batchNumber ${batchNumber} on table ${self.tableName}`, err, callback);
            if (!readDSU)
                return callback(undefined, batchSSI);
            self._getBatch(batchSSI, callback);
        });
    }

    /**
     * Removes a product from the list (does not delete/invalidate DSU, simply 'forgets' the reference)
     * @param {string|number} gtin
     * @param {string|number} batchNumber
     * @param {function(err)} callback
     */
    remove(gtin, batchNumber, callback) {
        let self = this;
        self.deleteRecord(self._genCompostKey(gtin, batchNumber), callback);
    }

    /**
     *
     * @param model
     * @returns {Batch}
     */
    fromModel(model){
        return new Batch(super.fromModel(model));
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

    getAll(gtin, readDSU, callback){
        if (!callback){
            callback = readDSU;
            readDSU = true;
        }
        let self = this;
        self.query(() => true, undefined, 100, (err, records) => {
            if (err)
                return self._err(`Could not perform query`, err, callback);
            if (!readDSU)
                return callback(undefined, records);
            super._iterator(records.slice(), self._getBatch, (err, result) => {
                if (err)
                    return self._err(`Could not parse batches ${JSON.stringify(records)}`, err, callback);
                console.log(`Parsed ${result.length} batches`);
                callback(undefined, result);
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
