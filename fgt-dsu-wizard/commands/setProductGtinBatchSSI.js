
function createProductGtinBatchSSI(data, domain) {
    console.log("New PRODUCT_GTIN_BATCH_SSI in domain", domain);
    const keyssiSpace = require("opendsu").loadApi("keyssi");
    return keyssiSpace.buildTemplateArraySSI(domain, [data.gtin, data.batch]);
}

function command(server, mah){
    const setSSI = require('./setSSI');
    setSSI(server, "productBatch", createProductGtinBatchSSI, "setProductGtinBatchSSI", "traceability." + mah);
}

module.exports = {
    command,
    createProductGtinBatchSSI
};
