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

    addSerialNumbers(serials){
        throw new Error("Not implemented");
    }
}

module.exports = Batch;
