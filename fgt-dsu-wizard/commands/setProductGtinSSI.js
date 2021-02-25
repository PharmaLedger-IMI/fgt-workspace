
function createProductGtinSSI(data, domain) {
    console.log("New PRODUCT_GTIN_SSI in domain", domain);
    const keyssiSpace = require("opendsu").loadApi("keyssi");
    return keyssiSpace.createArraySSI(domain, [data.gtin]);
}

function command(server, mah){
    const setSSI = require('./setSSI');
    setSSI(server, "product", createProductGtinSSI, "setProductGtinSSI", "traceability." + mah);
}

module.exports = {
    command,
    createProductGtinSSI
};
