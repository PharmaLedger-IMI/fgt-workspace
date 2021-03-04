/**
 * @module fgt-dsu-wizard.model
 */
class Shipment {
    shipmentId;
    requesterId;
    senderId;
    shipToAddress;
    status;

    constructor(shipmentId, requesterId, senderId, shipToAddress, status){
        this.shipmentId = shipmentId;
        this.requesterId = requesterId;
        this.senderId = senderId;
        this.shipToAddress = shipToAddress;
        this.status = status || "created";
    }
}

module.exports = Shipment;
