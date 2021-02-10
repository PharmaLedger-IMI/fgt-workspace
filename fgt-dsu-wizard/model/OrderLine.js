class OrderLine{
    gtin;
    quantity;
    requesterId

    constructor(gtin, quantity, requesterId){
        this.gtin = gtin;
        this.quantity = quantity;
        this.requesterId = requesterId;
    }
}

module.exports = OrderLine;
