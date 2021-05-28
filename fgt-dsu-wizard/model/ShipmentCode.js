/**
 * @class ShipmentCode
 * @module fgt-dsu-wizard.model
 */
class ShipmentCode{
    /**
     * The {@link ShipmentStatus}
     */
    status;
    /**
     * The content
     * @type {{codes: string[] | undefined, lines: string[] | undefined}}
     */
    content = {
        /**
         * The reference (KeySSI) to the other {@link ShipmentCode}s inside
         * @type string[] | undefined
         */
        codes: [],
        /**
         * The reference (KeySSI) to the other {@link ShipmentLine}s inside
         * @type string[] | undefined
         */
        lines: []
    }
    /**
     * The reference (KeySSI) to the previous {@link ShipmentCode}
     * @type string | undefined
     */
    previous;
    /**
     * The reference (KeySSI) to the next {@link ShipmentCode}
     * @type string | undefined
     */
    next;

    constructor(line) {
        if (typeof line !== undefined)
            for (let prop in line)
                if (line.hasOwnProperty(prop))
                    this[prop] = line[prop];
    }

    /**
     * Validate if everything seems ok with the properties of this object.
     * @returns undefined if all ok. An array of errors if not all ok.
     */
    validate() {
        const errors = [];
        if (!this.content || ((!this.content.codes || !this.content.code.length) && (!this.content.lines || !this.content.lines.length)))
            errors.push('no content provided');

        if (!this.status)
            errors.push('status is required.');

        return errors.length === 0 ? undefined : errors;
    }
}

module.exports = ShipmentCode;
