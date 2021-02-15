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
        this.status = status || "created";
        this.orderLines = orderLines || [];
    }
}

module.exports = Order;
