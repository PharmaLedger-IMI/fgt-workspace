import Utils from "./Utils.js";

export default class Package {
    batch;
    serialNumber;

    constructor(product) {
        if (typeof product !== undefined) {
            for (let prop in product) {
                this[prop] = product[prop];
            }
        }
        this.serialNumber = Utils.generateNumericID(12);
    }

    validate() {
        const errors = [];

        if (!this.batch) {
            errors.push('Batch is required.');
        }

        return errors.length === 0 ? true : errors;
    }
}