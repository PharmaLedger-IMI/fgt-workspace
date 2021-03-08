/**
 * @module fgt-dsu-wizard.model
 */
class Product {
    name = "";
    gtin = "";
    description = "";
    manufName = "";

    constructor(product) {
        if (typeof product !== undefined)
            for (let prop in product)
                if (product.hasOwnProperty(prop))
                    this[prop] = product[prop];
    }

    /**
     * Validate if everything seems ok with the properties of this object.
     * @returns undefined if all ok. An arry of errors if not all ok.
     */
    validate() {
        const errors = [];
        if (!this.name) {
            errors.push('Name is required.');
        }

        if (!this.gtin) {
            errors.push('GTIN is required.');
        }

        return errors.length === 0 ? undefined : errors;
    }

    generateViewModel() {
        return {label: this.name, value: this.gtin}
    }
}

module.exports = Product;