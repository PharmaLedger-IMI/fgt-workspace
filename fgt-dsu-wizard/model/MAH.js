const Participant = require('./Participant');

/**
 *
 * @class MAH
 * @extends Participant
 * @memberOf Model
 */
class MAH extends Participant{
    /**
     * @param {MAH} mah
     * @constructor
     */
    constructor(mah) {
        super(mah);
        if (typeof mah !== undefined)
            for (let prop in mah)
                if (mah.hasOwnProperty(prop))
                    this[prop] = mah[prop];
    }
}

module.exports = MAH;