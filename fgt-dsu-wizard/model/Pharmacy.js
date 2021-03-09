/**
 * @module fgt-dsu-wizard.model
 */
const Actor = require('./Participant');

class Pharmacy extends Actor{
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