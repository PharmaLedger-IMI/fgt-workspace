const Shipment = require("../../fgt-dsu-wizard/model/Shipment");
const ShipmentStatus = require("../../fgt-dsu-wizard/model/ShipmentStatus");
const ShipmentLine = require('../../fgt-dsu-wizard/model/ShipmentLine');

/**
 * @class SimpleShipment
 * @memberOf Model
 */
class SimpleShipment {
    shipmentId;
    /**
     * @deprecated
     */
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

        if (!this.shipmentId)
            this.shipmentId = Date.now() + `${Math.random()}`.substring(2, 9);

        if (!this.status)
            this.status = ShipmentStatus.CREATED;

        const self = this;
        this.shipmentLines = this.shipmentLines ? this.shipmentLines.map(sl => {
            sl.requesterId = self.requesterId;
            sl.senderId = self.senderId;
            sl.status = self.status.status || self.status;
            return new ShipmentLine(sl)
        }) : undefined;
    }

    validate(oldStatus){
        const errors = [];
        if (!this.shipmentId)
            errors.push(`shipmentId is mandatory`);
        if (this.shipmentId && typeof this.shipmentId !== 'string')
            errors.push(`shipmentId is not a string`);
        // if (!this.orderId)
        //     errors.push(`orderId is mandatory`);
        // if (typeof this.orderId !== 'string')
        //     errors.push(`orderId is not a string`);
        if (!this.requesterId)
            errors.push(`RequesterId is mandatory`);
        if (!this.senderId)
            errors.push(`SenderId is mandatory`);
        if (!this.status)
            errors.push(`Status is mandatory`);
        if (`${this.requesterId }` === `${this.senderId}`)
            errors.push(`requesterId cannot be the same as senderId`);

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
        return errors ? errors.join(", ") : undefined;
    }

    allowedRequesterStatusUpdate() {
        return [ShipmentStatus.RECEIVED, ShipmentStatus.CONFIRMED].includes(this.status.status);
    }
}

module.exports = SimpleShipment;