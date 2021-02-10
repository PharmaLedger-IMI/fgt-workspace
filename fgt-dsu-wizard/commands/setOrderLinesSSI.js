
function createOrderLinesSSI(data, domain) {
    console.log("New ORDERLINES_SSI in domain", domain);
    const keyssiSpace = require("opendsu").loadApi("keyssi");
    return keyssiSpace.buildTemplateArraySSI(domain, [data.gtin, "ORDERLINES"]);
}

function command(server, mah){
    const setSSI = require('./setSSI');
    setSSI(server, "orderlines", createOrderLinesSSI, "setOrderLinesSSI", "traceability." + mah);
}

module.exports = {
    command,
    createOrderLinesSSI
}
