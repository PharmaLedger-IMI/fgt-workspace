const { DB, DEFAULT_QUERY_OPTIONS, INFO_PATH, ISSUED_ORDERS_MOUNT_PATH: ISSUED_ORDERS_MOUNT_PATH, ANCHORING_DOMAIN } = require('../constants');
const Manager = require("../../pdm-dsu-toolkit/managers/Manager");
const Order = require('../model').Order;
const OrderLine = require('../model').OrderLine;
const OrderStatus = require('../model').OrderStatus;
/**
 * Order Manager Class
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
 * @param {ParticipantManager} participantManager the top-level manager for this participant, which knows other managers.
 */
class OrderManager extends Manager {
    constructor(participantManager) {
        super(participantManager, DB.issuedOrders);
        this.orderService = new (require('../services').OrderService)(ANCHORING_DOMAIN);
    }

    /**
     * Returns the mount path for a given orderId
     * @private
     */
    _getMountPath(orderId) {
        // jpsl technical protest: I disagree with Tiago in coding the mount path here. See create().
        return `${ISSUED_ORDERS_MOUNT_PATH}/${orderId}`;
    }

    /**
     * Creates a {@link Order} dsu
     * @param {Order} order
     * @param {function(err, keySSI, dbPath)} callback where the dbPath follows a "tableName/orderId" template.
     */
    createIssued(order, callback) {
        let self = this;
        // TODO locate senderId and check if it can receive orders
        const orderId = order.orderId;
        self.orderService.create(order, (err, keySSI) => {
            if (err)
                return self._err(`Could not create product DSU for ${order}`, err, callback);
            const record = keySSI.getIdentifier();
            self.insertRecord(orderId, self._indexItem(orderId, order, record), (err) => {
                if (err)
                    return self._err(`Could not insert record with orderId ${orderId} on table ${self.tableName}`, err, callback);
                const path =`${self.tableName}/${orderId}`;
                console.log(`Order ${orderId} created stored at DB '${path}'`);
                // send a message to senderId
                callback(undefined, keySSI, path);
            });   
        });
    }

    /**
    * Edits/Overwrites the product details
    * @param {string} order
    * @param {function(err)} callback
    */
    edit(order, callback) {
        let self = this;
        let mount_path = this._getMountPath(order.orderId);
        self.storage.writeFile(`${mount_path}${INFO_PATH}`, order, (err) => {
            if (err)
                return callback(err);
            console.log(`Product ${order} updated`);
            callback();
        });
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
        console.log("model.orderLines.value=", model.orderLines.value, "converted to=", orderLines);
        const order = new Order(model.orderId.value, model.requesterId.value, model.senderId.value, model.shipToAddress.value, OrderStatus.CREATED, orderLines);
        console.log("model ", model, "order ", order);
        return order;
    }

    /**
     * reads the product information (the /info path) from a given gtin (if exists and is registered to the mah)
     * @param {string} orderId
     * @param {function(err, Product)} callback
     */
    getOne(orderId, callback) {
        this.storage.getObject(`${this._getMountPath(orderId)}${INFO_PATH}`, (err, order) => {
            if (err)
                return callback(err);
            callback(undefined, order);
        });
    }

    /**
     * Lists all issued orders.
     * @param {boolean} [readDSU] defaults to true. decides if the manager loads and reads from the dsu's {@link INFO_PATH} or not
     * @param {object} [options] query options. defaults to {@link DEFAULT_QUERY_OPTIONS}
     * @param {function(err, Order[])} callback
     */
     listIssued(readDSU, options, callback) {
        const defaultOptions = () => Object.assign({}, DEFAULT_QUERY_OPTIONS, {
            query: ['orderId like /.*/g']
        });

        if (!callback){
            if (!options){
                callback = readDSU;
                options = defaultOptions();
                readDSU = true;
            }
            if (typeof readDSU === 'boolean'){
                callback = options;
                options = defaultOptions();
            }
            if (typeof readDSU === 'object'){
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
     * Creates a blacnk {@link Order} with some specific initializations.
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
     * Removes a order from the list (does not delete/invalidate DSU, simply 'forgets' the reference)
     * @param {string} orderId
     * @param {function(err)} callback
     */
    remove(orderId, callback) {
        let self = this;
        let mount_path = this._getMountPath(orderId);
        self.storage.unmount(mount_path, (err) => {
            if (err)
                return callback(err);
            console.log(`Product ${orderId} removed from mount point ${mount_path}`);
            callback();
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

let orderManager;
/**
 * @param {Archive} dsu
 * @returns {OrderManager}
 */
const getOrderManager = function (dsu) {
    if (!orderManager)
        orderManager = new OrderManager(dsu);
    return orderManager;
}

module.exports = getOrderManager;