const IndividualProduct = require('./IndividualProduct');

/**
 * @prop {IndividualProducts[]} products
 * @class Sale
 * @memberOf Model
 */
class Sale {
    id = undefined;
    sellerId = undefined;
    productList = [];

    /**
     * @param {Sale | {}} sale
     * @constructor
     */
    constructor(sale) {
        if (typeof sale !== undefined)
            for (let prop in sale)
                if (sale.hasOwnProperty(prop) && this.hasOwnProperty(prop))
                    this[prop] = sale[prop];

        if (!this.id)
            this.id = `${Date.now()}`;

        if (this.productList)
            this.productList = this.productList.map(p => new IndividualProduct(p));
    }

    validate(isSingle = false) {
        const errors = [];
        if (!this.id)
            errors.push("Missing id.");

        if (!this.productList || !this.productList.length) {
            errors.push('No products on productList.');
        } else {
            this.productList.forEach((individualProduct, index) => {
                let err = individualProduct.validate();
                if (err) {
                    errors.push(`Product ${index + 1} errors: [${err.join(' ')}].`);
                }
            });
        }

        if (isSingle && !this.getSingleManufName())
            errors.push("All product must belong to the same manufacturer.");
        return errors.join(' ');
    }

    getSingleManufName(){
        const manufs = new Set(this.productList.map(p => p.manufName));
        if (manufs.size !== 1)
            return;
        return [...manufs][0];
    }
}

module.exports = Sale;
