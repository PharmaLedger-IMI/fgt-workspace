/**
 * @module fgt-dsu-wizard.model
 */
module.exports = {
    Order: require('./Order'),
    OrderStatus: require('./OrderStatus'),
    OrderLine: require('./OrderLine'),
    Shipment: require('./Shipment'),
    ShipmentStatus: require('./ShipmentStatus'),
    ShipmentLine: require('./ShipmentLine'),
    Participant: require('./Participant'),
    Product: require('./Product'),
    Batch: require('./Batch'),
    MAH: require('./MAH'),
    Pharmacy: require('./Pharmacy'),
    Wholesaler: require('./Wholesaler'),
    Validations: require('../../pdm-dsu-toolkit/model/Validations'),
    Utils: require('../../pdm-dsu-toolkit/model/Utils')
}
