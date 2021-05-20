/**
 * @module fgt-dsu-wizard.model
 */

const Utils = require("../../pdm-dsu-toolkit/model/Utils");

/**
 * @prop {string} batchNumber
 * @prop {Date} expiryDate
 * @prop {string[]} serialNumbers
 */
class Batch {
    batchNumber;
    expiry = "";
    serialNumbers = ["430239925150"];
    batchStatus

    constructor(batch) {
        if (typeof batch !== undefined)
            for (let prop in batch)
                if (batch.hasOwnProperty(prop))
                    this[prop] = batch[prop];

        if (!this.batchNumber)
            this.batchNumber = Utils.generateSerialNumber(6);
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
