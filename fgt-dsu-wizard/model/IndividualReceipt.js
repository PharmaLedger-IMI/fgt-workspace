const IndividualProduct = require('./IndividualProduct');

/**
 * @class IndividualProduct
 * @memberOf Model
 */
class IndividualReceipt extends IndividualProduct{

    sellerId;

    /**
     *
     * @param {IndividualReceipt | {any}} individualReceipt
     * @constructor
     */
    constructor(individualReceipt) {
       super(individualReceipt);
        if (typeof individualReceipt !== undefined)
            for (let prop in individualReceipt)
                if (individualReceipt.hasOwnProperty(prop) && this.hasOwnProperty(prop))
                    this[prop] = individualReceipt[prop];
    }
}

module.exports = IndividualReceipt;