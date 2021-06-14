
const OrderStatus = require('./OrderStatus');
/**
 * ShipmentStatus
 * @module fgt-dsu-wizard.model
 */
const ShipmentStatus = {
    CREATED: OrderStatus.CREATED,
    REJECTED: OrderStatus.REJECTED,
    ON_HOLD: OrderStatus.ON_HOLD,
    ACKNOWLEDGED: OrderStatus.ACKNOWLEDGED,
    PICKUP: OrderStatus.PICKUP,
    TRANSIT: OrderStatus.TRANSIT,
    DELIVERED: OrderStatus.DELIVERED,
    RECEIVED: OrderStatus.RECEIVED,
    CONFIRMED: OrderStatus.CONFIRMED
}

module.exports = ShipmentStatus;