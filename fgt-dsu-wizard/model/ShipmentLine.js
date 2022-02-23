const ShipmentLineStatus = require('./ShipmentLineStatus');

/**
 * @class ShipmentLine
 * @memberOf Model
 */
class ShipmentLine{
    gtin;
    batch;
    quantity;
    serialNumbers;
    senderId;
    requesterId;
    status;
    createdOn

    /**
     *
     * @param line
     * @constructor
     */
    constructor(line) {
        if (typeof line !== undefined)
            for (let prop in line)
                if (line.hasOwnProperty(prop) && this.hasOwnProperty(prop))
                    this[prop] = line[prop];

        if (this.serialNumbers && this.serialNumbers.length)
            if (this.quantity !== this.serialNumbers.length)
                this.quantity = this.serialNumbers.length;

            if (!this.createdOn)
                this.createdOn = Date.now();
    }

    getQuantity(){
        return this.serialNumbers && this.serialNumbers.length
            ? this.serialNumbers.length
            : this.quantity;
    }

    /**
     * Validate if everything seems ok with the properties of this object.
     * @returns undefined if all ok. An array of errors if not all ok.
     */
    validate() {
        const errors = [];
        if (!this.gtin)
            errors.push('gtin is required.');

        if (!this.requesterId && [ShipmentLineStatus.DISPENSED, ShipmentLineStatus.ADMINISTERED].indexOf(this.status) === -1)
            errors.push('Ordering partner ID is required.');

        if (!this.senderId)
            errors.push('Supplying partner ID is required.');

        if (!this.batch)
            errors.push('batch is required.');

        if (!this.status)
            errors.push('status is required.');

        if(this.quantity <= 0 || !Number.isInteger(this.quantity))
            errors.push('quantity must be a integer positive number');

        return errors.length === 0 ? undefined : errors;
    }
}

module.exports = ShipmentLine;
