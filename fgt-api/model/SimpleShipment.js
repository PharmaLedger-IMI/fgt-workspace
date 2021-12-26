const Shipment = require("../../fgt-dsu-wizard/model/Shipment");
const ShipmentLine = require('../../fgt-dsu-wizard/model/ShipmentLine');

/**
 * @class SimpleShipment
 * @memberOf Model
 */
class SimpleShipment {
    shipmentId;
    orderId;
    requesterId;
    senderId;
    status;
    shipmentLines;

    constructor(simpleShipment){
        if (typeof simpleShipment !== undefined)
            for (let prop in simpleShipment)
                if (simpleShipment.hasOwnProperty(prop) && this.hasOwnProperty(prop))
                    this[prop] = simpleShipment[prop];

        this.shipmentId = simpleShipment.shipmentId ? simpleShipment.shipmentId : Date.now();
        this.shipmentLines = this.shipmentLines ? this.shipmentLines.map(sl => {
            sl.requesterId = simpleShipment.requesterId;
            sl.senderId = simpleShipment.senderId;
            return new ShipmentLine(sl)
        }) : undefined;
    }

    validate(oldStatus){
        const errors = [];
        if (!this.orderId)
            errors.push(`orderId is mandatory`);
        if (!this.requesterId)
            errors.push(`RequesterId is mandatory`);
        if (!this.senderId)
            errors.push(`SenderId is mandatory`);
        if (!this.status)
            errors.push(`Status is mandatory`);

        if (!this.shipmentLines || !this.shipmentLines.length) {
            errors.push(`shipmentLines is mandatory`);
        } else {
            this.shipmentLines.forEach((shipmentLine, shipmentLineIndex) => {
                let shipmentLinesError = shipmentLine.validate();
                if (shipmentLinesError) {
                    shipmentLinesError.forEach((error) => {
                        errors.push("Shipment Line "+shipmentLineIndex+": "+error);
                    });
                }
            });
        }

        if (oldStatus && Shipment.getAllowedStatusUpdates(oldStatus).indexOf(this.status.status || this.status) === -1)
            errors.push(`Status update from ${oldStatus} to ${this.status.status || this.status} is not allowed`);
        return errors ? errors.join("\n") : undefined;
    }
}

module.exports = SimpleShipment;