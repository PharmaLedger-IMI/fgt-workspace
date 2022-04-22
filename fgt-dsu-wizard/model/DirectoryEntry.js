
const Utils = require("../../pdm-dsu-toolkit/model/Utils");

/**
 * Role Enum
 * Defines tha various roles withing the directory (basically actor types and products)
 * @memberOf Model
 */
const ROLE = {
    MAH: 'mah',
    WHS: 'whs',
    PHA: 'pha',
    PRODUCT: 'product'
}

/**
 * @prop {string} batchNumber
 * @prop {Date} expiryDate
 * @class DirectoryEntry
 * @memberOf Model
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
                if (entry.hasOwnProperty(prop) && this.hasOwnProperty(prop))
                    this[prop] = entry[prop];
    }

    validate() {
        if (!this.id) {
            return 'Id is mandatory field';
        }
        if (!this.role) {
            return 'Role is mandatory field';
        }
        if (Object.values(ROLE).indexOf(this.role) === -1) {
            return `Invalid role provided. Available values are: ${Object.values(ROLE)}`;
        }
    }
}

module.exports = {
    DirectoryEntry,
    ROLE
};
