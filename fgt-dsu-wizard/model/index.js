console.log("Now in MODELLL");

module.exports = {
    Order: require('./Order'),
    OrderLine: require('./OrderLine'),
    Shipment: require('./Shipment'),
    ShipmentLine: require('./ShipmentLine'),
    Product: require('./Product'),
    Batch: require('./Batch'),
    MAH: require('./MAH'),
    Pharmacy: require('./Pharmacy'),
    Wholesaler: require('./Wholesaler')
}
