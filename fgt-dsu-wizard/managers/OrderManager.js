const { INFO_PATH, ISSUED_ORDERS_MOUNT_PATH: ISSUED_ORDERS_MOUNT_PATH, ANCHORING_DOMAIN } = require('../constants');
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
 * @param {Archive} storageDSU the DSU where the storage (mounting) should happen
 */
class OrderManager extends Manager {
    constructor(storageDSU) {
        super(storageDSU);
        this.productService = new (require('../services').OrderService)(ANCHORING_DOMAIN);
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
     * @param {function(err, keySSI, mountPath)} callback where the string is the mount path relative to the main DSU
     */
    create(order, callback) {
        let self = this;
        self.productService.create(order, (err, keySSI) => {
            if (err)
                return callback(err);
            // jpsl technical protest: I disagree with Tiago in coding the mount here.
            // The creation code would be here, but I would write the mount inside ParticipantMager.
            // Having the OrderManager changing mounts inside the Participant DSU violates
            // the encapsulation principle.
            // Tis means that the caller would have to call a ParticipantManager.createOrder(...)
            // nethod (which does not exist). This would also affects all CRUD operations on Order.
            // But Tiago is the architect, so we write things his way.
            let mountPath = this._getMountPath(order.orderId);
            self.storage.mount(mountPath, keySSI.getIdentifier(), (err) => {
                if (err)
                    return callback(err);
                console.log(`Order ${order.orderId} created and mounted at '${mountPath}'`);
                callback(undefined, keySSI, mountPath);
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
        return new Order(model.orderId.value, model.requesterId.value, model.senderId.value, model.shipToAddress.value, OrderStatus.CREATED, orderLines);
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
     * Lists all registered orders
     * @param {function(err, Order[])} callback
     */
     list(callback) {
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
    }

    /**
     * Creates a blacnk {@link Order} with some specific initializations.
     * @param {string} orderId
     * @param {string} orderingTradingPartnerId
     * @param {string} shippingAddress
     * @returns {Order}
     */
    newBlankOrderSync(orderId, orderingTradingPartnerId, shippingAddress) {
        //let orderLine1 = new OrderLine('123', 1, '', '');
        //let orderLine2 = new OrderLine('321', 5, '', '');
        //return new Order(orderId, orderingTradingPartnerId, '', shippingAddress, OrderStatus.CREATED, [orderLine1, orderLine2]);
        return new Order(orderId, orderingTradingPartnerId, '', shippingAddress, OrderStatus.CREATED, []);
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