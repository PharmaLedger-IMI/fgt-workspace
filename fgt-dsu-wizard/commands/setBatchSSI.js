/**
 * Defines how to create the keyssi for a batch dsu
 * @param {object} data necessary properties:
 * <ul>
 *     <li>gtin - the gtin of the batch</li>
 *     <li>batch - the batch number</li>
 *     <li>(optional) {@link openDSU#constants#BRICKS_DOMAIN_KEY} - the subDomain to store the bricks in. Will be concatenated like 'domain.subDomain'</li>
 * </ul>
 * @param {string} domain the anchoring domain
 * @returns {ArraySSI}
 */
function createBatchSSI(data, domain) {
    console.log("New BATCH_SSI in domain", domain);

    return keyssiSpace.createArraySSI(domain, [data.gtin, data.batch], 'v0', hint ? JSON.stringify(hint) : undefined);
}

/**
 * Registers the endpoint on the api-hub's dsu-wizard.
 * @param {HttpServer} server
 */
function command(server){
    const setSSI = require('./setSSI');
    setSSI(server, "batch", createBatchSSI, "setBatchSSI", "traceability");
}

module.exports = {
    command,
    createBatchSSI
};
