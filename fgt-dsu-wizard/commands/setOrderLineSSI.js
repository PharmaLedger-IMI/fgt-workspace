
function createOrderLineSSI(data, domain) {
    console.log("New ORDERLINE_SSI in domain ", domain, [data.requesterId, data.orderId, data.gtin]);
    const keyssiSpace = require("opendsu").loadApi("keyssi");
    return keyssiSpace.buildTemplateArraySSI(domain, [data.requesterId, data.orderId, data.gtin]);
}

function command(server){
    const setSSI = require('./setSSI');
    setSSI(server, "orderline", createOrderLineSSI, "setOrderLineSSI", "traceability");
}

module.exports = {
    command,
    createOrderLineSSI
};
