
function createOrderSSI(data, domain) {
    console.log("New ORDER_SSI in domain", domain);
    const keyssiSpace = require("opendsu").loadApi("keyssi");
    return keyssiSpace.buildTemplateArraySSI(domain, [data.orderId, data.requesterId]);
}

function setOrderSSI(server){
    const setSSI = require('./setSSI');
    setSSI(server, "order", createOrderSSI, "setOrderSSI", "traceability");
}

module.exports = setOrderSSI;
