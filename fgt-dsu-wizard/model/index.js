/**
 * Definition of Model Objects
 * @namespace Model
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
    BatchStatus: require("./BatchStatus"),
    MAH: require('./MAH'),
    Pharmacy: require('./Pharmacy'),
    Wholesaler: require('./Wholesaler'),
    Validations: require('../../pdm-dsu-toolkit/model/Validations'),
    Utils: require('../../pdm-dsu-toolkit/model/Utils'),
    Sale: require('./Sale'),
    Stock: require('./Stock'),
    StockStatus: require('./StockStatus'),
    DirectoryEntry: require('./DirectoryEntry').DirectoryEntry,
    ROLE: require('./DirectoryEntry').ROLE,
    Receipt: require('./Receipt'),
    ShipmentCode: require('./ShipmentCode'),
    TrackingCode: require('./TrackingCode'),
    IndividualProduct: require('./IndividualProduct'),
    IndividualProductStatus: require('./IndividualProductStatus'),
    utils: require('./utils')
}
