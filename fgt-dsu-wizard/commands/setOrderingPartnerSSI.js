
function createOrderingPartnerSSI(data, domain) {
    console.log("New ORDERING_PARTNER_SSI in domain", domain);
    const keyssiSpace = require("opendsu").loadApi("keyssi");
    return keyssiSpace.buildTemplateArraySSI(domain, [data.gtin, data.requesterId]);
}

function command(server, mah){
    const setSSI = require('./setSSI');
    setSSI(server, "orderingpartner", createOrderingPartnerSSI, "setOrderingPartnerSSI", "traceability." + mah);
}

module.exports = {
    command,
    createOrderingPartnerSSI
};
