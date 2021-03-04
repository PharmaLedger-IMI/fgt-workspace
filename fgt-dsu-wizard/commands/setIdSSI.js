/**
 * @module fgt-dsu-wizard.commands
 */

/**
 * Creates a seedSSI meant to contain participant 'personal' data (in this case MAH)
 * could be used as an identity
 * @param {Actor} actor
 * @param {string} domain: anchoring domain
 * @returns {SeedSSI} (template)
 */
function createIdSSI(actor, domain) {
    console.log("New Actor_SSI in domain", domain);
    const openDSU = require('opendsu');
    const keyssiSpace = openDSU.loadApi("keyssi");
    return keyssiSpace.buildTemplateSeedSSI(domain, actor.id + actor.name + actor.nif, undefined, 'v0', undefined);
}

/**
 * Registers the endpoint on the api-hub's dsu-wizard.
 * @param {HttpServer} server
 */
function command(server){
    const setSSI = require('./setSSI');
    setSSI(server, "id", createIdSSI, "setIdSSI", "traceability");
}

module.exports = {
    command,
    createIdSSI
};
