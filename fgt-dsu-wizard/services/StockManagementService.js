const ShipmentLineStatus = require('../model/ShipmentLineStatus');

/**
 * @param {string} requesterId
 * @param {StockManager} stockManager
 * @param {ShipmentLineManager} shipmentLineManager
 * @param {ReceiptManager} receiptManager
 * @function TraceabilityService
 * @memberOf Services
 */
function StockManagementService(requesterId, stockManager, shipmentLineManager, receiptManager) {

    const addToStock = (stock, addValue) => {
        stock = !!stock ? stock : {inStock: 0, dispatched: 0}
        return {
            inStock: stock.inStock + addValue,
            dispatched: stock.dispatched
        }
    }

    const removeFromStock = (stock, removeValue) => {
        stock = !!stock ? stock : {inStock: 0, dispatched: 0}
        return {
            inStock: stock.inStock - removeValue,
            dispatched: stock.dispatched + removeValue
        }
    }

    /**
     * Stock taking from ShipmentLines
     * @param query
     * @param callback
     */
    const getStockFromPartners = (query, callback) => {
        shipmentLineManager.getAll(true, {query, sort: 'dsc'}, (err, shipmentLines) => {
            if (err)
                callback(err)
            const partnersStock = shipmentLines.reduce((accum, currShipmentLine) => {
                const {requesterId, senderId, quantity} = currShipmentLine;
                /* considering only status == confirmed to add to the requester stock, else still on sender stock */
                if (currShipmentLine.status.status === ShipmentLineStatus.CONFIRMED) {
                    accum[requesterId] = addToStock(accum[requesterId], quantity)
                    accum[senderId] = removeFromStock(accum[senderId], quantity)
                } else {
                    accum[senderId] = addToStock(accum[senderId], quantity)
                }
                return accum;
            }, {});
            delete partnersStock[requesterId];
            callback(undefined, partnersStock)
        })
    }

    /**
     * Stock taking from ShipmentLines and Receipts
     * @param { string }gtin
     * @param {string }batch
     * @param { function(err, {results})} callback
     */
    this.traceStockManagement = function (gtin, batch, callback) {
        if (!callback) {
            callback = batch;
            batch = undefined;
        }

        let query = ['__timestamp > 0', `gtin == ${gtin}`];
        query = batch ? [...query, `batch == ${batch}`] : [...query];

        stockManager.getOne(gtin, true, (err, stock) => {
            if (err)
                callback(err)
            const {batches, ...stockInfo} = stock;
            let batchStock = {batchNumber: undefined}
            if (batch)
                batchStock = batches.find((_batch) => batch && _batch.batchNumber === batch);

            getStockFromPartners(query, (err, partnersStock) => {
                if (err)
                    callback(err)

                Object.keys(partnersStock).forEach((sellerId) => {
                    receiptManager.getAll(true, {query: [...query, `sellerId == ${sellerId}`], sort: 'dsc'}, (err, receipts) => {
                        if (err)
                            callback(err)
                        partnersStock[sellerId] = removeFromStock(partnersStock[sellerId], receipts.length);
                    })
                })
                callback(undefined, {stock: stockInfo, batch: batchStock, partnersStock})
            })
        })
    }
}

module.exports = StockManagementService;