/**
 * @module fgt-dsu-wizard.services
 */
module.exports = {
    DSUService: require('../../pdm-dsu-toolkit/services/DSUService'),
    ParticipantService: require('./ParticipantService'),
    InboxService: require("./InboxService"),
    LocaleService: require("./LocaleService"),
    WebcLocaleService: require("../../pdm-dsu-toolkit/services/WebcLocaleService"),
    OrderLineService: require("./OrderLineService"),
    OrderService: require("./OrderService"),
    ShipmentService: require("./ShipmentService"),
    StatusService: require("./StatusService"),
    ProductService: require("./ProductService"),
    BatchService: require("./BatchService"),
    Strategy: require("../../pdm-dsu-toolkit/services/strategy"),
    utils: require('../../pdm-dsu-toolkit/services/utils')
}