const {getDomain, getBricksDomain, BRICKS_DOMAIN_KEY} = require("./environment");
/**
 * Defines how to create the keyssi for a orderLine dsu
 * @param {OrderStatus|ShipmentStatus} status. if status has the properties:
 * <ul>
 *     <li>(optional) {@link openDSU#constants#BRICKS_DOMAIN_KEY} - the subDomain to store the bricks in. Will be concatenated like 'domain.subDomain'</li>
 * </ul>
 * @param {string} domain the anchoring domain
 * @memberOf Commands
 */
function createStatusSSI(status, domain) {
    domain = getDomain(domain)
    console.log("New Status_SSI in domain", domain);
    const openDSU = require('opendsu');
    const keyssiSpace = openDSU.loadApi("keyssi");
    let hint;
    const bricksDomain = getBricksDomain();
    if (bricksDomain){
        hint = {}
        hint[BRICKS_DOMAIN_KEY] = bricksDomain
    }
    return keyssiSpace.createTemplateSeedSSI(domain, status, undefined, 'v0', hint ? JSON.stringify(hint) : undefined);
}

/**
 * Registers the endpoint on the api-hub's dsu-wizard.
 * @memberOf Server
 */
function command(server){
    const setSSI = require('../../pdm-dsu-toolkit/commands/setSSI');
    setSSI(server, "status", createStatusSSI, "setStatusSSI", getDomain("traceability"));
}

module.exports = {
    command,
    createStatusSSI
};