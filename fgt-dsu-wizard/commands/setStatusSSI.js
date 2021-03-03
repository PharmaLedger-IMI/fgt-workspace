/**
 * Creates a seedSSI meant to contain Status data
 *
 * if status object has 'anchoring' property, it will be used for anchoring bricks
 * @param {OrderStatus|ShipmentStatus} status
 * @param {string} domain: anchoring domain
 * @returns {Object} a SeedSSI
 */
function createStatusSSI(status, domain) {
    console.log("New OrderStatus_SSI in domain", domain);
    const keyssiSpace = require("opendsu").loadApi("keyssi");
    let hint = status.anchoring ? {brickStorage: status.anchoring} : undefined;
    return keyssiSpace.createTemplateSeedSSI(domain, status, undefined, undefined, hint);
}

function command(server){
    const setSSI = require('./setSSI');
    setSSI(server, "status", createStatusSSI, "setStatusSSI", "traceability");
}

module.exports = {
    command,
    createStatusSSI
};