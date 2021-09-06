const Order = require('../../../fgt-dsu-wizard/model/Order');
const Sale = require('../../../fgt-dsu-wizard/model/Sale');
const IndividualProduct = require('../../../fgt-dsu-wizard/model/IndividualProduct');
const OrderStatus = require('../../../fgt-dsu-wizard/model/OrderStatus');
const ShipmentStatus = require('../../../fgt-dsu-wizard/model/ShipmentStatus');
const submitEvent = require('./eventHandler');
const {fulFillOrder} = require('./orderListener');

const orderStatusUpdater = function(participantManager, order, batches, timeout, callback){
    const identity = participantManager.getIdentity();
    const possibleStatus = Order.getAllowedStatusUpdates(order.status).filter(os => os !== OrderStatus.REJECTED);
    if (!possibleStatus || !possibleStatus.length){
        console.log(`${identity.id} - Order ${order.orderId} has no possible status updates`);
        return callback();
    }

    const issuedOrderManager = participantManager.getManager("IssuedOrderManager");

    if (possibleStatus.length > 1)
        return callback(`More that one status allowed...`);
    console.log(`${identity.id} - Updating Order ${order.orderId}'s status to ${possibleStatus[0]} in ${timeout} miliseconds`);
    setTimeout(() => {
        order.status = possibleStatus[0];
        submitEvent();
        issuedOrderManager.update(order, (err, updatedOrder) => {
            if (err)
                return callback(err);
            console.log(`${identity.id} - Order ${updatedOrder.orderId}'s updated to ${updatedOrder.status}`);
            submitEvent();
            if (updatedOrder.status !== OrderStatus.CONFIRMED)
                return orderStatusUpdater(participantManager, updatedOrder, batches, timeout, callback);
            if (!identity.id.startsWith('PHA'))
                return findOrderToFulfill(participantManager, updatedOrder, timeout, callback);
            issueSale(participantManager, order, batches, timeout, callback);
        });
    }, timeout);
}

const issueSale = function(participantManager, order, batches, timeout, callback){
    const saleManager = participantManager.getManager("SaleManager");
    const identity = saleManager.getIdentity();

    const stockManager = participantManager.getManager("StockManager");

    stockManager.getAll({
        query: [`gtin like /${order.orderLines.map(ol => ol.gtin).join('|')}/g`]
    }, (err, stocks) => {
        if (err)
            return callback(err);

        const sale = new Sale({
            id: Date.now(),
            sellerId: identity.id,
            productList: stocks.map(stock => {
                const batch = stock.batches[0];
                if (!batch)
                    return callback(`No batch in stock`);
                const dsuBatch = batches[stock.gtin].find(b => b.batchNumber === batch.batchNumber);
                if (!dsuBatch)
                    return callback("can not find serial for batch");
                const serialNumber = dsuBatch.serialNumbers[0];
                return new IndividualProduct({
                    name: stock.name,
                    gtin: stock.gtin,
                    batchNumber: batch.batchNumber,
                    manufName: stock.manufName,
                    expiry: batch.expiry,
                    status: batch.status,
                    serialNumber: serialNumber
                });
            })
        });

        submitEvent()

        setTimeout(() => {
            submitEvent();
            saleManager.create(sale, (err) => {
                if (err)
                    return callback(err);
                console.log(`New Sale issued:`, sale);
                submitEvent();
                callback(undefined, sale);
            });
        }, timeout);
    });
}

const findOrderToFulfill = function(participantManager, receivedOrder, timeout, callback){
    const identity = participantManager.getIdentity();
    const receivedOrderManager = participantManager.getManager("ReceivedOrderManager");
    const stockManager = participantManager.getManager('StockManager');
    submitEvent()
    receivedOrderManager.getAll(true, (err, orders) => {
        if (err)
            return callback(err);
        stockManager.getAll(true, (err, stocks) => {
            if (err)
                return callback(err);

            const order = orders.find((order) => {
                return order.orderLines.every(ol => {
                    const stock = stocks.find(s => s.gtin === ol.gtin);
                    return stock && stock.getQuantity() >= ol.quantity;
                });
            });

            if (!order){
                console.log(`${identity.id} - Could not find an order to fullfill after receiving`, receivedOrder);
                return callback();
            }

            console.log(`${identity.id} - Found and order that needs Fulfilling that matches the one that just arrived:`, order, receivedOrder);
            setTimeout(() => {
                fulFillOrder(participantManager, order, undefined, timeout, false, callback);
            }, timeout);

        });
    });

}

const matchIssuedToReceivedOrder = function(participantManager, order, timeout, callback){
    const identity = participantManager.getIdentity();
    const receivedOrderManager = participantManager.getManager("ReceivedOrderManager");
    submitEvent()
    receivedOrderManager.getAll(true, (err, orders) => {
        if (err)
            return callback(err);
        const quantityByGtin = order.orderLines.reduce((accum, ol) => {
            accum[ol.gtin] = ol.quantity;
            return accum;}, {})
        const matching = orders.find(ol => {
            return ol.orderLines.every(ol => ol.gtin in quantityByGtin && quantityByGtin[ol.gtin] === ol.quantity);
        });
        if (!matching){
            console.log(`${identity.id} - Could not find a matching received order to fulfill. No matter. must be an end point`);
            return callback();
        }

        console.log(`${identity.id} - Found and order that needs Fulfilling that matches the one that just arrived:`, matching, order);
        setTimeout(() => {
            fulFillOrder(participantManager, matching, undefined, timeout, false, callback);
        }, timeout);
    });
}

function shipmentListener(participantManager, batches, timeout = 1000){
    return function(message, callback){
        const receivedShipmentManager = participantManager.getManager("ReceivedShipmentManager");
        const identity = receivedShipmentManager.getIdentity();
        receivedShipmentManager._getDSUInfo(message.message, (err, receivedShipment) => {
            if (err)
                return callback(err);

            if (receivedShipment.status !== ShipmentStatus.DELIVERED){
                console.log(`${identity.id} - Skipping already handled Shipment ${receivedShipment.shipmentId} from ${receivedShipment.senderId}`);
                return callback(undefined, message);
            }

            const issuedOrderManager = participantManager.getManager("IssuedOrderManager");

            issuedOrderManager._getDSUInfo(receivedShipment.orderSSI, (err, order) => {
                if (err)
                    return callback(err);

                orderStatusUpdater(participantManager, order, batches, timeout, callback);
            });
        });
    }
}

module.exports = {
    shipmentListener: shipmentListener
};