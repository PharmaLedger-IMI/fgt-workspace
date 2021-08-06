const Sale = require('./Sale');
const IndividualReceipt = require('./IndividualReceipt');

/**
 * @class Receipt
 * @memberOf Model
 */
class Receipt extends Sale{
    /**
     * @param {Receipt | {}} receipt
     * @constructor
     */
    constructor(receipt) {
        super(receipt);

        if (this.productList)
            this.productList = this.productList.map(p => new IndividualReceipt(p));
    }
}

module.exports = Receipt;
