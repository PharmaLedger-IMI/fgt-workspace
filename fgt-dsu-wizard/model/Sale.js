const IndividualProduct = require('./IndividualProduct');

/**
 * @prop {IndividualProducts[]} products
 * @class Sale
 * @memberOf Model
 */
class Sale {
    id = undefined;
    productList = [];

    /**
     * @param {Sale | {}} sale
     * @constructor
     */
    constructor(sale) {
        if (typeof sale !== undefined)
            for (let prop in sale)
                if (sale.hasOwnProperty(prop))
                    this[prop] = sale[prop];

        if (this.productList)
            this.productList = this.productList.map(p => new IndividualProduct(p));
    }

    validate() {
        if (!this.id)
            return "missing id";
        if (!this.productList || !this.productList.length)
            return 'No products';
    }
}

module.exports = Sale;
