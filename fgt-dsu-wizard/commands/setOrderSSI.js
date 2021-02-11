
/**
 * Creates a seedSSI based on orderId+requesterId.
 * @param {Object} data - must have properties orderId and requesterId as strings.
 * @param {string} domain 
 * @returns {Object} a SeedSSI
 */
function createOrderSSI(data, domain) {
    console.log("New ORDER_SSI in domain", domain);
    const keyssiSpace = require("opendsu").loadApi("keyssi");
    return keyssiSpace.buildTemplateArraySSI(domain, [data.orderId, data.requesterId]);
}

function command(server){
    const setSSI = require('./setSSI');
    setSSI(server, "order", createOrderSSI, "setOrderSSI", "traceability");
}

module.exports = {
    command,
    createOrderSSI
};
