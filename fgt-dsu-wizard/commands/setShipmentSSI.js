

function createShipmentSSI(data, domain) {
    console.log("New SHIPMENT_SSI in domain", domain);
    const keyssiSpace = require("opendsu").loadApi("keyssi");
    return keyssiSpace.buildTemplateArraySSI(domain, [data.senderId, data.shipmentId]);
}

function command(server){
    const setSSI = require('./setSSI');
    setSSI(server, "shipment", createShipmentSSI, "setShipmentSSI", "traceability");
}

module.exports = {
    command,
    createShipmentSSI
};
