
function createShipmentLineSSI(data, domain) {
    console.log("New SHIPMENTLINESSI in domain", domain);
    const keyssiSpace = require("opendsu").loadApi("keyssi");
    return keyssiSpace.buildTemplateArraySSI(domain, [data.senderId, data.shipmentId, data.gtin]);
}

function setShipmentLineSSI(server){
    const setSSI = require('./setSSI');
    setSSI(server, "shipmentline", createShipmentLineSSI, "setShipmentLineSSI", "traceability");
}

module.exports = setShipmentLineSSI;
