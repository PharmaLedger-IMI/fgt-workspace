/**
 * @module fgt-dsu-wizard.model
 */
class ShipmentLine{
    gtin;
    batch;
    quantity;
    senderId;
    requesterId;

    constructor(line) {
        if (typeof line !== undefined)
            for (let prop in line)
                if (line.hasOwnProperty(prop))
                    this[prop] = line[prop];
    }
}

module.exports = ShipmentLine;
