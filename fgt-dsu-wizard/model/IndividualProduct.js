const IndividualProductStatus = require('./IndividualProductStatus');

/**
 * @class FinalProduct
 * @memberOf Model
 */
class IndividualProduct {
    name;
    gtin;
    batchNumber;
    serialNumber;
    manufName;
    expiry;
    status;

    /**
     *
     * @param {IndividualProduct | {any}} individualProduct
     * @constructor
     */
    constructor(individualProduct) {
        if (typeof individualProduct !== undefined)
            for (let prop in individualProduct)
                if (individualProduct.hasOwnProperty(prop) && this.hasOwnProperty(prop))
                    this[prop] = individualProduct[prop];

        if(typeof this.expiry === 'string'){

            this.expiry = new Date(this.expiry);

        }
        
        this.status = this.status || IndividualProductStatus.COMMISSIONED;
        
    }

    /**
     * Validate if everything seems ok with the properties of this object.
     * @param {string} [oldStatus] if oldStatus validation is available
     * @returns undefined if all ok. An arry of errors if not all ok.
     */
    validate(oldStatus) {
        const errors = [];
        if (!this.gtin)
            errors.push('GTIN is required.');

        if (!this.batchNumber)
            errors.push('Batch Number is required.');

        if (!this.serialNumber)
            errors.push('Serial Number is required.');

        if (!this.manufName)
            errors.push('Manufacturer Name is required');

        if (!this.status)
            errors.push('Serial Number is required.');

        if (oldStatus && IndividualProduct.getAllowedStatusUpdates(oldStatus).indexOf(this.status) === -1)
            errors.push(`Status update from ${oldStatus} to ${this.status} is not allowed`);

        return errors.length === 0 ? undefined : errors;
    }

    static getAllowedStatusUpdates(status){
        switch(status){
            case IndividualProductStatus.COMMISSIONED:
                return [IndividualProductStatus.ADMINISTERED, IndividualProductStatus.DESTROYED, IndividualProductStatus.DISPENSED, IndividualProductStatus.RECALL]
            default:
                return [];
        }
    }
}

module.exports = IndividualProduct;