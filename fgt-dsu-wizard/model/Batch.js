const Utils = require("../../pdm-dsu-toolkit/model/Utils");

/**
 * @prop {string} batchNumber
 * @prop {Date} expiryDate
 * @prop {string[]} serialNumbers
 * @prop {number} quantity
 * @prop {string} batchStatus
 * @class Batch
 * @module Model
 */
class Batch {
    batchNumber;
    expiry = "";
    serialNumbers = [];
    quantity = 0;
    batchStatus

    /**
     * @param {Batch} batch
     * @constructor
     */
    constructor(batch) {
        if (typeof batch !== undefined)
            for (let prop in batch)
                if (batch.hasOwnProperty(prop))
                    this[prop] = batch[prop];

        if (!this.batchNumber)
            this.batchNumber = Utils.generateSerialNumber(6);
    }

    manage(delta, serialization = true){
        if (Array.isArray(delta))
            this.serialNumbers.push(...delta);
        if (delta === 0)
            return;
        if (delta > 0 && this.serialNumbers.length)
            if (serialization) {
                this.serialNumbers.push(...Array.from(Array(10), (_) => Utils.generateSerialNumber(12)));
                this.quantity = this.getQuantity();
                return;
            }
        if (serialization)
            return this.serialNumbers.splice(0, Math.abs(delta));
        this.quantity += delta;
    }

    getQuantity(){
        return this.serialNumbers && this.serialNumbers.length
            ? this.serialNumbers.length
            : this.quantity;
    }

    generateViewModel() {
        return {label: this.batchNumber, value: this.batchNumber}
    }

    validate() {
        if (!this.batchNumber) {
            return 'Batch number is mandatory field';
        }
        if (!this.expiry) {
            return  'Expiration date is a mandatory field.';
        }
        return undefined;
    }

    /**
     * Generates the 2D Data Matrix code for a batch or a serial
     * @param gtin
     * @param [serialNumber]
     * @return {string}
     */
    generate2DMatrixCode(gtin, serialNumber){
        const formattedExpiry = new Date(this.expiry).toLocaleDateString("en-US", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit"
        }).split('/').reverse().join('');

        if (!serialNumber)
            return `(01)${gtin}(10)${this.batchNumber}(17)${formattedExpiry}`;
        return `(01)${gtin}(21)${serialNumber}(10)${this.batchNumber}(17)${formattedExpiry}`;
    }

    addSerialNumbers(serials){
        throw new Error("Not implemented");
    }
}

module.exports = Batch;
