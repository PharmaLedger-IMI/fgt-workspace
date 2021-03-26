/**
 * @module fgt-dsu-wizard.commands
 */

/**
 * Creates a template seedSSI meant to refer an Inbox DSU type.
 * @param {object} inbox object. There is no fgt-dsu-wizard/model/Inbox.js, but it is +/- specified in the DSU constitution.
 * @param {string} domain: anchoring domain
 * @returns {SeedSSI} (template)
 */
function createInboxSSI(participant, domain) {
    console.log("New Inbox_SSI in domain", domain);
    const openDSU = require('opendsu');
    const keyssiSpace = openDSU.loadApi("keyssi");
    return keyssiSpace.createTemplateSeedSSI(domain);
}

/**
 * Registers the endpoint on the api-hub's dsu-wizard.
 * @param {HttpServer} server
 */
function command(server){
    const setSSI = require('../../pdm-dsu-toolkit/commands/setSSI');
    setSSI(server, "inbox", createInboxSSI, "setInboxSSI", "traceability");
}

module.exports = {
    command,
    createInboxSSI: createInboxSSI
};
