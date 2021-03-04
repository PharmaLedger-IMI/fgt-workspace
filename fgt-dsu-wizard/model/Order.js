/**
 * @module fgt-dsu-wizard.model
 */
const OrderStatus = require('./OrderStatus');

class Order{
    orderId;
    requesterId;
    senderId;
    shipToAddress;
    status;
    orderLines;

    constructor(orderId, requesterId, senderId, shipToAddress, status, orderLines) {
        this.orderId = orderId;
        this.requesterId = requesterId;
        this.senderId = senderId;
        this.shipToAddress = shipToAddress;
        this.status = status || OrderStatus.CREATED;
        this.orderLines = orderLines || [];
    }
}

module.exports = Order;
