
function createProductSSI(data, domain) {
    console.log("New PRODUCT_SSI in domain", domain);
    const keyssiSpace = require("opendsu").loadApi("keyssi");
    return keyssiSpace.createArraySSI(domain, [data.gtin]);
}

function command(server, mah){
    const setSSI = require('./setSSI');
    setSSI(server, "product", createProductSSI, "setProductSSI", "traceability." + mah);
}

module.exports = {
    command,
    createProductSSI
};
