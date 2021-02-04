
function createProductGtinSSI(data, domain) {
    console.log("New PRODUCT_GTIN_SSI in domain", domain);
    const keyssiSpace = require("opendsu").loadApi("keyssi");
    return keyssiSpace.buildTemplateArraySSI(domain, [data.gtin]);
}

function setProductGtinSSI(server, mah){
    const setSSI = require('./setSSI');
    setSSI(server, "productGtin", createProductGtinSSI, "setProductGtinSSI", "traceability." + mah);
}

module.exports = setProductGtinSSI;
