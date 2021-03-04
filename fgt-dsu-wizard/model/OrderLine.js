/**
 * @module fgt-dsu-wizard.model
 */
class OrderLine{
    gtin;
    quantity;
    requesterId;
    senderId;

    constructor(gtin, quantity, requesterId, senderId){
        this.gtin = gtin;
        this.quantity = quantity;
        this.requesterId = requesterId;
        this.senderId = senderId;
    }
}

module.exports = OrderLine;
