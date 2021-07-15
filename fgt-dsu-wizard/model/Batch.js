const Utils = require("../../pdm-dsu-toolkit/model/Utils");
const BatchStatus = require('./BatchStatus');
const IndividualProduct = require('./IndividualProduct');

/**
 * @prop {string} batchNumber
 * @prop {Date} expiryDate
 * @prop {string[]} serialNumbers
 * @prop {number} quantity
 * @prop {string} batchStatus {@link BatchStatus}
 * @class Batch
 * @memberOf Model
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

        if (this.expiry && typeof this.expiry === 'string')
            this.expiry = new Date(this.expiry);

        if (!this.batchNumber)
            this.batchNumber = Utils.generateSerialNumber(6);

        if (this.serialNumbers && this.serialNumbers.length)
            if (this.quantity !== this.serialNumbers.length)
                this.quantity = this.serialNumbers.length;

        this.batchStatus = this.batchStatus || BatchStatus.COMMISSIONED;
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

    getIndividualProduct(gtin, serial){
        const s = this.serialNumbers.find(s => {
            return (typeof s === 'string' && s === serial) || (typeof s === 'object' && s.serialNumber === serial)
        });

        return !s ? undefined : new IndividualProduct(typeof s === 'object' ? s : {
                gtin: gtin,
                batchNumber: this.batchNumber,
                serialNumber: s,
                status: this.batchStatus
            });
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
        return Utils.generate2DMatrixCode(gtin, this.batchNumber, this.expiry, serialNumber);
    }

    addSerialNumbers(serials){
        throw new Error("Not implemented");
    }
}

module.exports = Batch;
