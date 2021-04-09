/**
 * @module fgt-dsu-wizard.model
 */
const Participant = require('./Participant');

class Pharmacy extends Participant{
    deliveryAddress = "";

    constructor(pharmacy) {
        super(pharmacy);
        if (typeof pharmacy !== undefined)
            for (let prop in pharmacy)
                if (pharmacy.hasOwnProperty(prop))
                    this[prop] = pharmacy[prop];
    }

}

module.exports = Pharmacy;