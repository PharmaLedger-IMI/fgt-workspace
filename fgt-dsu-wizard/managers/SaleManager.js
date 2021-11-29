const {INFO_PATH, DB, DEFAULT_QUERY_OPTIONS, ANCHORING_DOMAIN} = require('../constants');
const Manager = require("../../pdm-dsu-toolkit/managers/Manager");
const Sale = require('../model/Sale');
const Batch = require('../model/Batch');
const {toPage, paginate} = require("../../pdm-dsu-toolkit/managers/Page");
const utils = require('../services').utils;

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
        super(participantManager, DB.sales, ['id', 'products', 'sellerId'], callback);
        this.stockManager = participantManager.stockManager;
        this.saleService = new (require('../services').SaleService)(ANCHORING_DOMAIN);
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

            const toManage = {};

            const cb = function(err, ...results){
                if (err)
                    return self.cancelBatch(err2 => {
                        callback(err);
                    });
                callback(undefined, ...results);
            }

            const stockVerificationIterator = function(stocksCopy, callback){
                const stock = stocksCopy.shift();
                if (!stock)
                    return callback(undefined, toManage);

                toManage[stock.gtin] = sale.productList.filter(ip => ip.gtin === stock.gtin).reduce((accum, ip) => {
                    let preExisting = accum.find(b => b.batchNumber === ip.batchNumber);
                    if (!preExisting){
                        preExisting = new Batch({
                            batchNumber: ip.batchNumber,
                            serialNumbers: []
                        });
                        accum.push(preExisting);
                    }
                    preExisting.serialNumbers.push(ip.serialNumber);
                    return accum;
                }, []).map(b => {
                    b.quantity = - b.getQuantity();
                    return b;
                });

                stockVerificationIterator(stocksCopy, callback);
            }


            stockVerificationIterator(stocks.slice(), (err, toBeManaged) => {
                if (err)
                    return self._err(`Not enough stock`, err, callback);

                const productIterator = function(gtins, result, callback){
                    const gtin = gtins.shift();
                    if (!gtin)
                        return callback(undefined, result);

                    self.batchAllow(self.stockManager);
                    self.stockManager.manageAll(gtin, toBeManaged[gtin].slice(), (err, serials, stocks) => {
                        self.batchDisallow(self.stockManager);
                        if (err)
                            return cb(err);
                        result.push(...stocks);
                        productIterator(gtins, result, callback);
                    });
                }

                const dbAction = function(sale, toBeManaged, callback) {
                    try {
                        self.beginBatch();
                    } catch (e){
                        return self.batchSchedule(() => dbAction(sale, toBeManaged,  callback));
                        //return callback(e);
                    }

                    productIterator(Object.keys(toBeManaged), [], (err, results) => {
                        if (err)
                            return cb(err);
                        console.log(`Creating sale entry for: ${sale.productList.map(p => `${p.gtin}-${p.batchNumber}-${p.serialNumber}`).join(', ')}`);
                        self.splitSalesByMAHAndCreate(sale, (err, SSis) => {
                            if (err)
                                return cb(`Could not Crease Sales DSUs`);
                            self.insertRecord(sale.id, self._indexItem(sale), (err) => {
                                if (err)
                                    return cb(`Could not insert record with gtin ${sale.id} on table ${self.tableName}`);
                                self.commitBatch((err) => {
                                    if(err)
                                        return cb(err);
                                    const path =`${self.tableName}/${sale.id}`;
                                    console.log(`Sale stored at '${path}'`);
                                    callback(undefined, sale, path);
                                });
                            });
                        });
                    });
                }

                dbAction(sale, toBeManaged,  callback);
            });
        });
    }

    splitSalesByMAHAndCreate(sale, callback){
        const self = this;

        const sellerId = self.getIdentity().id;

        const prodsByMAH = sale.productList.reduce((accum, ip) => {
            accum[ip.manufName] = accum[ip.manufName] || [];
            accum[ip.manufName].push(ip);
            return accum;
        }, {});

        const createIterator = function(products, accumulator, callback){
            if (!callback){
                callback = accumulator;
                accumulator = [];
            }
            const splitSale = new Sale({
               id: sale.id,
               sellerId: sellerId,
               productList: products
            });

            self.saleService.create(splitSale, (err, keySSI, dsu) => {
                if (err)
                    return self._err(`Could not create Sale DSU`, err, callback);
                accumulator.push(keySSI.getIdentifier());
                console.log(`Created split Sale with SSI ${keySSI.getIdentifier()}`);
                callback(undefined, accumulator);
            });
        }

        const createAndNotifyIterator = function(mahs, accumulator, callback){
            if (!callback){
                callback = accumulator;
                accumulator = {};
            }

            const mah = mahs.shift();
            if (!mah)
                return callback(undefined, accumulator);

            createIterator(prodsByMAH[mah].slice(), (err, keySSIs) => {
                if (err)
                    return callback(err);
                accumulator[mah] = keySSIs;
                const keySSISpace = utils.getKeySSISpace();

                let readSSIs;

                try {
                    readSSIs = keySSIs.map(k => keySSISpace.parse(k).derive().getIdentifier())
                } catch(e) {
                    return callback(`Invalid keys found`);
                }

                self.sendMessage(mah, DB.receipts, readSSIs, err =>
                    self._messageCallback(err ? `Could not send message` : `Message to Mah ${mah} sent with sales`));
                createAndNotifyIterator(mahs, accumulator, callback);
            });
        }

        createAndNotifyIterator(Object.keys(prodsByMAH), callback);
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