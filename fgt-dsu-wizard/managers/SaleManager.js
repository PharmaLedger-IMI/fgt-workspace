const {INFO_PATH, DB, DEFAULT_QUERY_OPTIONS, ANCHORING_DOMAIN} = require('../constants');
const Manager = require("../../pdm-dsu-toolkit/managers/Manager");
const {functionCallIterator} = require('../services').utils;
const Sale = require('../model/Sale');
const Batch = require('../model/Batch');

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
 * @class SaleManager
 * @extends Manager
 * @memberOf Managers
 */
class SaleManager extends Manager{
    constructor(participantManager, callback) {
        super(participantManager, DB.sales, ['id', 'products'], callback);
        this.stockManager = participantManager.stockManager;
    }

    /**
     *
     * @param key
     * @param item
     * @param {Sale} record
     * @return {{}}
     * @private
     */
    _indexItem(key, item, record) {
        if (!record){
            record = item;
            item = undefined;
            if (!record){
                record = key;
                key = record.id
            }
        }
        return Object.assign(record, {
            products: record.productList
                .map(ip => `${ip.gtin}-${ip.batchNumber}-${ip.serialNumber}`)
                .join(',')})
    }

    /**
     * Creates a {@link Sale} entry
     * @param {Sale} sale
     * @param {function(err, keySSI, string)} callback where the string is the mount path relative to the main DSU
     */
    create(sale, callback) {
        let self = this;
        if (sale.validate())
            return callback(`Invalid sale`);
        self.stockManager.getAll(true, {
            query: [
                `gtin like /${sale.productList.map(il => il.gtin).join('|')}/g`
            ]
        }, (err, stocks) => {
            if (err)
                return self._err(`Could not get stocks for sale`, err, callback);

            const stockVerificationIterator = function(stocksCopy, callback){
                const stock = stocksCopy.shift();
                if (!stock)
                    return callback();
                const needed = sale.productList.filter(ip => ip.gtin === stock.gtin).length;
            }


        });
        console.log(`Creating sale entry for: ${sale.productList.map(p => `${p.gtin}-${p.batchNumber}-${p.serialNumber}`).join(', ')}`);
        self.insertRecord(sale.id, self._indexItem(sale), (err) => {
            if (err)
                return self._err(`Could not insert record with gtin ${sale.id} on table ${self.tableName}`, err, callback);
            const path =`${self.tableName}/${sale.id}`;
            console.log(`Sale stored at '${path}'`);
            callback(undefined, sale, path);
        });
    }

    /**
     * updates a product from the list
     * @param {string|number} [id] the table key
     * @param {Sale} newSale
     * @param {function(err, Sale?)} callback
     * @override
     */
    update(id, newSale, callback){
        return callback(`All sales are final`);
    }


    manage(sale, callback){
        const self = this;

        if (sale.validate())
            return callback(`Invalid sale`);

        if (batch.length === 0)
            return callback();

        const gtin = product.gtin || product;

        self.getOne(gtin, true, (err, stock) => {
            if (err){
                if (batch.quantity < 0)
                    return callback(`Trying to reduce from an unexisting stock`);

                const cb = function(product){
                    const newStock = new Stock(product);
                    self._getBatch(product.gtin, batch.batchNumber, (err, batchFromDSU) => {
                        if (err)
                            return callback(err);
                        batch = new Batch({
                            batchNumber: batchFromDSU.batchNumber,
                            expiry: batchFromDSU.expiry,
                            serialNumbers: batch.serialNumbers,
                            quantity: batch.quantity,
                            batchStatus: batchFromDSU.batchStatus
                        })
                        newStock.batches = [batch];
                        return self.create(gtin, newStock, callback);
                    });
                }

                if (typeof product !== 'string')
                    return cb(product);

                return self._getProduct(product, (err, product) => err
                    ? callback(err)
                    : cb(product));
            }

            const sb = stock.batches.find(b => b.batchNumber === batch.batchNumber);

            let serials;
            if (!sb){
                if (batch.getQuantity() < 0)
                    return callback(`Given a negative amount on a unexisting stock`);
                stock.batches.push(batch);
                console.log(`Added batch ${batch.batchNumber} with ${batch.serialNumbers ? batch.serialNumbers.length : batch.getQuantity()} items`);
            } else {
                const newQuantity = sb.getQuantity()  + batch.getQuantity() ;
                if (newQuantity < 0)
                    return callback(`Illegal quantity. Not enough Stock. requested ${batch.getQuantity() } of ${sb.getQuantity() }`);
                serials = sb.manage(batch.getQuantity() , this.serialization);
            }

            self.update(gtin, stock, (err) => {
                if (err)
                    return self._err(`Could not manage stock for ${gtin}: ${err.message}`, err, callback);
                console.log(`Updated Stock for ${gtin} batch ${batch.batchNumber}. ${self.serialization && serials ? serials.join(', ') : ''}`);
                callback(undefined, serials || batch.serialNumbers || batch.quantity);
            });
        });
    }

    manageAll(product, batches, callback){
        const self = this;
        const iterator = function(product){
            return function(batches, callback){
                return self.manage(product, batches, callback);
            }
        }

        functionCallIterator(iterator(product).bind(this), ['batchNumber'], batches, (err, results) => {
            if (err)
                return self._err(`Could not perform manage all on Stock`, err, callback);
            results = Object.keys(results).reduce((accum, key) => {
                accum[key] = results[key][0][0];
                return accum;
            }, {})
            callback(undefined, results);
        });
    }

    /**
     * reads ssi for that gtin in the db. loads is and reads the info at '/info'
     * @param {string} id
     * @param {boolean} [readDSU] defaults to true. decides if the manager loads and reads from the dsu or not
     * @param {function(err, Stock|KeySSI, Archive)} callback returns the Product if readDSU and the dsu, the keySSI otherwise
     * @override
     */
    getOne(id, readDSU,  callback) {
        if (!callback){
            callback = readDSU;
            readDSU = true;
        }
        let self = this;
        self.getRecord(id, (err, sale) => {
            if (err)
                return self._err(`Could not load record with key ${id} on table ${self._getTableName()}`, err, callback);
            callback(undefined, new Sale(sale));
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
            query: [
                "__timestamp > 0",
                'id like /.*/g'
            ],
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

        let self = this;
        self.query(options.query, options.sort, options.limit, (err, records) => {
            if (err)
                return self._err(`Could not perform query`, err, callback);
            if (!readDSU)
                return callback(undefined, records.map(r => r.pk));
            callback(undefined, records.map(r => new Sale(r)));
        });
    }
}


/**
 * @param {ParticipantManager} participantManager
 * @param {function(err, Manager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @returns {SaleManager}
 * @memberOf Managers
 */
const getSaleManager = function (participantManager, callback) {
    let manager;
    try {
        manager = participantManager.getManager(SaleManager);
        if (callback)
            return callback(undefined, manager);
    } catch (e){
        manager = new SaleManager(participantManager, callback);
    }

    return manager;
}

module.exports = getSaleManager;