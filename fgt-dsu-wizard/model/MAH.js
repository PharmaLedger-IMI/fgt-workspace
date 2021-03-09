/**
 * @module fgt-dsu-wizard.model
 */
const Participant = require('./Participant');

class MAH extends Participant{

    constructor(mah) {
        super(mah);
        if (typeof mah !== undefined)
            for (let prop in mah)
                if (mah.hasOwnProperty(prop))
                    this[prop] = mah[prop];
    }
}

module.exports = MAH;