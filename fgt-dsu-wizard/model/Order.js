const OrderStatus = require('./OrderStatus');
const OrderLine = require('./OrderLine');




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
        this.orderLines = orderLines ? orderLines.map(sl => new OrderLine(sl.gtin, sl.quantity, sl.requesterId, sl.senderId)) : [];
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

        if (oldStatus && Order.getAllowedStatusUpdates(oldStatus).indexOf(this.status) === -1)
            errors.push(`Status update from ${oldStatus} to ${this.status} is not allowed`);

        return errors.length === 0 ? undefined : errors;
    }

    static getAllowedStatusUpdates(status){
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
