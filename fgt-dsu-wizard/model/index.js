/**
 * @module fgt-dsu-wizard.model
 */

const {generateProductName, generateGtin, validateGtin, calculateGtinCheckSum, generateBatchNumber, generateRandomInt, genDate} = require('../../bin/environment/utils');

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
    Utils: require('../../pdm-dsu-toolkit/model/Utils'),
    Stock: require('./Stock'),
    StockStatus: require('./StockStatus'),
    DirectoryEntry: require('./DirectoryEntry').DirectoryEntry,
    ROLE: require('./DirectoryEntry').ROLE,
    ShipmentCode: require('./ShipmentCode'),
    TrackingCode: require('./TrackingCode'),
    utils: {
        generateProductName,
        generateGtin,
        validateGtin,
        calculateGtinCheckSum,
        generateBatchNumber,
        generateRandomInt,
        genDate,
    }
}
