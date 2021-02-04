
function createOrderLineSSI(data, domain) {
    console.log("New ORDERLINESSI in domain", domain);
    const keyssiSpace = require("opendsu").loadApi("keyssi");
    return keyssiSpace.buildTemplateArraySSI(domain, [data.requesterId, data.orderId, data.gtin]);
}

function setOrderLineSSI(server){
    const setSSI = require('./setSSI');
    setSSI(server, "orderline", createOrderLineSSI, "setOrderLineSSI", "traceability");
}

module.exports = setOrderLineSSI;
