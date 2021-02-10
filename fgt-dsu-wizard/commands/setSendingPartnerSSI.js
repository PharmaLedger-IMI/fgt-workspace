
function createSendingPartnerSSI(data, domain) {
    console.log("New SENDING_PARTNER_SSI in domain", domain);
    const keyssiSpace = require("opendsu").loadApi("keyssi");
    return keyssiSpace.buildTemplateArraySSI(domain, [data.gtin, data.batch, data.senderId]);
}

function command(server, mah){
    const setSSI = require('./setSSI');
    setSSI(server, "sendingpartner", createSendingPartnerSSI, "setSendingPartnerSSI", "traceability." + mah);
}

module.exports = {
    command,
    createSendingPartnerSSI
};
