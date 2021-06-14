
const Utils = require("../../pdm-dsu-toolkit/model/Utils");

/**
 * Role Enum
 * @module Model
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
 * @module Model
 */
class DirectoryEntry {
    id;
    role;

    /**
     * @param {DirectoryEntry} entry
     * @constructor
     */
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
