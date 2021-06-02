/**
 * @module fgt-dsu-wizard.commands
 */
module.exports = {
    setSSI: require('../../pdm-dsu-toolkit/commands/setSSI'),
    createParticipantSSI: require("./setParticipantSSI").createParticipantSSI,
    createOrderLineSSI: require("./setOrderLineSSI").createOrderLineSSI,
    createOrderSSI: require("./setOrderSSI").createOrderSSI,
    createStatusSSI: require('./setStatusSSI').createStatusSSI,
    createBatchSSI: require("./setBatchSSI").createBatchSSI,
    createProductSSI: require("./setProductSSI").createProductSSI,
    createShipmentLineSSI: require("./setShipmentLineSSI").createShipmentLineSSI,
    createShipmentSSI: require("./setShipmentSSI").createShipmentSSI
}