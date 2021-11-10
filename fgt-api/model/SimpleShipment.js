const ShipmentLine = require('../../fgt-dsu-wizard/model/ShipmentLine');

/**
 * @class SimpleShipment
 * @memberOf Model
 */
class SimpleShipment {
    id;
    requesterId;
    senderId;
    status;
    shipmentLines;

    constructor(simpleShipment){
        if (typeof simpleShipment !== undefined)
            for (let prop in simpleShipment)
                if (simpleShipment.hasOwnProperty(prop))
                    this[prop] = simpleShipment[prop];

        this.shipmentLines = this.shipmentLines ? this.shipmentLines.map(sl => new ShipmentLine(sl)) : undefined;
    }

    validate(){
        const errors = [];
        if (!this.id)
            errors.push(`Id is mandatory`);
        if (!this.requesterId)
            errors.push(`RequesterId is mandatory`);
        if (!this.senderId)
            errors.push(`SenderId is mandatory`);
        if (!this.senderId)
            errors.push(`SenderId is mandatory`);
        if (!this.status)
            errors.push(`Status is mandatory`);
        if (!this.shipmentLines || !this.shipmentLines.length)
            errors.push(`shipmentLines is mandatory`);
        return errors ? errors.join("\n") : undefined;
    }
}