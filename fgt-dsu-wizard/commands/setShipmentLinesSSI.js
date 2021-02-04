
function createShipmentLinesSSI(data, domain) {
    console.log("New OrderLinesSSI in domain", domain);
    const keyssiSpace = require("opendsu").loadApi("keyssi");
    return keyssiSpace.buildTemplateArraySSI(domain, [data.gtin, data.batch, "SHIPMENTLINES"]);
}

function setShipmentLinesSSI(server, mah){
    const setSSI = require('./setSSI');
    setSSI(server, "shipmentLines", createShipmentLinesSSI, "setShipmentLinesSSI", "traceability." + mah);
}

module.exports = setShipmentLinesSSI;
