
function createShipmentLineSSI(data, domain) {
    console.log("New SHIPMENTLINE_SSI in domain", domain);
    const keyssiSpace = require("opendsu").loadApi("keyssi");
    return keyssiSpace.buildTemplateArraySSI(domain, [data.senderId, data.shipmentId, data.gtin]);
}

function command(server){
    const setSSI = require('./setSSI');
    setSSI(server, "shipmentline", createShipmentLineSSI, "setShipmentLineSSI", "traceability");
}

module.exports = {
    command,
    createShipmentLineSSI
};
