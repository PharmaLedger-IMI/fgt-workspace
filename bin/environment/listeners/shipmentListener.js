const Order = require('../../../fgt-dsu-wizard/model/Order');
const OrderStatus = require('../../../fgt-dsu-wizard/model/OrderStatus');
const ShipmentStatus = require('../../../fgt-dsu-wizard/model/ShipmentStatus');
const submitEvent = require('./eventHandler');
const {fulFillOrder} = require('./orderListener');

const orderStatusUpdater = function(participantManager, order, timeout, callback){
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
                return orderStatusUpdater(participantManager, updatedOrder, timeout, callback);
            findOrderToFulfill(participantManager, updatedOrder, timeout, callback);
        });
    }, timeout);
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

function shipmentListener(participantManager, timeout = 1000){
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

                orderStatusUpdater(participantManager, order, timeout, callback);
            });
        });
    }
}

module.exports = {
    shipmentListener: shipmentListener
};