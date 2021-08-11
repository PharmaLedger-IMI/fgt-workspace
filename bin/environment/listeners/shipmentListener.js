const {IssuedOrderManager, ReceivedShipmentManager} = require('../../../fgt-dsu-wizard/managers');
const Order = require('../../../fgt-dsu-wizard/model/Order');
const OrderStatus = require('../../../fgt-dsu-wizard/model/OrderStatus');
const ShipmentStatus = require('../../../fgt-dsu-wizard/model/ShipmentStatus');


const orderStatusUpdater = function(issuedOrderManager, order, timeout, callback){
    const identity = issuedOrderManager.getIdentity();
    const possibleStatus = Order.getAllowedStatusUpdates(order.status).filter(os => os !== OrderStatus.REJECTED);
    if (!possibleStatus || !possibleStatus.length){
        console.log(`${identity.id} - Order ${order.orderId} has no possible status updates`);
        return callback();
    }

    if (possibleStatus.length > 1)
        return callback(`More that one status allowed...`);
    console.log(`${identity.id} - Updating Order ${order.orderId}'s status to ${possibleStatus[0]} in ${timeout} miliseconds`);
    setTimeout(() => {
        order.status = possibleStatus[0];
        issuedOrderManager.update(order, (err, updatedOrder) => {
            if (err)
                return callback(err);
            console.log(`${identity.id} - Order ${updatedOrder.orderId}'s updated to ${updatedOrder.status}`);
            orderStatusUpdater(issuedOrderManager, updatedOrder, timeout, callback);
        });
    }, timeout)
}

function receivedShipmentListener(participantManager, timeout = 1000){
    return function(message, callback){
        const receivedShipmentManager = participantManager.getManager("ReceivedShipmentManager");
        const identity = receivedShipmentManager.getIdentity();
        receivedShipmentManager._getDSUInfo(message, (err, receivedShipment) => {
            if (err)
                return callback(err);

            if (receivedShipment.status !== ShipmentStatus.DELIVERED){
                console.log(`${identity.id} - Skipping already handled Shipment ${receivedShipment.shipmentId} from ${receivedShipment.senderId}`);
                return callback();
            }

            const issuedOrderManager = participantManager.getManager("IssuedOrderManager");

            issuedOrderManager._getDSUInfo(receivedShipment.orderSSI, (err, order) => {
                if (err)
                    return callback(err);

                orderStatusUpdater(issuedOrderManager, order, timeout, callback);
            });
        });
    }
}

module.exports = receivedShipmentListener;