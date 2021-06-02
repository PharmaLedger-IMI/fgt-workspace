/**
 * This is a particular Model class, where all its properties represent
 * the mount parts in the dsu where the property value
 * (the keySSI) will be mounted
 *
 * @class TrackingCode
 * @module fgt-dsu-wizard.model
 */
class TrackingCode{
    /**
     * The reference (KeySSI) to the other {@link TrackingCode}s inside
     * @type string[] | TrackingCode[] | undefined
     */
    codes;
    /**
     * The reference (KeySSI) to the other {@link ShipmentLine}s inside
     * @type string[] | ShipmentLine[] | undefined
     */
    lines;

    /**
     * For transformations later on
     * The reference (KeySSI) to the previous {@link TrackingCode}
     * @type string | undefined
     */
    previous;
    /**
     * For transformations later on
     * The reference (KeySSI) to the next {@link TrackingCode}
     * @type string | undefined
     */
    next;

    constructor(code) {
        if (typeof code !== undefined)
            for (let prop in code)
                if (code.hasOwnProperty(prop))
                    this[prop] = code[prop];
    }

    /**
     * Validate if everything seems ok with the properties of this object.
     * @returns undefined if all ok. An array of errors if not all ok.
     */
    validate() {
        const errors = [];
        if ((!this.codes || !this.codes.length) && (!this.lines || !this.lines.length))
            errors.push('no content provided');

        return errors.length === 0 ? undefined : errors;
    }
}

module.exports = TrackingCode;
