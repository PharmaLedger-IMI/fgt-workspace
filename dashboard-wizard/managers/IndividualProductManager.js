const {INFO_PATH, DB, DEFAULT_QUERY_OPTIONS} = require('../../fgt-dsu-wizard/constants');
const ApiManager = require("./ApiManager");
const IndividualProduct = require('../../fgt-dsu-wizard/model/IndividualProduct');

/**
 * IndividualProduct Manager Class
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
 * @param {function(err, IndividualProductManager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @class IndividualProductManager
 * @extends Manager
 * @memberOf Managers
 */
class IndividualProductManager extends ApiManager {
    constructor(participantManager, callback) {
        super(participantManager, DB.individualProduct, ['gtin', 'batchNumber', 'serialNumber', 'status'], callback);
        this.participantManager = participantManager;
    }

    /**
     * Processes the received messages, saves them to the the table and deletes the message
     * @param {*} message
     * @param {function(err)} callback
     * @protected
     * @override
     */
    _processMessageRecord(message, callback) {
        let self = this;
        if (!message || typeof message !== "string")
            return callback(`Message ${message} does not have  non-empty string with keySSI. Skipping record.`);
        self._getDSUInfo(message, (err, product) => {
            if (err)
                return self._err(`Could not read DSU from message keySSI in record ${message}. Skipping record.`, err, callback);
            console.log(`Received IndividualProduct`, product);
            const key = self._genCompostKey(product.gtin, product.batchNumber, product.serialNumber);
            self.insertRecord(key, self._indexItem(key, product, message), callback);
        });
    };

    /**
     * generates the db's key for the batch
     * @param {string|number} gtin
     * @param {string|number} batchNumber
     * @param {string|number} serialNumber
     * @return {string}
     * @private
     */
    _genCompostKey(gtin, batchNumber, serialNumber){
        return `${gtin}-${batchNumber}-${serialNumber}`;
    }

    /**
     * Must wrap the entry in an object like:
     * <pre>
     *     {
     *         index1: ...
     *         index2: ...
     *         value: item
     *     }
     * </pre>
     * so the DB can be queried by each of the indexes and still allow for lazy loading
     * @param {string} key
     * @param {IndividualProduct} item
     * @param {string|object} record
     * @return {object} the indexed object to be stored in the db
     * @protected
     * @override
     */
    _indexItem(key, item, record){
        if (!record){
            record = item;
            item = key;
            key = undefined;
        }
        return {
            gtin: item.gtin,
            batchNumber: item.batchNumber,
            serialNumber: item.serialNumber,
            status: item.status,
            value: record
        }
    };

    /**
     * Util function that loads a ProductDSU and reads its information
     * @param {string|KeySSI} keySSI
     * @param {function(err, IndividualProduct, Archive)} callback
     * @protected
     * @override
     */
    _getDSUInfo(keySSI, callback){
        return this.individualProductService.get(keySSI, callback);
    }

    /**
     * Creates a {@link Product} dsu
     * @param {IndividualProduct} product
     * @param {function(err, keySSI, string)} callback where the string is the mount path relative to the main DSU
     * @override
     */
    create(product, callback) {
        let self = this;
        self.individualProductService.create(product, (err, keySSI) => {
            if (err)
                return self._err(`Could not create individual product DSU for ${product}`, err, callback);
            const record = keySSI.getIdentifier();
            const key = self._genCompostKey(product.gtin, product.batchNumber, product.serialNumber);
            self.insertRecord(key, self._indexItem(key, product, record), (err) => {
                if (err)
                    return self._err(`Could not insert record with gtin ${product.gtin} on table ${self.tableName}`, err, callback);
                const path =`${self.tableName}/${product.gtin}`;
                console.log(`IndividualProduct ${key} created & stored at '${path}'`);
                callback(undefined, keySSI, path);
            });
        });
    }

    /**
     * reads ssi for that gtin in the db. loads is and reads the info at '/info'
     * @param {string} gtin
     * @param {boolean} [readDSU] defaults to true. decides if the manager loads and reads from the dsu or not
     * @param {function(err, Product|KeySSI, Archive)} callback returns the Product if readDSU and the dsu, the keySSI otherwise
     * @override
     */
    getOne(gtin, readDSU,  callback) {
        super.getOne(gtin, readDSU, callback);
    }

    /**
     * Removes a product from the list (does not delete/invalidate DSU, simply 'forgets' the reference)
     * @param {string|number} gtin
     * @param {function(err)} callback
     * @override
     */
    remove(gtin, callback) {
        super.remove(gtin, callback);
    }

    /**
     * updates a product from the list
     * @param {string|number} [gtin] the table key
     * @param {Product} newProduct
     * @param {function(err, Product, Archive)} callback
     * @override
     */
    update(gtin, newProduct, callback){
        return callback(`Functionality not available`);
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
            query: ['__timestamp > 0'],
            sort: "dsc"
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

        super.getAll(readDSU, options, callback);
    }

    /**
     *
     * @param model
     * @returns {IndividualProduct}
     * @override
     */
    fromModel(model){
        return new IndividualProduct(super.fromModel(model));
    }
}

/**
 * @param {ParticipantManager} [participantManager] only required the first time, if not forced
 * @param {function(err, IndividualProductManager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @returns {IndividualProductManager}
 * @memberOf Managers
 */
const getIndividualProductManager = function (participantManager, callback) {
    let manager;
    try {
        manager = participantManager.getManager(IndividualProductManager);
        if (callback)
            return callback(undefined, manager);
    } catch (e){
        manager = new IndividualProductManager(participantManager, callback);
    }

    return manager;
}

module.exports = getIndividualProductManager;