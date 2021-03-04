/**
 * @module fgt-dsu-wizard.model
 */
class Product {
    name = "";
    gtin = "";
    description = "";
    manufName = " ";
    reportURL = `${window.top.location.origin}/default-report.html`;

    constructor(product) {
        if (typeof product !== undefined) {
            for (let prop in product) {
                if (product.hasOwnProperty(prop))
                    this[prop] = product[prop];
            }
        }

        if (this.gtin === "") {
            this.gtin = '05290931025615';
        }
    }

    validate() {
        const errors = [];
        if (!this.name) {
            errors.push('Name is required.');
        }

        if (!this.gtin) {
            errors.push('GTIN is required.');
        }

        return errors.length === 0 ? true : errors;
    }

    generateViewModel() {
        return {label: this.name, value: this.gtin}
    }
}

module.exports = Product;