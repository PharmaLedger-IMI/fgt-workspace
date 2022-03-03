const {INFO_PATH, DB, DEFAULT_QUERY_OPTIONS, ANCHORING_DOMAIN} = require('../constants');
const Manager = require("../../pdm-dsu-toolkit/managers/Manager");
const Sale = require('../model/Sale');
const Batch = require('../model/Batch');
const BatchStatus = require('../model/BatchStatus');
const IndividualProduct = require('../model/IndividualProduct');
const {toPage, paginate} = require("../../pdm-dsu-toolkit/managers/Page");
const utils = require('../services').utils;
const getReceiptManager = require('./ReceiptManager');


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
        super(participantManager, DB.sales, ['id', 'products', 'sellerId'], (err, manager) => {
            if (err)
                return callback ? callback(err) : console.log(err);
            getReceiptManager(participantManager, (err, receiptManager) => {
                if (err)
                    console.log(`Could not get IssuedOrderManager:`, err);
                else
                    manager.receiptManager = receiptManager;

                if (callback)
                    callback(undefined, manager);
            })
        });
        this.stockManager = participantManager.stockManager;
        this.receiptManager = this.receiptManager || undefined;
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
     * Verify if the sale can be done. Some conditions that are checked:
     *  - GTIN and BATCH need exists in stock
     * - Check if product qty in stock is enough
     *  - Check if sale is not duplicated (product already sold)
     * - Check if product status is not recalled or quarantined
     * @param {{}} aggStock: key is a GTIN, value is an array of BATCHES
     * @param {{}} productList: key is a manufName identifier, value is an array of IndividualProduct
     * @param callback
     */
    _checkStockAvailability(aggStock, productList, callback) {
        const self = this;
        const qtySoldByGtinBatch = {}; // qty sold by gtin and batch, cannot sale more than exists on stock
        const qtySoldBySn = {}; // qty sold by serial number, cannot sale same product more than once
        const aggBatchesByGtin = {}
        const aggIndividualProductsByMAH = {};

        const iterator = (_aggStock, _productList, _callback) => {
            const productSold = _productList.shift();
            if (!productSold)
                return _callback(undefined, aggBatchesByGtin, aggIndividualProductsByMAH);

            const receiptId = self.receiptManager._genCompostKey(productSold);
            self.receiptManager.getOne(receiptId, (err, receipt) => {
                if (receipt)
                    return _callback(`Product gtin: ${productSold.gtin}, batchNumber: ${productSold.batchNumber}, serialNumber: ${productSold.serialNumber} already sold.`);

                const gtinBatchNumber = `${productSold.gtin}-${productSold.batchNumber}`;
                if(!(_aggStock.hasOwnProperty(gtinBatchNumber)))
                    return _callback(`Product gtin ${productSold.gtin}, batchNumber ${productSold.batchNumber} not found in stock.`);

                // check if selling the same product more than once
                const indProductId = `${productSold.gtin}-${productSold.batchNumber}-${productSold.serialNumber}`;
                qtySoldBySn[indProductId] = 1 + (qtySoldBySn[indProductId]  || 0);
                if (qtySoldBySn[indProductId] > 1)
                    return _callback(`Product ${productSold.gtin}: trying to sold a product more than once.`);

                const stockProduct = _aggStock[gtinBatchNumber];
                // check if sale qty is available in stock
                qtySoldByGtinBatch[gtinBatchNumber] = 1 + (qtySoldByGtinBatch[gtinBatchNumber] || 0);
                if (stockProduct.batch.quantity - qtySoldByGtinBatch[gtinBatchNumber] < 0)
                    return _callback(`Product ${productSold.gtin}: quantity not enough in stock.`);

                if (stockProduct.batch.batchStatus.status !== BatchStatus.COMMISSIONED)
                    return _callback(`Product gtin ${productSold.gtin}, batch ${productSold.batchNumber}: is not available for sale, because batchStatus is ${stockProduct.batch.batchStatus.status}. `)

                const individualProductSold = new IndividualProduct({
                    gtin: productSold.gtin,
                    batchNumber: productSold.batchNumber,
                    serialNumber: productSold.serialNumber,
                    name: stockProduct.name,
                    manufName: stockProduct.manufName,
                    expiry: stockProduct.batch.expiry,
                    status: stockProduct.batch.batchStatus.status
                });

                // add to aggIndividualProductsByMAH
                const mah = stockProduct.manufName;
                if (aggIndividualProductsByMAH.hasOwnProperty(mah))
                    aggIndividualProductsByMAH[mah].push(individualProductSold);
                else
                    aggIndividualProductsByMAH[mah] = [individualProductSold];

                // add to aggBatchesByGtin
                if (aggBatchesByGtin.hasOwnProperty(productSold.gtin)) {
                    const batch = aggBatchesByGtin[productSold.gtin].find((batch) => batch.batchNumber === productSold.batchNumber);
                    batch.serialNumbers.push(productSold.serialNumber);
                    batch.quantity = batch.getQuantity() * -1; // update qty because when create a Batch, there is a qty validation
                } else {
                    const batch = new Batch({
                        batchNumber: productSold.batchNumber,
                        serialNumbers: [productSold.serialNumber],
                    });
                    batch.quantity = batch.getQuantity() * -1; // update qty because when create a Batch, there is a qty validation
                    aggBatchesByGtin[productSold.gtin] = [batch]
                }

                iterator(_aggStock, _productList, _callback);
            })
        }

        iterator(aggStock, productList.slice(), callback);
    }

    /**
     * Creates a {@link Sale} entry
     * @param {Sale} sale
     * @param {function(err, keySSI?, string?)} callback where the string is the mount path relative to the main DSU
     */
    create(sale, callback) {
        let self = this;

        if (!(sale instanceof Sale))
            sale = new Sale(sale);

        const query = {query: [`gtin like /${sale.productList.map(il => il.gtin).join('|')}/g`]};
        self.stockManager.getAll(true, query, (err, stocks) => {
            if (err)
                return self._err(`Could not get stocks for sale`, err, callback);

            if (!stocks || stocks.length === 0)
                return callback(`Not available stock for sale.`);

            const cb = function(err, ...results){
                if (err)
                    return self.cancelBatch(_ => callback(err));
                callback(undefined, ...results);
            }

            const aggStockByGtinBatch = (accum, _stock, _callback) => {
                const stock = _stock.shift();
                if (!stock)
                    return _callback(accum);

                const batches = stock.batches.reduce((_accum, batch) => {
                    _accum[`${stock.gtin}-${batch.batchNumber}`] = {
                        gtin: stock.gtin,
                        name: stock.name,
                        manufName: stock.manufName,
                        batch: batch
                    };
                    return _accum;
                }, {});

                accum = {...accum, ...batches};
                aggStockByGtinBatch(accum, _stock, _callback);
            }

            aggStockByGtinBatch({}, stocks.slice(), (resultAggStockByGtinBatch) => {

                self._checkStockAvailability(resultAggStockByGtinBatch, sale.productList, (err, aggBatchesByGtin, aggIndividualProductsByMAH) => {
                    if (err)
                        return callback(err);

                    const dbAction = function(sale, aggBatchesByGtin, aggIndividualProductsByMAH, _callback) {
                        try {
                            self.beginBatch();
                        } catch (e){
                            return self.batchSchedule(() => dbAction(sale, aggBatchesByGtin, aggIndividualProductsByMAH, _callback));
                        }

                        const removeFromStock = function(gtins, _aggBatchesByGtin, _callback){
                            const gtin = gtins.shift();
                            if (!gtin)
                                return _callback(undefined);

                            self.batchAllow(self.stockManager);
                            self.stockManager.manageAll(gtin, _aggBatchesByGtin[gtin].slice(), (err, serials, stocks) => {
                                self.batchDisallow(self.stockManager);
                                if (err)
                                    return _callback(err);
                                removeFromStock(gtins, _aggBatchesByGtin, _callback);
                            });
                        }

                        removeFromStock(Object.keys(aggBatchesByGtin), aggBatchesByGtin, (err) => {
                            if (err)
                                return cb(err);
                            console.log(`Creating sale entry for: ${sale.productList.map(p => `${p.gtin}-${p.batchNumber}-${p.serialNumber}`).join(', ')}`);
                            self._addSale(sale.id, aggIndividualProductsByMAH, (err, readSSis, insertedSale, ) => {
                                if (err)
                                    return cb(`Could not Crease Sales DSUs`);
                                self.insertRecord(insertedSale.id, self._indexItem(insertedSale), (err) => {
                                    if (err)
                                        return cb(`Could not insert record with id ${insertedSale.id} on table ${self.tableName}`);
                                    self.commitBatch((err) => {
                                        if(err)
                                            return cb(err);
                                        const path =`${self.tableName}/${insertedSale.id}`;
                                        console.log(`Sale stored at '${path}'`);
                                        _callback(undefined, insertedSale, path, readSSis);
                                    });
                                });
                            });
                        });
                    }

                    dbAction(sale, aggBatchesByGtin,  aggIndividualProductsByMAH, callback);
                });
            })

        }); // stockManager.getAll end
    }

    _addSale(saleId, aggIndividualProductsByMAH, callback){
        const self = this;
        const sellerId = self.getIdentity().id;
        const insertedSale = new Sale({
            id: saleId,
            sellerId: sellerId,
            productList: []
        });
        const saleReadSSIs = [];

        const createIterator = function(products, accumulator, _callback){
            const saleByMAH = new Sale({
                id: saleId,
                sellerId: sellerId,
                productList: products
            });
            const saleErr = saleByMAH.validate();
            if (saleErr)
                return self._err(`Sale validate error`, saleErr, _callback);
            insertedSale.productList.push(...saleByMAH.productList);

            self.saleService.create(saleByMAH, (err, keySSI, dsu) => {
                if (err)
                    return self._err(`Could not create Sale DSU`, err, _callback);
                accumulator.push(keySSI.getIdentifier());
                console.log(`Created Sale with SSI ${keySSI.getIdentifier()}`);
                _callback(undefined, accumulator);
            });
        }

        const createAndNotifyIterator = function(mahs, accumulator, _callback){
            const mah = mahs.shift();
            if (!mah)
                return _callback(undefined, saleReadSSIs, insertedSale);

            createIterator(aggIndividualProductsByMAH[mah].slice(), [], (err, keySSIs) => {
                if (err)
                    return _callback(err);
                accumulator[mah] = keySSIs;
                const keySSISpace = utils.getKeySSISpace();

                let readSSIs;

                try {
                    readSSIs = keySSIs.map(k => keySSISpace.parse(k).derive().getIdentifier())
                    saleReadSSIs.push(...readSSIs);
                } catch(e) {
                    return _callback(`Invalid keys found`);
                }

                self.sendMessage(mah, DB.receipts, readSSIs, err =>
                    self._messageCallback(err ? `Could not send message` : `Message to Mah ${mah} sent with sales`));
                createAndNotifyIterator(mahs, accumulator, _callback);
            });
        }

        createAndNotifyIterator(Object.keys(aggIndividualProductsByMAH), {}, callback);
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