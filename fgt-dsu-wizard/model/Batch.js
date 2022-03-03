const Utils = require("../../pdm-dsu-toolkit/model/Utils");
const BatchStatus = require('./BatchStatus');
const Status = require('./Status');
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
     * @param {Batch | {}} batch
     * @constructor
     */
    constructor(batch) {
        if (typeof batch !== undefined)
            for (let prop in batch)
                if(batch.hasOwnProperty(prop) && this.hasOwnProperty(prop))
                    this[prop] = batch[prop];

        if (!(this.expiry instanceof Date)) {
            if ((/^([0-9]{4})\/(0[1-9]|1[0-2])\/(0[1-9]|1[0-9]|2[0-9]|3[0-1])/.test(this.expiry))) { // check date format yyyy/MM/dd
                this.expiry = new Date(this.expiry.replace("/","-"));
            } else if (!(/^([0-9]{4})-(0[1-9]|1[0-2])-(0[1-9]|1[0-9]|2[0-9]|3[0-1])/.test(this.expiry))) // check date format yyyy-MM-dd
                this.expiry = '';
            else
                this.expiry = new Date(this.expiry);
        }

        if (!this.batchNumber)
            this.batchNumber = Utils.generateSerialNumber(6);

        if (this.serialNumbers && this.serialNumbers.length)
            if (Math.abs(this.quantity) !== this.serialNumbers.length)
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

    /**
     * Validate if everything seems ok with the properties of this object.
     * @param {string} [oldStatus] if oldStatus validation is available
     * @returns undefined if all ok. An array of errors if not all ok.
     */
    validate(oldStatus) {
        if (!this.batchNumber) {
            return 'Batch number is mandatory field';
        }
        if (!this.expiry || !(this.expiry instanceof Date)) {
            return  'Expiration date is null or a not valid format (yyyy-MM-dd)';
        }
        if(new Date().getTime() > this.expiry.getTime()) // expiry date must be greater than today
            return `Expiration date must be greater than ${(new Date()).toLocaleDateString("fr-CA")}`;
        if(this.serialNumbers.length > 0) {
            const serialNumbersQty = new Set(this.serialNumbers.map(n => `${n}`)).size;
            if (serialNumbersQty !== this.serialNumbers.length)
                return `Serial numbers must be unique and without duplicates`
        }

        if (oldStatus && Batch.getAllowedStatusUpdates(oldStatus).indexOf(this.batchStatus.status || this.batchStatus) === -1)
            return `Status update from ${oldStatus} to ${this.batchStatus.status || this.batchStatus} is not allowed`;

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

    static getAllowedStatusUpdates(status){
        switch(status){
            case BatchStatus.COMMISSIONED:
                return [BatchStatus.QUARANTINED, BatchStatus.RECALL];
            case BatchStatus.QUARANTINED:
                return [BatchStatus.COMMISSIONED, BatchStatus.RECALL];
            default:
                return [];
        }
    }
}

module.exports = Batch;
