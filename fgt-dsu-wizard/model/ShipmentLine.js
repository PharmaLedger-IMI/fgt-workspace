/**
 * @class ShipmentLine
 * @module Model
 */
class ShipmentLine{
    gtin;
    batch;
    quantity;
    senderId;
    requesterId;
    status;

    /**
     *
     * @param line
     * @constructor
     */
    constructor(line) {
        if (typeof line !== undefined)
            for (let prop in line)
                if (line.hasOwnProperty(prop))
                    this[prop] = line[prop];
    }

    /**
     * Validate if everything seems ok with the properties of this object.
     * @returns undefined if all ok. An array of errors if not all ok.
     */
    validate() {
        const errors = [];
        if (!this.gtin)
            errors.push('gtin is required.');

        if (!this.requesterId)
            errors.push('Ordering partner ID is required.');

        if (!this.senderId)
            errors.push('Supplying partner ID is required.');

        if (!this.batch)
            errors.push('batch is required.');

        if (!this.status)
            errors.push('status is required.');

        return errors.length === 0 ? undefined : errors;
    }
}

module.exports = ShipmentLine;
