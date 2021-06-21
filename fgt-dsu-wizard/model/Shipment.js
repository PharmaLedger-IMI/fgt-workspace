const ShipmentStatus = require('./ShipmentStatus');
const ShipmentLine = require('./ShipmentLine');

/**
 * @class Shipment
 * @memberOf Model
 */
class Shipment {
    shipmentId;
    requesterId;
    senderId;
    shipToAddress;
    shipFromAddress;
    status;
    shipmentLines;
    code;

    /**
     *
     * @param shipmentId
     * @param requesterId
     * @param senderId
     * @param shipToAddress
     * @param status
     * @param shipmentLines
     * @constructor
     */
    constructor(shipmentId, requesterId, senderId, shipToAddress, status, shipmentLines){
        this.shipmentId = shipmentId;
        this.requesterId = requesterId;
        this.senderId = senderId;
        this.shipToAddress = shipToAddress;
        this.status = status || ShipmentStatus.CREATED;
        this.shipmentLines = shipmentLines ? shipmentLines.map(sl => new ShipmentLine(sl)) : [];
    }

    /**
     * Validate if everything seems ok with the properties of this object.
     * @returns undefined if all ok. An arry of errors if not all ok.
     */
    validate() {
        const errors = [];
        if (!this.shipmentId) {
            errors.push('ShipmentID is required.');
        }
        if (!this.requesterId) {
            errors.push('Ordering partner ID is required.');
        }
        if (!this.senderId) {
            errors.push('Supplying partner ID is required.');
        }
        if (!this.shipToAddress) {
            errors.push('ShipToAddress is required.');
        }
        if (!this.status) {
            errors.push('status is required.');
        }
        if (!this.shipmentLines || !this.shipmentLines.length) {
            errors.push('shipmentLines is required.');
        } else {
            this.shipmentLines.forEach((shipmentLine, index) => {
                let orderLineErrors = shipmentLine.validate();
                if (orderLineErrors) {
                    orderLineErrors.forEach((error) => {
                        errors.push("Shipment Line " + index + ": " + error);
                    });
                }
            });
        }

        return errors.length === 0 ? undefined : errors;
    }
}

module.exports = Shipment;
