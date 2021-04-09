const {INFO_PATH, ANCHORING_DOMAIN, DB} = require('../constants');
const Manager = require("../../pdm-dsu-toolkit/managers/Manager");
const Product = require('../model').Product;


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
        this.productService = new (require('../services').ProductService)(ANCHORING_DOMAIN);
        this.batchManager = require('./BatchManager')(participantManager);
        this._getProduct = super._getDSUInfo;
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
     * Reads the Product (parsed from the json at the {@link INFO_PATH}) from DSU from the provided KeySSI
     * @param {string|KeySSI} keySSI
     * @param {function(err, Product, Archive)} callback
     * @see Manager#_getDSUInfo
     * @private
     */
    _getProduct(keySSI, callback){};

    /**
     * Creates a {@link Product} dsu
     * @param {Product} product
     * @param {function(err, keySSI, string)} callback where the string is the mount path relative to the main DSU
     */
    create(product, callback) {
        let self = this;
        self._bindMah(product, (err, product) => {
            if (err)
                return self._err(`Could not bind mah to product`, err, callback);
            self.productService.create(product, (err, keySSI) => {
                if (err)
                    return self._err(`Could not create product DSU for ${product}`, err, callback);
                const record = keySSI.getIdentifier();
                self.insertRecord(product.gtin, record, (err) => {
                    if (err)
                        return self._err(`Could not inset record with gtin ${product.gtin} on table ${self.tableName}`, err, callback);
                    const path =`${self.tableName}/${product.gtin}`;
                    console.log(`Product ${product.gtin} created stored at '${path}'`);
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
     */
    getOne(gtin, readDSU,  callback) {
        if (!callback){
            callback = readDSU;
            readDSU = true;
        }
        let self = this;
        self.getRecord(gtin, (err, productSSI) => {
            if (err)
                return self._err(`Could not load record with gtin ${gtin} on table ${self.tableName}`, err, callback);
            if (!readDSU)
                return callback(undefined, productSSI);
            self._getProduct(productSSI, callback);
        });
    }

    /**
     * Removes a product from the list (does not delete/invalidate DSU, simply 'forgets' the reference)
     * @param {string|number} gtin
     * @param {function(err)} callback
     */
    remove(gtin, callback) {
        let self = this;
        self.deleteRecord(gtin, callback);
    }

    /**
     * updates a product from the list
     * @param {Product} newProduct
     * @param {function(err, Product, Archive)} callback
     */
    update(newProduct, callback){
        let self = this;
        self.getRecord(newProduct.gtin, (err, record) => {
            if (err)
                return self._err(`Unable to retrieve record ${gtin} from table ${this.tableName}`, err, callback);
            self._getProduct(record, (err, product, dsu) => {
                if (err)
                    return self._err(`unable to get Product with ${gtin} from SSI ${record}`, err, callback);
                dsu.writeFile(INFO_PATH, JSON.stringify(newProduct), (err) => {
                    if (err)
                        return self._err(`Could not update product ${newProduct.gtin} with ${JSON.stringify(newProduct)}`, err, callback);
                    console.log(`Product ${gtin} updated`);
                    callback(undefined, newProduct, dsu)
                });
            });
        });
    }

    /**
     * Lists all registered products
     * @param {boolean} [readDSU] defaults to true. decides if the manager loads and reads from the dsu or not
     * @param {function(err, Product[])} callback
     */
    getAll(readDSU, callback) {
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
            super._iterator(records.slice(), self._getProduct, (err, result) => {
                if (err)
                    return self._err(`Could not parse products ${JSON.stringify(records)}`, err, callback);
                console.log(`Parsed ${result.length} products`);
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