class Order{
    orderId;
    requesterId;
    senderId;
    shipToAddress;
    status;
    items;

    constructor(orderId, requesterId, senderId, shipToAddress) {
        this.orderId = orderId;
        this.requesterId = requesterId;
        this.senderId = senderId;
        this.shipToAddress = shipToAddress;
        this.status = "created";
        this.items = [];
    }
}

module.exports = Order;
