
function createOrderingPartnerSSI(data, domain) {
    console.log("New ORDERING_PARTNER_SSI in domain", domain);
    const keyssiSpace = require("opendsu").loadApi("keyssi");
    return keyssiSpace.buildTemplateArraySSI(domain, [data.requesterId, data.orderId, data.gtin]);
}

function setOrderingPartnerSSI(server, mah){
    const setSSI = require('./setSSI');
    setSSI(server, "orderline", createOrderingPartnerSSI, "setOrderingPartnerSSI", "traceability." + mah);
}

module.exports = setOrderLineSSI;
