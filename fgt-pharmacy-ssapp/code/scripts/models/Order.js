import Utils from "./Utils";

export default class Order {
    orderId;
    orderingPartnerId;
    supplyingPartnerId;
    shipToAddress;
    timeStamp;
    status;

    constructor(order) {
        if (typeof order !== undefined)
            for (let prop in order)
                if (order.hasOwnProperty(prop))
                    this[prop] = order[prop];

        if (!this.orderId)
            this.orderId = Utils.generateSerialNumber(10);
        this.timeStamp = Date.now();
    }

    generateViewModel() {
        return {label: this.orderId, value: this.orderId}
    }

    validate() {
        if (!this.orderId)
            return 'Order number is mandatory';

        if (!this.orderingPartnerId)
            return 'Ordering partner id is mandatory';

        if (!this.supplyingPartnerId)
            return 'Supplying partner id is mandatory';

        if (!this.shipToAddress)
            return 'Ship To Address is mandatory';

        if (!this.status)
            return 'Status is mandatory';

        return undefined;
    }

    addOrderLines(orderLinesKeySSIs){
        orderLinesKeySSIs.forEach( ol => {
            // d0 stuff
        });
    }
}
