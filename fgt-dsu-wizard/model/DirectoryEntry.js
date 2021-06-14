/**
 * @module fgt-dsu-wizard.model
 */

const Utils = require("../../pdm-dsu-toolkit/model/Utils");

/**
 * Role Enum
 * @module fgt-dsu-wizard.model
 */
const ROLE = {
    MAH: 'mah',
    WHS: 'whs',
    PHA: 'pha',
    FAC: 'fac',
    PRODUCT: 'product'
}

/**
 * @prop {string} batchNumber
 * @prop {Date} expiryDate
 * @class DirectoryEntry
 * @module fgt-dsu-wizard.model
 */
class DirectoryEntry {
    id;
    role;

    constructor(entry) {
        if (typeof entry !== undefined)
            for (let prop in entry)
                if (entry.hasOwnProperty(prop))
                    this[prop] = entry[prop];
    }
}

module.exports = {
    DirectoryEntry,
    ROLE
};
