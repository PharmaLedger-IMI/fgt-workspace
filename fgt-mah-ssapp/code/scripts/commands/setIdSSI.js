
/**
 * Creates a seedSSI meant to contain participant 'personal' data (in this case MAH)
 * could be used as an identity
 *
 * the MAH name will be used as subdomain
 * @param {Actor} actor
 * @param {string} domain: anchoring domain
 * @returns {Object} a SeedSSI
 */
function createIdSSI(actor, domain) {
    console.log("New Actor_SSI in domain", domain);
    const keyssiSpace = require("opendsu").loadApi("keyssi");
    return keyssiSpace.buildTemplateSeedSSI(domain, actor.id + actor.name + actor.nif, undefined, undefined, {"subDomain": actor.name});
}

function command(server){
    const setSSI = require('./setSSI');
    setSSI(server, "id", createIdSSI, "setIdSSI", "traceability");
}

module.exports = {
    command,
    createIdSSI
};
