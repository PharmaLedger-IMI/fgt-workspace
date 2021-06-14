const Participant = require('./Participant');

/**
 * @class Wholesaler
 * @module Model
 */
class Wholesaler extends Participant{
    originAddress = "";
    deliveryAddress = "";

    /**
     *
     * @param wholesaler
     * @constructor
     */
    constructor(wholesaler) {
        super(wholesaler);
        if (typeof wholesaler !== undefined)
            for (let prop in wholesaler)
                if (wholesaler.hasOwnProperty(prop))
                    this[prop] = wholesaler[prop];
    }
}

module.exports = Wholesaler;