/**
 * @module fgt-dsu-wizard.model
 */
const Participant = require('./Participant');

class Wholesaler extends Participant{
    originAddress = "";
    deliveryAddress = "";

    constructor(wholesaler) {
        super(wholesaler);
        if (typeof wholesaler !== undefined)
            for (let prop in wholesaler)
                if (wholesaler.hasOwnProperty(prop))
                    this[prop] = wholesaler[prop];
    }
}

module.exports = Wholesaler;