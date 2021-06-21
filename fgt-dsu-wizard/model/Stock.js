const Product = require('./Product');
const Batch = require('./Batch');
const StockStatus = require('./StockStatus');

/**
 * @class Stock
 * @extends Product
 * @memberOf Model
 */
class Stock extends Product{
    batches = [];
    status = undefined;

    /**
     *
     * @param stock
     * @constructor
     */
    constructor(stock) {
        super(stock)
        if (typeof stock !== undefined)
            for (let prop in stock)
                if (stock.hasOwnProperty(prop))
                    this[prop] = stock[prop];
        this.status = this.status || StockStatus.AVAILABLE;
        this.batches = this.batches.map(b => new Batch(b));
    }

    getQuantity(){
        return this.batches.reduce((sum, b) => sum + b.getQuantity(), 0);
    }

    /**
     * Validate if everything seems ok with the properties of this object.
     * @returns undefined if all ok. An array of errors if not all ok.
     */
    validate() {
        return super.validate();
    }
}

module.exports = Stock;