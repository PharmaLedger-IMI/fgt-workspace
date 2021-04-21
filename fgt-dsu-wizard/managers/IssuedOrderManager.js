const { DB, DEFAULT_QUERY_OPTIONS } = require('../constants');
const OrderManager = require("./OrderManager");
const Order = require('../model').Order;
const OrderStatus = require('../model').OrderStatus;


/**
 * Issued Order Manager Class - concrete OrderManager for issuedOrders.
 * @param {ParticipantManager} participantManager the top-level manager for this participant, which knows other managers.
 */
class IssuedOrderManager extends OrderManager {
    constructor(participantManager) {
        super(participantManager, DB.issuedOrders);
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
     * @param {Product} item
     * @param {string|object} record
     * @return {object} the indexed object to be stored in the db
     * @protected
     * @override
     */
    _indexItem(key, item, record) {
        return {
            orderId: key,
            value: record
        }
    };

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
        // TODO locate senderId and check if it can receive orders

        // TODO locate MAH id from order.orderLine[i].gtin and send
        // messages to all MAHs.
        const sendOrderLinesToMAH = function(orderLines) {
            //console.log("Handling rest of orderLines ", orderLines);
            if (!orderLines || orderLines.length<=0)
                return; // done
            const orderLine0 = orderLines[0];
            const gtin = orderLine0.gtin;
            console.log("TODO resolve gtin "+gtin+" to MAH id and send messsage");
            orderLines.shift();
            sendOrderLinesToMAH(orderLines);
        }
        sendOrderLinesToMAH([...order.orderLines]);

        self.orderService.create(order, (err, keySSI) => {
            if (err)
                return self._err(`Could not create product DSU for ${order}`, err, callback);                
            const keySSIStr = keySSI.getIdentifier();
            const sReadSSI = keySSI.derive();
            const sReadSSIStr = sReadSSI.getIdentifier();
            console.log("Order seedSSI="+keySSIStr+" sReadSSI="+sReadSSIStr);
            // storing the sReadSSI in base58
            const record = sReadSSIStr;
            self.insertRecord(orderId, self._indexItem(orderId, order, record), (err) => {
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
                        return callback(err);
                    console.log("Message sent to "+order.senderId+", "+DB.receivedOrders+", "+aKey);
                    callback(undefined, keySSI, path);
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
        const defaultOptions = () => Object.assign({}, DEFAULT_QUERY_OPTIONS, {
            query: ['orderId like /.*/g']
        });

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

        let self = this;
        super.getAll(readDSU, options, (err, result) => {
            if (err)
                return self._err(`Could not parse IssuedOrders ${JSON.stringify(result)}`, err, callback);
            console.log(`Parsed ${result.length} orders`);
            callback(undefined, result);
        });
        /*
        let orderLine1 = new OrderLine('123', 1, '', '');
        let orderLine2 = new OrderLine('321', 5, '', '');
        let order1 = new Order("IOID1", "TPID1", 'WHSID555', "SA1", OrderStatus.CREATED, [orderLine1, orderLine2]);
        let order2 = new Order("IOID2", "TPID2", 'WHSID432', "SA1", OrderStatus.CREATED, [orderLine1, orderLine2]);
        return callback(undefined, [
            order1,order2,order1,order2,order1,order2,order1,order2,
            order1,order2,order1,order2,order1,order2,order1,order2,
            order1,order2,order1,order2,order1,order2,order1,order2,
            order1,order2,order1,order2,order1,order2,order1,order2,
            order1,order2,order1,order2,order1,order2,order1,order2,
            order1,order2,order1,order2,order1,order2,order1,order2,
            order1,order2,order1,order2,order1,order2,order1,order2,
            order1,order2,order1,order2,order1,order2,order1,order2,
        ]);
        */
        /*
        super.listMounts(ISSUED_ORDERS_MOUNT_PATH, (err, mounts) => {
            if (err)
                return callback(err);
            console.log(`Found ${mounts.length} orders at ${ISSUED_ORDERS_MOUNT_PATH}`);
            mounts = mounts.map(m => {
                console.log("Listing mounted m", m);
                m.path = `${ISSUED_ORDERS_MOUNT_PATH}/${m.path}`;
                return m;
            });
            super.readAll(mounts, callback);
        });
        */
    }

    /**
     * Creates a blank {@link Order} with some specific initializations.
     * Uses the participantManager to obtain some data.
     * @param {function(err, order)} callback
     */
    newBlank(callback) {
        let self = this;
        //let orderLine1 = new OrderLine('123', 1, '', '');
        //let orderLine2 = new OrderLine('321', 5, '', '');
        //return new Order(orderId, orderingTradingPartnerId, '', shippingAddress, OrderStatus.CREATED, [orderLine1, orderLine2]);
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

let issuedOrderManager;
/**
 * @param {ParticipantManager} participantManager
 * @returns {OrderManager}
 */
const getIssuedOrderManager = function (participantManager, force) {
    if (!issuedOrderManager || force)
        issuedOrderManager = new IssuedOrderManager(participantManager);
    return issuedOrderManager;
}

module.exports = getIssuedOrderManager;
