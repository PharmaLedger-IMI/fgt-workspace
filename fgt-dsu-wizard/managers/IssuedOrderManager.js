const { DB, DEFAULT_QUERY_OPTIONS } = require('../constants');
const OrderManager = require("./OrderManager");
const {Order, OrderStatus, ShipmentStatus} = require('../model');

/**
 * Issued Order Manager Class - concrete OrderManager for issuedOrders.
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
 * @class IssuedOrderManager
 * @extends Manager
 * @memberOf Managers
 */
class IssuedOrderManager extends OrderManager {
    constructor(participantManager, callback) {
        super(participantManager, DB.issuedOrders, ['senderId', 'shipmentId'], callback);
    }

    /**
     * Must wrap the DB entry in an object like:
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
        return {...super._indexItem(key, item, record), senderId: item.senderId};
    }

    /**
     * Creates a {@link Order} dsu
     * @param {string|number} [orderId] the table key
     * @param {Order} order
     * @param {function(err, sReadSSI, dbPath)} callback where the dbPath follows a "tableName/orderId" template.
     */
    create(orderId, order, callback) {
        if (!callback){
            callback = order;
            order = orderId;
            orderId = order.orderId;
        }
        let self = this;

        self.orderService.create(order, (err, keySSI, orderLinesSSIs) => {
            if (err)
                return self._err(`Could not create product DSU for ${order}`, err, callback);                
            const keySSIStr = keySSI.getIdentifier();
            const sReadSSI = keySSI.derive();
            const sReadSSIStr = sReadSSI.getIdentifier();
            console.log("Order seedSSI="+keySSIStr+" sReadSSI="+sReadSSIStr);
            // storing the sReadSSI in base58
            const record = sReadSSIStr;
            self.insertRecord(super._genCompostKey(order.senderId, order.orderId), self._indexItem(orderId, order, record), (err) => {
                if (err)
                    return self._err(`Could not insert record with orderId ${orderId} on table ${self.tableName}`, err, callback);
                const path = `${self.tableName}/${orderId}`;
                console.log(`Order ${orderId} created stored at DB '${path}'`);
                // send a message to senderId
                // TODO send the message before inserting record ? The message gives error if senderId does not exist/not listening.
                // TODO derive sReadSSI from keySSI
                const aKey = keySSI.getIdentifier();
                this.sendMessage(order.senderId, DB.receivedOrders, aKey, (err) => {
                    if (err)
                        return self._err(`Could not sent message to ${order.orderId} with ${DB.receivedOrders}`, err, callback);
                    console.log("Message sent to "+order.senderId+", "+DB.receivedOrders+", "+aKey);
                    // self.sendOrderLinesToMAH([...order.orderLines], [...orderLinesSSIs], (err) => {
                    //     if (err)
                    //         return self._err(`Could not transmit orderLines to The manufacturers`, err, callback);
                        callback(undefined, keySSI, path);
                    // });
                });
            });
        });
    }

    /**
     * Lists all issued orders.
     * @param {boolean} [readDSU] defaults to true. decides if the manager loads and reads from the dsu's {@link INFO_PATH} or not
     * @param {object} [options] query options. defaults to {@link DEFAULT_QUERY_OPTIONS}
     * @param {function(err, Order[])} callback
     */
    getAll(readDSU, options, callback) {
        const defaultOptions = () => Object.assign({}, DEFAULT_QUERY_OPTIONS);

        if (!callback) {
            if (!options) {
                callback = readDSU;
                options = defaultOptions();
                readDSU = true;
            }
            if (typeof readDSU === 'boolean') {
                callback = options;
                options = defaultOptions();
            }
            if (typeof readDSU === 'object') {
                callback = options;
                options = readDSU;
                readDSU = true;
            }
        }

        options = options || defaultOptions();

        let self = this;
        super.getAll(readDSU, options, (err, result) => {
            if (err)
                return self._err(`Could not parse IssuedOrders ${JSON.stringify(result)}`, err, callback);
            console.log(`Parsed ${result.length} orders`);
            callback(undefined, result);
        });
    }

    updateOrderByShipment(orderId, shipmentSSI, shipment, callback){
        const getOrderStatusByShipment = function(shipmentStatus){
            switch (shipmentStatus){
                case ShipmentStatus.CREATED:
                    return OrderStatus.ACKNOWLEDGED;
                default:
                    return shipmentStatus;
            }
        }

        const self = this;
        this.getOne(this._genCompostKey(shipment.senderId, orderId), (err, order) => {
            if (err)
                return self._err(`Could not load Order`, err, callback);
            order.status = getOrderStatusByShipment(shipment.status);
            order.shipmentId = shipment.shipmentId;
            self.update(order, (err) => {
                if (err)
                    return self._err(`Could not update Order:\n${err.message}`, err, callback);
                callback();
            });
        });
    }

    update(key, order, callback){
        if (!callback){
            callback = order;
            order = key;
            key = this._genCompostKey(order.senderId, order.orderId);
        }

        super.update(key, order, callback);
    }

    /**
     * Creates a blank {@link Order} with some specific initializations.
     * Uses the participantManager to obtain some data.
     * @param {function(err, order)} callback
     */
    newBlank(callback) {
        let self = this;
        self.getIdentity((err, participant) => {
            if (err) {
                return callback(err);
            }
            let orderId = (new Date()).toISOString(); // TODO sequential unique numbering ? It should comes from the ERP anyway.
            let requesterId = participant.id;
            let senderId = '';
            let shipToAddress = participant.address;
            let order = new Order(orderId, requesterId, senderId, shipToAddress, OrderStatus.CREATED, []);
            callback(undefined, order);
        });
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

/**
 * @param {ParticipantManager} participantManager
 * @param {function(err, Manager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @returns {IssuedOrderManager}
 * @memberOf Managers
 */
const getIssuedOrderManager = function (participantManager, callback) {
    let manager;
    try {
        manager = participantManager.getManager(IssuedOrderManager);
        if (callback)
            return callback(undefined, manager);
    } catch (e){
        manager = new IssuedOrderManager(participantManager, callback);
    }

    return manager;
}

module.exports = getIssuedOrderManager;
