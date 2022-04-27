const {DB, DEFAULT_QUERY_OPTIONS} = require('../../fgt-dsu-wizard/constants');
const {Batch} = require('../../fgt-dsu-wizard/model');
const getStockManager = require('./StockManager');
const getNotificationManager = require('./NotificationManager');
const ApiManager = require("./ApiManager");
const SORT_OPTIONS = {ASC: "asc", DSC: 'dsc'}

const {toPage} = require('../../pdm-dsu-toolkit/managers/Page');


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
 * @param {function(err, Manager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @class BatchManager
 * @extends Manager
 * @memberOf Managers
 */
class BatchManager extends ApiManager{
    constructor(participantManager, callback) {
        super(participantManager, "batch", ['gtin', 'batchNumber', 'expiry'], callback);
        this.stockManager = getStockManager(participantManager);
        this.notificationManager = getNotificationManager(participantManager);
        this.participantManager = participantManager;
    }

    /**
     * Creates a {@link Batch} dsu
     * @param {Product} product
     * @param {Batch} batch
     * @param {function(err, keySSI, string)} callback first keySSI if for the batch, the second for its' product dsu
     * @override
     */
    create(product, batch, callback) {
        if (batch.batchStatus)
            delete batch.batchStatus;
        if (batch.quantity)
            delete batch.quantity;

        super.create(undefined, Object.assign({gtin: product.gtin}, batch), callback);
    }


    mapRecordToKey(gtin, record) {
        return gtin + '-' + record.batchNumber;
    }

    /**
     * reads the specific Batch information from a given gtin (if exists and is registered to the mah)
     *
     * @param {string|number} gtin
     * @param {string|number} batchNumber
     * @param {boolean} [readDSU] defaults to true. decides if the manager loads and reads from the dsu or not
     * @param {function(err, Batch|KeySSI, Archive)} callback returns the batch if readDSU, the keySSI otherwise
     * @override
     */
    getOne(gtin, batchNumber, readDSU, callback){

        if (!callback){
            callback = readDSU;
            readDSU = batchNumber;
            const tmp = gtin.split("-");
            gtin = tmp[0];
            batchNumber = tmp[1]
        }

        super.getOne([gtin, batchNumber], readDSU, callback);
    }

    /**
     * Lists all registered items according to query options provided
     * @param {boolean} [readDSU] defaults to true. decides if the manager loads and reads from the dsu's {@link INFO_PATH} or not
     * @param {object} [options] query options. defaults to {@link DEFAULT_QUERY_OPTIONS}
     * @param {function(err, object[])} callback
     * @override
     */
    getAll(readDSU, options, callback){
        if (!callback){
            if (!options){
                callback = readDSU;
                options = DEFAULT_QUERY_OPTIONS;
                readDSU = true;
            }
            if (typeof readDSU === 'boolean'){
                callback = options;
                options = DEFAULT_QUERY_OPTIONS;
            }
            if (typeof readDSU === 'object'){
                callback = options;
                options = readDSU;
                readDSU = true;
            }
        }

        options = options || DEFAULT_QUERY_OPTIONS;

        options = options || defaultOptions();

        let gtin = typeof options.query === 'string'
            ? (options.query.indexOf("gtin") !== -1 ? options.query : undefined)
            : options.query.find(q => q.indexOf("gtin") !== -1);

        if (!gtin)
            return callback("missing gtin in query");

        const m = /\d+$/g.exec(gtin);

        if (m)
            gtin = m[0]

        this.getStorage().query(this._getTableName(), options.query, options.sort, options.limit, {gtin: gtin}, (err, records) => {
            if (err)
                return callback(err);
            if (readDSU)
                return callback(undefined, records.results);
            callback(undefined, records.results.map(b => this.mapRecordToKey(gtin, b)));
        })
    }


    getPage(itemsPerPage, page, dsuQuery, keyword, sort, readDSU, callback) {
        let receivedPage = page || 1;
        sort = SORT_OPTIONS[(sort || SORT_OPTIONS.DSC).toUpperCase()] ? SORT_OPTIONS[(sort || SORT_OPTIONS.DSC).toUpperCase()] : SORT_OPTIONS.DSC;
        const self = this;

        let gtin = typeof dsuQuery === 'string'
            ? (dsuQuery.indexOf("gtin") !== -1 ? dsuQuery : undefined)
            : dsuQuery.find(q => q.indexOf("gtin") !== -1);

        if (!gtin)
            return callback(undefined, toPage(0,0, [], itemsPerPage));

        const m = /\d+$/g.exec(gtin);

        if (m)
            gtin = m[0]

        this.getStorage().query(this._getTableName(), dsuQuery && dsuQuery.length ? dsuQuery : undefined, sort, DEFAULT_QUERY_OPTIONS.limit, {
            itemsPerPage: itemsPerPage,
            page: receivedPage
        }, (err, records) => {
            if (err)
                return callback(err);
            callback(undefined, toPage(records.meta.page, records.meta.totalPages, readDSU ? records.results: records.results.map(r => self.mapRecordToKey(gtin, r)), itemsPerPage));
        });
    }

    /**
     * Removes a product from the list (does not delete/invalidate DSU, simply 'forgets' the reference)
     * @param {string|number} gtin
     * @param {string|number} batchNumber
     * @param {function(err)} callback
     * @override
     */
    remove(gtin, batchNumber, callback) {
        super.remove([gtin, batchNumber], callback);
    }

    /**
     *
     * @param model
     * @returns {Batch}
     * @override
     */
    fromModel(model){
        return new Batch(super.fromModel(model));
    }

    /**
     * updates a Batch from the list
     * @param {string|number} gtin
     * @param {Batch} newBatch
     * @param {function(err, Batch?, Archive?)} callback
     * @override
     */
    update(gtin, newBatch, callback){
        const status = newBatch.batchStatus.status
        const request = {
            status: status,
            extraInfo: newBatch.batchStatus.extraInfo
        }

        return this.getStorage().updateRecord(this._getTableName(), [gtin, newBatch.batchNumber], request, callback)
    }

}

/**
 * @param {BaseManager} participantManager
 * @param {function(err, Manager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @returns {BatchManager}
 * @memberOf Managers
 */
const getBatchManager = function (participantManager, callback) {
    let manager;
    try {
       manager = participantManager.getManager(BatchManager);
        if (callback)
            return callback(undefined, manager);
    } catch (e){
       manager = new BatchManager(participantManager, callback);
    }

    return manager;
}

module.exports = getBatchManager;
