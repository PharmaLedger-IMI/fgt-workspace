const Sale = require('./Sale');

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
    }
}

module.exports = Receipt;
