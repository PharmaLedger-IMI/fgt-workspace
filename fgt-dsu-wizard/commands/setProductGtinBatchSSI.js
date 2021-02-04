
function createProductGtinBatchSSI(data, domain) {
    console.log("New ProductGtinBatchSSI in domain", domain);
    const keyssiSpace = require("opendsu").loadApi("keyssi");
    return keyssiSpace.buildTemplateArraySSI(domain, [data.gtin, data.batch]);
}

function setProductGtinBatchSSI(server, mah){
    const setSSI = require('./setSSI');
    setSSI(server, "productGtinBatch", createProductGtinBatchSSI, "setProductGtinBatchSSI", "traceability." + mah);
}

module.exports = setProductGtinBatchSSI;
