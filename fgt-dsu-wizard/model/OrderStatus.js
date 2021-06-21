/**
 * @class OrderStatus
 * @memberOf Model
 */
const OrderStatus = {
    CREATED: "created",
    REJECTED: 'rejected',
    ON_HOLD: "hold",
    ACKNOWLEDGED: "acknowledged",
    PICKUP: "pickup",
    TRANSIT: "transit",
    DELIVERED: "delivered",
    RECEIVED: "received",
    CONFIRMED: "confirmed"
}

module.exports = OrderStatus;