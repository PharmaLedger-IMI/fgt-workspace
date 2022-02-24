const ShipmentLineStatus = require('../model/ShipmentLineStatus');

/**
 * @param {string} requesterId
 * @param {string || string[]} partnersId
 * @param {StockManager} stockManager
 * @param {ShipmentLineManager} shipmentLineManager
 * @param {ReceiptManager} receiptManager
 * @function TraceabilityService
 * @memberOf Services
 */
function StockManagementService(requesterId, partnersId, stockManager, shipmentLineManager, receiptManager) {

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
     * @param {function(err, {})} _callback
     */
    const getStockFromPartners = (query, _callback) => {
        shipmentLineManager.getAll(true, {query, sort: 'dsc'}, (err, shipmentLines) => {
            if (err)
                return _callback(err)
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
            _callback(undefined, partnersStock)
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
                return callback(err)
            const {batches, ...stockInfo} = stock;
            let batchStock = {batchNumber: undefined}
            if (batch)
                batchStock = batches.find((_batch) => batch && _batch.batchNumber === batch);

            getStockFromPartners(query, (err, partnersStock) => {
                if (err)
                    return callback(err)

                partnersId = Array.isArray(partnersId) ? partnersId : (partnersId ? [partnersId] : [])
                if (partnersId.length > 0)
                    partnersStock = partnersId.reduce((accum, partnerId) => {
                        accum[partnerId] = partnersStock[partnerId];
                        return accum;
                    }, {});

                const addReceiptsToDispatched = (objAccum, objKeys, _callback) => {
                    const sellerId = objKeys.shift();
                    if (!sellerId)
                        return _callback(undefined, {...objAccum})
                    receiptManager.getAll(true, {query: [...query, `sellerId == ${sellerId}`], sort: 'dsc'}, (err, receipts) => {
                        if (err)
                            return _callback(err)
                        objAccum[sellerId] = removeFromStock(objAccum[sellerId], receipts.length);
                        addReceiptsToDispatched(objAccum, objKeys, _callback)
                    })
                }

                addReceiptsToDispatched({...partnersStock}, Object.keys(partnersStock), (err, result) => {
                    if (err)
                        return callback(err)
                    callback(undefined, {stock: stockInfo, batch: batchStock, partnersStock: result})
                })
            })
        })
    }
}

module.exports = StockManagementService;