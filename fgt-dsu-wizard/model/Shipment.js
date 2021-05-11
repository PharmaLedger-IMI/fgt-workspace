const ShipmentStatus = require('./ShipmentStatus');

/**
 * @module fgt-dsu-wizard.model
 */
class Shipment {
    shipmentId;
    requesterId;
    senderId;
    shipToAddress;
    status;
    shipmentLines;

    constructor(shipmentId, requesterId, senderId, shipToAddress, status, shipmentLines){
        this.shipmentId = shipmentId;
        this.requesterId = requesterId;
        this.senderId = senderId;
        this.shipToAddress = shipToAddress;
        this.status = status || ShipmentStatus.CREATED;
        this.shipmentLines = shipmentLines || [];
    }
}

module.exports = Shipment;
