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

        if (this.productList)
            this.productList = this.productList.map(p => new IndividualProduct(p));
    }

    validate(isSingle = false) {
        if (!this.id)
            return "missing id";
        if (!this.productList || !this.productList.length)
            return 'No products';
        if (isSingle && !this.getSingleManufName())
            return "All product must belong to the same manufacturer";
    }

    getSingleManufName(){
        const manufs = new Set(this.productList.map(p => p.manufName));
        if (manufs.size !== 1)
            return;
        return [...manufs][0];
    }
}

module.exports = Sale;
