
/**
 * Creates a seedSSI meant to contain participant 'personal' data (in this case MAH)
 * could be used as an identity
 *
 * the MAH name will be used as subdomain
 * @param {MAH} mah
 * @param {string} domain
 * @returns {Object} a SeedSSI
 */
function createMAHSSI(mah, domain) {
    console.log("New MAH_SSI in domain", domain);
    const keyssiSpace = require("opendsu").loadApi("keyssi");
    return keyssiSpace.buildTemplateSeedSSI(domain, mah.id + mah.name, undefined, undefined, {"subDomain": mah.name});
}

function command(server){
    const setSSI = require('./setSSI');
    setSSI(server, "mah", createMAHSSI, "setMAHSSI", "traceability");
}

module.exports = {
    command,
    createMAHSSI
};
