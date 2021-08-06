const IndividualProduct = require('./IndividualProduct');

/**
 * @class FinalProduct
 * @memberOf Model
 */
class IndividualReceipt extends IndividualProduct{

    /**
     *
     * @param {IndividualReceipt | {any}} individualReceipt
     * @constructor
     */
    constructor(individualReceipt) {
       super(individualReceipt);
    }
}

module.exports = IndividualReceipt;