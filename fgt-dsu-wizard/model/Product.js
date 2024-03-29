const ModelUtils = require('../model/utils');

/**
 * @class Product
 * @memberOf Model
 */
class Product {
    name = "";
    gtin = "";
    description = "";
    manufName = "";

    /**
     *
     * @param product
     * @constructor
     */
    constructor(product) {
        if (typeof product !== undefined)
            for (let prop in product)
                if (product.hasOwnProperty(prop) && this.hasOwnProperty(prop))
                    this[prop] = product[prop];
    }

    /**
     * Validate if everything seems ok with the properties of this object.
     * @returns undefined if all ok. An array of errors if not all ok.
     */
    validate() {
        const errors = [];
        if (!this.name) {
            errors.push('Name is required.');
        }

        if (!this.gtin) {
            errors.push('GTIN is required.');
        }

        if (!ModelUtils.validateGtin(this.gtin))
            errors.push('Gtin is invalid');

        return errors.length === 0 ? undefined : errors;
    }
}

module.exports = Product;