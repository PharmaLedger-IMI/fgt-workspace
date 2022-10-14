const {getDomain, getBricksDomain, BRICKS_DOMAIN_KEY} = require("./environment");


/**
 * Defines how to create the keyssi for a {@link Product} dsu
 * @param {object} data necessary properties:
 * <ul>
 *     <li>gtin - the gtin of the product</li>
 *     <li>(optional) {@link openDSU#constants#BRICKS_DOMAIN_KEY} - the subDomain to store the bricks in. Will be concatenated like 'domain.subDomain'</li>
 * </ul>
 * @param {string} domain the anchoring domain
 * @returns {ArraySSI}
 * @memberOf Commands
 */
function createIndividualProductSSI(data, domain) {
    domain = getDomain(domain)
    console.log("New Individual PRODUCT_SSI in domain", domain);
    const openDSU = require('opendsu');
    const keyssiSpace = openDSU.loadApi("keyssi");
    let hint;
    const bricksDomain = getBricksDomain();
    if (bricksDomain){
        hint = {}
        hint[BRICKS_DOMAIN_KEY] = bricksDomain
    }
    return keyssiSpace.createArraySSI(domain, [data.gtin, data.batchNumber, data.serialNumber], 'v0', hint ? JSON.stringify(hint) : undefined);
}

/**
 * Registers the endpoint on the api-hub's dsu-wizard.
 * @param {HttpServer} server
 * @memberOf Server
 */
function command(server){
    const setSSI = require('../../pdm-dsu-toolkit/commands/setSSI');
    setSSI(server, "product", createIndividualProductSSI, "setProductSSI", getDomain("traceability"));
}

module.exports = {
    command,
    createIndividualProductSSI
};
