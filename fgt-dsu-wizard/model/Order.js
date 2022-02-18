const OrderStatus = require('./OrderStatus');
const OrderLine = require('./OrderLine');
const Status = require('./Status');
const ShipmentStatus = require("./ShipmentStatus");

/**
 * @class Order
 * @memberOf Model
 */
class Order {
    orderId;
    requesterId;
    senderId;
    shipToAddress;
    status;
    orderLines;
    shipmentId;

    /**
     * @param orderId
     * @param requesterId
     * @param senderId
     * @param shipToAddress
     * @param status
     * @param orderLines
     * @constructor
     */
    constructor(orderId, requesterId, senderId, shipToAddress, status, orderLines) {
        this.orderId = orderId || (new Date()).getTime();
        this.requesterId = requesterId;
        this.senderId = senderId;
        this.shipToAddress = shipToAddress;
        this.status = status || OrderStatus.CREATED;
        this.orderLines = orderLines ? orderLines.map(sl => new OrderLine(sl.gtin, sl.quantity, sl.requesterId, sl.senderId, this.status)) : [];
    }

    /**
     * Validate if everything seems ok with the properties of this object.
     * @param {string} [oldStatus] if oldStatus validation is available
     * @returns undefined if all ok. An arry of errors if not all ok.
     */
    validate(oldStatus) {
        const errors = [];
        if (!this.orderId) {
            errors.push('OrderID is required.');
        }
        if (!this.requesterId) {
            errors.push('Ordering partner ID is required.');
        }
        if (!this.senderId) {
            errors.push('Supplying partner ID is required.');
        }
        if (!this.shipToAddress) {
            errors.push('ShipToAddress is required.');
        }
        if (!this.status) {
            errors.push('status is required.');
        }
        if (!this.orderLines || !this.orderLines.length) {
            errors.push('orderLines is required.');
        } else {
            this.orderLines.forEach((orderLine,orderLineIndex) => {
                let orderLineErrors = orderLine.validate();
                if (orderLineErrors) {
                    orderLineErrors.forEach((error) => {
                        errors.push("Order Line "+orderLineIndex+": "+error);
                    });
                }
            });
        }

        if (oldStatus && Order.getAllowedStatusUpdates(oldStatus).indexOf(this.status.status || this.status) === -1)
            errors.push(`Status update from ${oldStatus} to ${this.status.status || this.status} is not allowed`);

        return errors.length === 0 ? undefined : errors;
    }

    static getAllowedStatusUpdates(status){
        switch(status){
            case OrderStatus.CREATED:
                return [OrderStatus.ACKNOWLEDGED,OrderStatus.REJECTED, OrderStatus.ON_HOLD, OrderStatus.PICKUP]
            case OrderStatus.ACKNOWLEDGED:
                return [OrderStatus.REJECTED, OrderStatus.ON_HOLD, OrderStatus.PICKUP]
            case OrderStatus.ON_HOLD:
                return [OrderStatus.PICKUP, OrderStatus.REJECTED]
            case OrderStatus.PICKUP:
                return [OrderStatus.ON_HOLD, OrderStatus.REJECTED, OrderStatus.TRANSIT]
            case OrderStatus.TRANSIT:
                return [OrderStatus.REJECTED, OrderStatus.ON_HOLD, OrderStatus.DELIVERED]
            case OrderStatus.DELIVERED:
                return [OrderStatus.RECEIVED, OrderStatus.REJECTED]
            case OrderStatus.RECEIVED:
                return [OrderStatus.CONFIRMED, OrderStatus.REJECTED]
            default:
                return [];
        }
    }

    static getAllowedStatusUpdateFromShipment(status){
        switch(status){
            case OrderStatus.DELIVERED:
                return [OrderStatus.RECEIVED, OrderStatus.REJECTED]
            case OrderStatus.RECEIVED:
                return [OrderStatus.CONFIRMED, OrderStatus.REJECTED]
            default:
                return [];
        }
    }
}

module.exports = Order;
