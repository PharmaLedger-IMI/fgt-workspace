const {INFO_PATH, DB, DEFAULT_QUERY_OPTIONS, ANCHORING_DOMAIN} = require('../../fgt-dsu-wizard/constants');
const ApiManager = require("./ApiManager");
const Stock = require('../../fgt-dsu-wizard/model/Stock');
const StockManagementService = require("../../fgt-dsu-wizard/services/StockManagementService");
const ProductService = require('../../fgt-dsu-wizard/services/ProductService');
const BatchService = require('../../fgt-dsu-wizard/services/BatchService');



/**
 * Stock Manager Class
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
 * @class StockManager
 * @extends Manager
 * @memberOf Managers
 */
class StockManager extends ApiManager{
    constructor(participantManager, serialization, aggregation, callback) {
        super(participantManager, DB.stock, ['name', 'gtin', 'manufName', 'quantity'], callback || aggregation);
        this.serialization = serialization;
        this.aggregation = callback ? aggregation : false;
        this.productService = undefined;
        this.batchService = undefined;
        this.participantManager = participantManager;
    }

    /**
     * Creates a {@link Product} dsu
     * @param {string|number} [gtin] the table key
     * @param {Stock} stock
     * @param {function(err, keySSI, string)} callback where the string is the mount path relative to the main DSU
     */
    create(gtin, stock, callback) {
        return callback("never called in this implemetation")
    }

    /**
     * updates a product from the list
     * @param {string|number} [gtin] the table key
     * @param {Stock} newStock
     * @param {function(err, Stock)} callback
     * @override
     */
    update(gtin, newStock, callback){
        return callback("never called in this implemetation")
    }

    /**
     * reads ssi for that gtin in the db. loads is and reads the info at '/info'
     * @param {string} gtin
     * @param {boolean} [readDSU] defaults to true. decides if the manager loads and reads from the dsu or not
     * @param {function(err, Stock|KeySSI, Archive)} callback returns the Product if readDSU and the dsu, the keySSI otherwise
     * @override
     */
    getOne(gtin, readDSU,  callback) {
        if (!callback){
            callback = readDSU;
            readDSU = true;
        }
       super.getOne(gtin, readDSU, (err, result) => {
           if (err)
               return callback(err);
           if (readDSU)
               return callback(undefined, new Stock(result))
           callback(undefined, result)
       });
    }


    mapRecordToKey(record) {
        return record.gtin;
    }

    /**
     * Lists all registered items according to query options provided
     * @param {boolean} [readDSU] defaults to true. decides if the manager loads and reads from the dsu's {@link INFO_PATH} or not
     * @param {object} [options] query options. defaults to {@link DEFAULT_QUERY_OPTIONS}
     * @param {function(err, object[])} callback
     * @override
     */
    getAll(readDSU, options, callback){
        const defaultOptions = () => Object.assign({}, DEFAULT_QUERY_OPTIONS, {
            query: ['gtin like /.*/g']
        });

        if (!callback){
            if (!options){
                callback = readDSU;
                options = defaultOptions();
                readDSU = true;
            }
            if (typeof readDSU === 'boolean'){
                callback = options;
                options = defaultOptions();
            }
            if (typeof readDSU === 'object'){
                callback = options;
                options = readDSU;
                readDSU = true;
            }
        }

        options = options || defaultOptions();
        super.getAll(readDSU, options, callback)
    }

    _getProduct(gtin, callback){
        if (!this.productService)
            this.productService = new ProductService(ANCHORING_DOMAIN);
        this.productService.getDeterministic(gtin, callback);
    }

    _getBatch(gtin, batch, callback){
        if (!this.batchService)
            this.batchService = new BatchService(ANCHORING_DOMAIN);
        this.batchService.getDeterministic(gtin, batch, callback)
    }

    /**
     * Get partner stock products that were shipped by MAH/manufName
     * @param { string } gtin
     * @param {{manufName: string, batch: number, partnersId: string || string[]}} options
     * @param callback
     */
    getStockTraceability(gtin, options, callback) {
        let self = this;
        if (!callback) {
            callback = options;
            options = {}
        }
        const {manufName, batch, partnersId} = options;

        if (!manufName) {
            return self._getProduct(gtin, (err, product) => {
                if (err)
                    return callback(err);
                return self.getStockTraceability(gtin, {batch, partnersId, manufName: product.manufName}, callback);
            });
        }

        const identity = self.getIdentity();
        if (identity.id !== manufName) {
            return callback('Stock Traceability is only available for Marketing Authorization Holder')
        }

        try {
            this.stockManager = this.stockManager || this.participantManager.getManager("StockManager");
            this.shipmentLineManager = this.shipmentLineManager || this.participantManager.getManager("ShipmentLineManager");
            this.receiptManager = this.receiptManager || this.participantManager.getManager("ReceiptManager");
        } catch (e) {
            return callback(e);
        }
        const stockManagementService = new StockManagementService(manufName, partnersId, this.stockManager, this.shipmentLineManager, this.receiptManager);
        stockManagementService.traceStockManagement(gtin, batch, callback)
    }

    toModel(filteredStock, model){
        return Object.entries(filteredStock).map(([key, value]) => {
            return {
                gtin: key,
                name: value.name,
                batches: value.stock
            }
        });
    }

}


/**
 * @param {ParticipantManager} participantManager
 * @param {boolean} [serialization] defaults to true.
 * @param {function(err, Manager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @returns {StockManager}
 * @memberOf Managers
 */
const getStockManager = function (participantManager, serialization, callback) {
    if (!callback){
        callback = serialization;
        serialization = true;
    }
    let manager;
    try {
        manager = participantManager.getManager(StockManager);
        if (callback)
            return callback(undefined, manager);
    } catch (e){
        manager = new StockManager(participantManager, serialization, callback);
    }

    return manager;
}

module.exports = getStockManager;