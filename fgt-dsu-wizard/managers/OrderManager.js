const { DB, ANCHORING_DOMAIN } = require('../constants');
const Manager = require("../../pdm-dsu-toolkit/managers/Manager");
const Order = require('../model').Order;
const OrderLine = require('../model').OrderLine;
const OrderStatus = require('../model').OrderStatus;

/**
 * Order Manager Class
 *
 * Abstract class.
 * Use only concrete subclasses {@link IssuedOrderManager} or {@link ReceivedOrderManager}.
 *
 * Manager Classes in this context should do the bridge between the controllers
 * and the services exposing only the necessary api to the controllers while encapsulating <strong>all</strong> business logic.
 *
 * All Manager Classes should be singletons.
 *
 * This complete separation of concerts is very beneficial for 2 reasons:
 * <ul>
 *     <li>Allows for testing since there's no browser dependent code (i think) since the DSUStorage can be 'mocked'</li>
 *     <li>Allows for different controllers access different business logic when necessary (while benefiting from the singleton behaviour)</li>
 * </ul>
 *
 * @param {ParticipantManager} participantManager
 * @param {function(err, Manager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @class OrderManager
 * @abstract
 * @extends Manager
 * @memberOf Managers
 */
class OrderManager extends Manager {
    constructor(participantManager, tableName, indexes, callback) {
        super(participantManager, tableName, ['orderId', 'products', 'status', ...indexes], callback);
        this.orderService = new (require('../services').OrderService)(ANCHORING_DOMAIN);
    }

    /**
     * generates the db's key for the Order
     * @param {string|number} otherActorId
     * @param {string|number} orderId
     * @return {string}
     * @protected
     */
    _genCompostKey(otherActorId, orderId){
        return `${otherActorId}-${orderId}`;
    }

    /**
     * Util function that loads a OrderDSU and reads its information
     * @param {string|KeySSI} keySSI
     * @param {function(err, Order, Archive, KeySSI)} callback
     * @protected
     * @override
     */
    _getDSUInfo(keySSI, callback){
        return this.orderService.get(keySSI, callback);
    }

    /**
     * Must wrap the entry in an object like:
     * <pre>
     *     {
     *         index1: ...
     *         index2: ...
     *         value: item
     *     }
     * </pre>
     * so the DB can be queried by each of the indexes and still allow for lazy loading
     * @param {string} key
     * @param {Order} item
     * @param {string|object} record
     * @return {object} the indexed object to be stored in the db
     * @protected
     * @override
     */
    _indexItem(key, item, record) {
        return {
            orderId: item.orderId,
            status: item.status.status,
            products: item.orderLines.map(ol => ol.gtin).join(','),
            value: record
        }
    }

    /**
     * updates an item
     *
     * @param {string} [key] key is optional so child classes can override them
     * @param {object} newOrder
     * @param {function(err, Order?, Archive?)} callback
     */
    update(key, newOrder, callback){
        if (!callback)
            return callback(`No key Provided...`);

        let self = this;
        self.getRecord(key, (err, record) => {
            if (err)
                return self._err(`Unable to retrieve record with key ${key} from table ${self._getTableName()}`, err, callback);
            self.orderService.update(record.value, newOrder, (err, updatedOrder, orderDsu) => {
                if (err)
                    return self._err(`Could not Update Order DSU`, err, callback);
                self.updateRecord(key, self._indexItem(key, updatedOrder, record.value), (err) => {
                    if (err)
                        return callback(err);
                    callback(undefined, updatedOrder, orderDsu);
                });
            });
        });
    }

    // messages to all MAHs.
    // the order is the same for the orderlines and their ssis because of the way the code is written
    sendOrderLinesToMAH(orderLines, orderLinesSSIs, callback) {
        const self = this;
        const orderLine = orderLines.shift();
        let ssi = orderLinesSSIs.shift();
        //console.log("Handling rest of orderLines ", orderLines);
        if (!orderLine){
            console.log(`All orderlines transmited to MAH`)
            return callback();
        }
        self.orderService.resolveMAH(orderLine, (err, mahId) => {
            if (err)
                return self._err(`Could not resolve MAH for ${orderLine}`, err, callback);
            if (typeof ssi !== 'string')
                ssi = ssi.getIdentifier();
            self.sendMessage(mahId, DB.orderLines, ssi, (err) => {
                if (err)
                    return self._err(`Could not send message to MAH ${mahId} for orderLine ${JSON.stringify(orderLine)} with ssi ${ssi}`, err, callback);
                console.log(`Orderline ${JSON.stringify(orderLine)} transmitted to MAH ${mahId}`);
            })
        });

        self.sendOrderLinesToMAH(orderLines, orderLinesSSIs, callback);
    }

    /**
     * Convert the OrderController view model into an Order.
     * @param model
     * @returns {Order}
     */
    fromModel(model) {
        // convert orderLines into an array of OrderLines
        let orderLines = [];
        let orderLinesStr = model.orderLines.value;
        if (orderLinesStr) {
            orderLinesStr.split(";").forEach((gtinCommaQuant) => {
                let gtinAndQuant = gtinCommaQuant.split(",");
                if (gtinAndQuant.length === 2) {
                    let gtin = gtinAndQuant[0];
                    let quantity = parseInt(gtinAndQuant[1]);
                    if (gtin && quantity) {
                        orderLines.push(new OrderLine(gtin, quantity, model.requesterId.value, model.senderId.value));
                    }
                }
            });
        }
        const order = new Order(model.orderId.value, model.requesterId.value, model.senderId.value, model.shipToAddress.value, OrderStatus.CREATED, orderLines);
        console.log("model ", model, "order ", order);
        return order;
    }

    /**
     * Convert an Order into a OrderControler view model. 
     * The order.orderLines are converted to a special format. See locale.js
     * @param {Order} object the business model object
     * @param model the Controller's model object
     * @returns {{}}
     */
    toModel(object, model) {
        model = model || {};
        for (let prop in object) {
            //console.log("prop", prop, "=='orderLines'", prop=="orderLines");
            if (object.hasOwnProperty(prop)) {
                if (!model[prop])
                    model[prop] = {};
                if (prop == "orderLines") {
                    model[prop].value = "";
                    let sep = "";
                    object[prop].forEach((orderLine) => {
                        model[prop].value += sep + orderLine.gtin + "," + orderLine.quantity;
                        sep = ";";
                    });
                } else {
                    model[prop].value = object[prop];
                }
            }
        }
        return model;
    }
}

module.exports = OrderManager;