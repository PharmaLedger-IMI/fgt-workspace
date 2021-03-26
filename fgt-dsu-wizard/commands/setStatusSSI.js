/**
 * @module fgt-dsu-wizard.commands
 */

/**
 * Defines how to create the keyssi for a orderLine dsu
 * @param {OrderStatus|ShipmentStatus} status. if status has the properties:
 * <ul>
 *     <li>(optional) {@link openDSU#constants#BRICKS_DOMAIN_KEY} - the subDomain to store the bricks in. Will be concatenated like 'domain.subDomain'</li>
 * </ul>
 * @param {string} domain the anchoring domain
 * @returns {SeedSSI} (template)
 */
function createStatusSSI(status, domain) {
    console.log("New OrderStatus_SSI in domain", domain);
    const openDSU = require('opendsu');
    const keyssiSpace = openDSU.loadApi("keyssi");
    let hint;
    if (status[openDSU.constants.BRICKS_DOMAIN_KEY]) {
        hint = {};
        hint[openDSU.constants.BRICKS_DOMAIN_KEY] = [domain, status[openDSU.constants.BRICKS_DOMAIN_KEY]].join('.');
    }
    return keyssiSpace.createTemplateSeedSSI(domain, status, undefined, 'v0', hint ? JSON.stringify(hint) : undefined);
}

/**
 * Registers the endpoint on the api-hub's dsu-wizard.
 * @param {HttpServer} server
 */
function command(server){
    const setSSI = require('../../pdm-dsu-toolkit/commands/setSSI');
    setSSI(server, "status", createStatusSSI, "setStatusSSI", "traceability");
}

module.exports = {
    command,
    createStatusSSI
};