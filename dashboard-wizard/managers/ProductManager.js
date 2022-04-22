const {INFO_PATH, DB, DEFAULT_QUERY_OPTIONS} = require('../../fgt-dsu-wizard/constants');
const ApiManager = require("./ApiManager");
const Product = require('../../fgt-dsu-wizard/model/Product');


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
 * @param {ParticipantManager} participantManager
 * @param {function(err, Manager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @class ProductManager
 * @extends Manager
 * @memberOf Managers
 */
class ProductManager extends ApiManager {
    constructor(participantManager, callback) {
        super(participantManager, "product", ['gtin', 'name', 'manufName'], callback);
    }

    /**
     * Creates a {@link Product} dsu
     * @param {string|number} [gtin] the table key
     * @param {Product} product
     * @param {function(err, keySSI?, string?)} callback where the string is the mount path relative to the main DSU
     * @override
     */
    create(gtin, product, callback) {
        if (!callback){
            callback = product;
            product = gtin;
            gtin = undefined;
        }
        super.create(gtin, product, callback)
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
        return callback(`Product DSUs cannot be updated`);
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
        super.getAll(readDSU, options, callback);
    }

    /**
     *
     * @param model
     * @returns {Product}
     * @override
     */
    fromModel(model){
        return new Product(super.fromModel(model));
    }
}

/**
 * @param {ParticipantManager} [participantManager] only required the first time, if not forced
 * @param {function(err, Manager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @returns {ProductManager}
 * @memberOf Managers
 */
const getProductManager = function (participantManager, callback) {
    let manager;
    try {
        manager = participantManager.getManager(ProductManager);
        if (callback)
            return callback(undefined, manager);
    } catch (e){
        manager = new ProductManager(participantManager, callback);
    }

    return manager;
}

module.exports = getProductManager;