/**
 * @module fgt-dsu-wizard.commands
 */

/**
 * Defines how to create the keyssi for an orderLines dsu
 * @param {object} data necessary properties:
 * <ul>
 *     <li>gtin - the gtin of the product</li>
 *     <li>(optional) {@link openDSU#constants#BRICKS_DOMAIN_KEY} - the subDomain to store the bricks in. Will be concatenated like 'domain.subDomain'</li>
 * </ul>
 * @param {string} domain the anchoring domain
 * @returns {ArraySSI}
 */
function createOrderLinesSSI(data, domain) {
    console.log("New ORDERLINES_SSI in domain", domain);
    const openDSU = require('opendsu');
    const keyssiSpace = openDSU.loadApi("keyssi");
    let hint;
    if (data[openDSU.constants.BRICKS_DOMAIN_KEY]) {
        hint = {};
        hint[openDSU.constants.BRICKS_DOMAIN_KEY] = [domain, data[openDSU.constants.BRICKS_DOMAIN_KEY]].join('.');
    }
    return keyssiSpace.createArraySSI(domain, [data.gtin, "ORDERLINES"], 'v0', hint ? JSON.stringify(hint) : undefined);
}

/**
 * Registers the endpoint on the api-hub's dsu-wizard.
 * @param {HttpServer} server
 */
function command(server){
    const setSSI = require('../../pdm-dsu-toolkit/commands/setSSI');
    setSSI(server, "orderlines", createOrderLinesSSI, "setOrderLinesSSI", "traceability");
}

module.exports = {
    command,
    createOrderLinesSSI
}
