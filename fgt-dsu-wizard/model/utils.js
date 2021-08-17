const {isEqual, generateGtin, genDate, generateProductName, generateBatchNumber, generateRandomInt, validateGtin, calculateGtinCheckSum, generate2DMatrixCode, getRandom} = require('../../pdm-dsu-toolkit/model/Utils');
const ShipmentLine = require('./ShipmentLine');
const Shipment = require('./Shipment');
const Batch = require('./Batch');
const ROLE = require('./DirectoryEntry').ROLE;

/**
 * Confirms the existence os the selected batches for each shipmentLine and returns the appropriate object
 * for {@link StockManager#manage} method
 * @param {StockManager} stockManager
 * @param {Shipment} shipment
 * @param {{}} stockObj
 * @param {function(err, batches?)} callback
 */
const confirmWithStock = function(stockManager, shipment, stockObj, callback){

    const stockIterator = function(stocksCopy, result, callback){
        const stockObj = stocksCopy.shift();
        if (!stockObj)
            return callback(undefined, result);

        const {orderLine, stock} = stockObj;
        const {batches} = stock;
        let {gtin, quantity} = orderLine;

        stockManager.getOne(gtin, true, (err, currentStock) => {
            if (err)
                return callback(`No stock found for product ${gtin}`);
            const currentBatches = currentStock.batches;

            let errorMessage = undefined;

            if (!batches.every(b => {
                if (!quantity)
                    return true;
                const current = currentBatches.find(cb => cb.batchNumber === b.batchNumber);
                if (!current){
                    errorMessage = `Batch ${b.batchNumber} not found in stock for product ${gtin}`;
                    return false;
                }
                result = result || {};
                result[gtin] = result[gtin] || [];

                const resultBatch = new Batch(b);
                if (stockManager.serialization){
                    resultBatch.serialNumbers = resultBatch.serialNumbers.splice(0, Math.min(quantity, b.getQuantity()));
                    resultBatch.quantity = resultBatch.getQuantity();
                } else {
                    resultBatch.serialNumbers = undefined;
                    resultBatch.quantity = Math.min(quantity, b.getQuantity());
                }

                result[gtin].push(resultBatch);
                quantity -= resultBatch.getQuantity();
                return true;
            })){
                return callback(errorMessage);
            }

            const resultQuantity = result[gtin].reduce((accum, b) => {
                accum += b.getQuantity();
                return accum;
            }, 0);

            if (resultQuantity < quantity)
                return callback(`Not enough stock for orderline of ${quantity} of product ${gtin}`);

            stockIterator(stocksCopy, result, callback);
        });
    }

    stockIterator(stockObj.slice(), undefined, (err, result) => {
        if (err || !result)
            return callback(err ? err : `Could not retrieve batches from stock`);
        const self = this;
        shipment.shipmentLines = shipment.shipmentLines.reduce((accum,s) => {
            result[s.gtin].forEach(b => {
                accum.push(new ShipmentLine({
                    gtin: s.gtin,
                    batch: b.batchNumber,
                    quantity: b.getQuantity(),
                    serialNumbers: self.serialization && self.aggregation ? b.serialNumbers : undefined,
                    senderId: shipment.senderId,
                    requesterId: shipment.requesterId,
                    status: shipment.status
                }))
            });
            return accum;
        }, [])

        callback(undefined, shipment);
    })
}

/**
 * Retrieves all the products from the provided directory manager
 * @param {DirectoryManager} directoryManager
 * @param {function(err, string[])} callback
 * @memberOf PopOver
 */
function getDirectoryProducts(directoryManager, callback){
    const options = {
        query: [`role == ${ROLE.PRODUCT}`]
    }
    directoryManager.getAll(false, options, (err, gtins) => err
        ? callback(err)
        : callback(undefined, gtins));
}

/**
 * Retrieves all the suppliers from the provided directory manager
 * @param {DirectoryManager} directoryManager
 * @param {function(err, string[])} callback
 * @memberOf PopOver
 */
function getDirectorySuppliers(directoryManager, callback){
    const options = {
        query: [`role like /${ROLE.MAH}|${ROLE.WHS}/g`]
    }

    directoryManager.getAll(false, options, (err, suppliers) => err
        ? callback(err)
        : callback(undefined, suppliers));
}

/**
 * Retrieves all the requesters from the provided directory manager
 * @param {DirectoryManager} directoryManager
 * @param {function(err, string[])} callback
 * @memberOf PopOver
 */
function getDirectoryRequesters(directoryManager, callback){
    const options = {
        query: [`role like /${ROLE.PHA}|${ROLE.WHS}/g`]
    }

    directoryManager.getAll(false, options, (err, requesters) => err
        ? callback(err)
        : callback(undefined, requesters));
}

function sortBatchesByExpiration(batches){
    return batches.sort((b1, b2) => {
        const date1 = new Date(b1.expiry).getTime();
        const date2 = new Date(b2.expiry).getTime();
        return date1 - date2;
    });
}

function splitStockByQuantity(batches, requiredQuantity){
    let accum = 0;
    const result = {
        selected: [],
        divided: undefined,
        remaining: []
    };
    batches.forEach(batch => {
        if (accum >= requiredQuantity){
            result.remaining.push(batch);
        } else if (accum + batch.quantity > requiredQuantity) {
            const batch1 = new Batch(batch);
            const batch2 = new Batch(batch);
            batch1.quantity = requiredQuantity - accum;
            batch2.quantity = batch.quantity - batch1.quantity;
            result.selected.push(batch1);
            result.divided = batch2
        } else if(accum + batch.quantity === requiredQuantity){
            result.selected.push(batch)
        } else {
            result.selected.push(batch);
        }
        accum += batch.quantity;
    });

    return result;
}

module.exports ={
    getRandom,
    generate2DMatrixCode,
    generateProductName,
    generateGtin,
    validateGtin,
    calculateGtinCheckSum,
    generateBatchNumber,
    generateRandomInt,
    genDate,
    confirmWithStock,
    getDirectorySuppliers,
    getDirectoryRequesters,
    getDirectoryProducts,
    sortBatchesByExpiration,
    splitStockByQuantity,
    isEqual
}