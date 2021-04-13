const {INFO_PATH, ANCHORING_DOMAIN, DB, DEFAULT_QUERY_OPTIONS} = require('../constants');
const Manager = require("../../pdm-dsu-toolkit/managers/Manager");
const Product = require('../model/Product');


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
 */
class ProductManager extends Manager {
    constructor(participantManager) {
        super(participantManager, DB.products);
        this.productService = new (require('../services/ProductService'))(ANCHORING_DOMAIN);
        this.batchManager = require('./BatchManager')(participantManager);
    }

    /**
     * Binds the {@link Product#manufName} to the Product
     * @param {Product} product
     * @param {function(err, Product)} callback
     * @private
     */
    _bindMah(product, callback){
        let self = this;
        self.getIdentity((err, mah) => {
            if (err)
                return self._err(`Could not retrieve identity`, err, callback);
            product.manufName = mah.id;
            callback(undefined, product);
        });
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
     * @param {Product} item
     * @param {string|object} record
     * @return {object} the indexed object to be stored in the db
     * @protected
     * @override
     */
    _indexItem(key, item, record){
        return {
            gtin: key,
            name: item.name,
            value: record
        }
    };

    /**
     * Creates a {@link Product} dsu
     * @param {string|number} [gtin] the table key
     * @param {Product} product
     * @param {function(err, keySSI, string)} callback where the string is the mount path relative to the main DSU
     * @override
     */
    create(gtin, product, callback) {
        if (!callback){
            callback = product;
            product = gtin;
            gtin = product.gtin;
        }
        let self = this;
        self._bindMah(product, (err, product) => {
            if (err)
                return self._err(`Could not bind mah to product`, err, callback);
            self.productService.create(product, (err, keySSI) => {
                if (err)
                    return self._err(`Could not create product DSU for ${product}`, err, callback);
                const record = keySSI.getIdentifier();
                self.insertRecord(gtin, self._indexItem(gtin, product, record), (err) => {
                    if (err)
                        return self._err(`Could not inset record with gtin ${gtin} on table ${self.tableName}`, err, callback);
                    const path =`${self.tableName}/${gtin}`;
                    console.log(`Product ${gtin} created stored at '${path}'`);
                    callback(undefined, keySSI, path);
                });
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
        if (!callback){
            callback = newProduct;
            newProduct = gtin;
            gtin = newProduct.gtin;
        }
        let self = this;

        super.update(gtin, newProduct, (err, storedData, dsu) => {
            if (err)
                return self._err(`Could not update product with gtin ${gtin}`, err, callback);
            console.log(`Product ${gtin} updated`);
            callback(undefined, newProduct, dsu)
        });
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

        let self = this;
        self.query(options.query, options.sort, options.limit, (err, records) => {
            if (err)
                return self._err(`Could not perform query`, err, callback);
            if (!readDSU)
                return callback(undefined, records.map(r => r.gtin));
            records = records.map(r => r.value);
            self._iterator(records.slice(), self._getDSUInfo.bind(self), (err, result) => {
                if (err)
                    return self._err(`Could not parse ${self._getTableName()}s ${JSON.stringify(records)}`, err, callback);
                console.log(`Parsed ${result.length} ${self._getTableName()}s`);
                callback(undefined, result);
            });
        });
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

let productManager;
/**
 * @param {ParticipantManager} participantManager
 * @returns {ProductManager}
 */
const getProductManager = function (participantManager) {
    if (!productManager)
        productManager = new ProductManager(participantManager);
    return productManager;
}

module.exports = getProductManager;