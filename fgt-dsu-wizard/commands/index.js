/**
 * @module fgt-dsu-wizard.commands
 */
module.exports = {
    setSSI: require('../../pdm-dsu-toolkit/commands/setSSI'),
    createParticipantSSI: require("./setParticipantSSI").createParticipantSSI,
    createParticipantConstSSI: require("./setParticipantConstSSI").createParticipantConstSSI,
    createInboxSSI: require("./setInboxSSI").createInboxSSI,
    createOrderingPartnerSSI: require("./setOrderingPartnerSSI").createOrderingPartnerSSI,
    createOrderLineSSI: require("./setOrderLineSSI").createOrderLineSSI,
    createOrderLinesSSI: require("./setOrderLinesSSI").createOrderLinesSSI,
    createOrderSSI: require("./setOrderSSI").createOrderSSI,
    createStatusSSI: require('./setStatusSSI').createStatusSSI,
    createBatchSSI: require("./setBatchSSI").createBatchSSI,
    createProductSSI: require("./setProductSSI").createProductSSI,
    createSendingPartnerSSI: require("./setSendingPartnerSSI").createSendingPartnerSSI,
    createShipmentLineSSI: require("./setShipmentLineSSI").createShipmentLineSSI,
    createShipmentLinesSSI: require("./setShipmentLinesSSI").createShipmentLinesSSI,
    createShipmentSI: require("./setShipmentSSI").createShipmentSSI
}