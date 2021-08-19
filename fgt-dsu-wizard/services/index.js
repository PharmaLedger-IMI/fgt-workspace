/**
 * Integrates with OpenDSU Framework to create/manage DSU's while exposing a simple CRUD like API
 * @namespace Services
 */
module.exports = {
    DSUService: require('../../pdm-dsu-toolkit/services/DSUService'),
    WebcLocaleService: require("../../pdm-dsu-toolkit/services/WebcLocaleService"),
    WebComponentService: require("../../pdm-dsu-toolkit/services/WebComponentService"),
    OrderLineService: require("./OrderLineService"),
    OrderService: require("./OrderService"),
    ShipmentService: require("./ShipmentService"),
    ShipmentLineService: require('./ShipmentLineService'),
    StatusService: require("./StatusService"),
    ProductService: require("./ProductService"),
    BatchService: require("./BatchService"),
    SaleService: require('./SaleService'),
    Strategy: require("../../pdm-dsu-toolkit/services/strategy"),
    IndividualProductService: require('./IndividualProductService'),
    TraceabilityService: require('./TraceabilityService'),
    utils: require('../../pdm-dsu-toolkit/services/utils')
}