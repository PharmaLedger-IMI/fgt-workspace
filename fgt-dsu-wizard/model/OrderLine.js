/**
 * @class OrderLine
 * @memberOf Model
 */
class OrderLine{
    gtin;
    quantity;
    requesterId;
    senderId;
    status;

    /**
     * @param gtin
     * @param quantity
     * @param requesterId
     * @param senderId
     * @param status
     * @constructor
     */
    constructor(gtin, quantity, requesterId, senderId, status){
        this.gtin = gtin;
        this.quantity = quantity;
        this.requesterId = requesterId;
        this.senderId = senderId;
        this.status = status;
    }

    /**
     * Validate if everything seems ok with the properties of this object.
     * @returns undefined if all ok. An arry of errors if not all ok.
     */
    validate() {
        const errors = [];
        if (!this.gtin) {
            errors.push('gtin is required.');
        }
        if (!this.quantity) {
            errors.push('quantity is required.');
        } else if (this.quantity < 0) { // TODO accept zero quantity ?
            errors.push('quantity cannot be negative.');
        }
        if (!this.requesterId) {
            errors.push('requesterId is required.');
        }
        if (!this.senderId) {
            errors.push('senderId is required.');
        }

        return errors.length === 0 ? undefined : errors;
    }
}

module.exports = OrderLine;
