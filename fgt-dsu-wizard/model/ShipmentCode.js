/**
 * This is a particular Model class, where all its properties represent
 * the mount parts in the dsu where the property value
 * (the keySSI) will be mounted
 *
 * @class ShipmentCode
 * @module Model
 */
const TrackingCode = require("./TrackingCode");

class ShipmentCode extends TrackingCode {
    /**
     * the {@link ShipmentStatus}
     * Only the outer ShipmentCode has Status
     * @type {string | undefined}
     */
    status;

    /**
     *
     * @param shipmentCode
     * @constructor
     */
    constructor(shipmentCode) {
        super(shipmentCode);
        if (typeof shipmentCode !== undefined)
            for (let prop in shipmentCode)
                if (shipmentCode.hasOwnProperty(prop))
                    this[prop] = shipmentCode[prop];
    }

    /**
     * Validate if everything seems ok with the properties of this object.
     * @returns undefined if all ok. An array of errors if not all ok.
     */
    validate() {
        const errors = super.validate() || [];
        if (!this.status)
            errors.push('no status provided');

        return errors.length === 0 ? undefined : errors;
    }
}

module.exports = ShipmentCode;
