
function createBatchSSI(data, domain) {
    console.log("New BATCH_SSI in domain", domain);
    const keyssiSpace = require("opendsu").loadApi("keyssi");
    return keyssiSpace.createArraySSI(domain, [data.gtin, data.batch]);
}

function command(server, mah){
    const setSSI = require('./setSSI');
    setSSI(server, "batch", createBatchSSI, "setBatchSSI", "traceability." + mah);
}

module.exports = {
    command,
    createBatchSSI
};
