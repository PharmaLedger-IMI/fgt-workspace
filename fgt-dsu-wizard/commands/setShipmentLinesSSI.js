
function createShipmentLinesSSI(data, domain) {
    console.log("New SHIPMENTLINES_SSI in domain", domain);
    const keyssiSpace = require("opendsu").loadApi("keyssi");
    return keyssiSpace.buildTemplateArraySSI(domain, [data.gtin, data.batch, "SHIPMENTLINES"]);
}

function command(server, mah){
    const setSSI = require('./setSSI');
    setSSI(server, "shipmentLines", createShipmentLinesSSI, "setShipmentLinesSSI", "traceability." + mah);
}

module.exports = {
    command,
    createShipmentLinesSSI
};
