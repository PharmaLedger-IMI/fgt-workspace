/**
 * @module fgt-dsu-wizard.model
 */
const ShipmentStatus = {
    CREATED: "created",
    ACKNOWLEDGED: "acknowledged",
    PICKUP: "pickup",
    TRANSIT: "transit",
    DELIVERED: "delivered",
    RECEIVED: "received",
    CONFIRMED: "confirmed"
}

module.exports = ShipmentStatus;