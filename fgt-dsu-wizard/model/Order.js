class Order{
    orderId;
    requesterId;
    senderId;
    shipToAddress;
    status;
    orderLines;

    constructor(orderId, requesterId, senderId, shipToAddress) {
        this.orderId = orderId;
        this.requesterId = requesterId;
        this.senderId = senderId;
        this.shipToAddress = shipToAddress;
        this.status = "created";
        this.orderLines = [];
    }
}

module.exports = Order;
