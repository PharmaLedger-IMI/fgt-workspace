
const ShipmentStatus = require('./ShipmentStatus');
const IndividualProductStatus = require('./IndividualProductStatus');
/**
 * @enum ShipmentLineStatus
 * @memberOf Model
 */
const ShipmentLineStatus = {
    CREATED: ShipmentStatus.CREATED,
    REJECTED: ShipmentStatus.REJECTED,
    ON_HOLD: ShipmentStatus.ON_HOLD,
    ACKNOWLEDGED: ShipmentStatus.ACKNOWLEDGED,
    PICKUP: ShipmentStatus.PICKUP,
    TRANSIT: ShipmentStatus.TRANSIT,
    DELIVERED: ShipmentStatus.DELIVERED,
    RECEIVED: ShipmentStatus.RECEIVED,
    CONFIRMED: ShipmentStatus.CONFIRMED,


    COMMISSIONED: IndividualProductStatus.COMMISSIONED,
    RECALL: IndividualProductStatus.RECALL,
    DISPENSED: IndividualProductStatus.DISPENSED,
    ADMINISTERED: IndividualProductStatus.ADMINISTERED,
    DESTROYED: IndividualProductStatus.DESTROYED
}

module.exports = ShipmentLineStatus;