const {getBricksDomain, BRICKS_DOMAIN_KEY, getDomain} = require("./environment");

/**
 * Defines how to create the keyssi for a {@link ShipmentLine} dsu
 * @param {object} data necessary properties:
 * <ul>
 *     <li>data</li> the specific string
 *     <li>(optional) {@link openDSU#constants#BRICKS_DOMAIN_KEY} - the subDomain to store the bricks in. Will be concatenated like 'domain.subDomain'</li>
 * </ul>
 * @param {string} domain the anchoring domain
 * @memberOf Commands
 */
function createShipmentCodeSSI(data, domain) {
    domain = getDomain(domain);
    console.log("New SHIPMENTCODE_SSI in domain", domain);
    const openDSU = require('opendsu');
    const keyssiSpace = openDSU.loadApi("keyssi");
    let hint;
    const bricksDomain = getBricksDomain();
    if (bricksDomain){
        hint = {}
        hint[BRICKS_DOMAIN_KEY] = bricksDomain
    }
    return keyssiSpace.createTemplateSeedSSI(domain, data.data, 'v0', hint ? JSON.stringify(hint) : undefined);
}

/**
 * Registers the endpoint on the api-hub's dsu-wizard.
 * @memberOf Server
 */
function command(server){
    const setSSI = require('../../pdm-dsu-toolkit/commands/setSSI');
    setSSI(server, "shipmentcode", createShipmentCodeSSI, "setShipmentCodeSSI", getDomain("traceability"));
}

module.exports = {
    command,
    createShipmentCodeSSI
};
