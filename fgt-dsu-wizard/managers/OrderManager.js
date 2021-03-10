const {ORDER_MOUNT_PATH, ANCHORING_DOMAIN} = require('./constants');
const Manager = require('./Manager')
const Order = require('../model').Order;
const OrderStatus = require('../model').OrderStatus;
/**
 * Product Manager Class
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
class OrderManager extends Manager{
    constructor(storageDSU) {
        super(storageDSU);
        this.productService = new (require('../services').OrderService)(ANCHORING_DOMAIN);
    }

    /**
     * Returns the mount path for a given orderId
     * @private
     */
    _getMountPath(orderId){
        // jpsl technical protest: I disagree with Tiago in coding the mount path here. See create().
        return `${ORDER_MOUNT_PATH}/${orderId}`;
    }

    /**
     * Creates a blacnk {@link Order} with some specific initializations.
     * @param {string} orderId
     * @param {string} orderingTradingPartnerId
     * @returns {Order}
     */
     newBlankOrderSync(orderId, orderingTradingPartnerId) {
        return new Order(orderId, orderingTradingPartnerId, '', '', OrderStatus.CREATED, []);
    }

    /**
     * Creates a {@link Order} dsu
     * @param {Order} order
     * @param {function(err, keySSI, string)} callback where the string is the mount path relative to the main DSU
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
            let mount_path = this._getMountPath(order.orderId);
            self.storage.mount(mount_path, keySSI.getIdentifier(), (err) => {
                if (err)
                    return callback(err);
                console.log(`Order ${order.orderId} created and mounted at '${mount_path}'`);
                callback(undefined, keySSI, mount_path);
            });
        });
    }

    /**
     * reads the product information (the /info path) from a given gtin (if exists and is registered to the mah)
     * @param {string} orderId
     * @param {function(err, Product)} callback
     */
    getOne(orderId, callback){
        this.storage.getObject(`${this._getMountPath(orderId)}/info`, (err, order) => {
            if (err)
                return callback(err);
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
     * Edits/Overwrites the product details
     * @param {string} order
     * @param {function(err)} callback
     */
    edit(order, callback) {
        let self = this;
        let mount_path = this._getMountPath(order.orderId);
        self.storage.writeFile(`${mount_path}/info`, order, (err) => {
            if (err)
                return callback(err);
            console.log(`Product ${order} updated`);
            callback();
        });
    }

    /**
     * Lists all registered orders
     * @param {function(err, Order[])} callback
     */
    list(callback) {
        super.listMounts(ORDER_MOUNT_PATH, (err, mounts) => {
            if (err)
                return callback(err);
            console.log(`Found ${mounts.length} products at ${ORDER_MOUNT_PATH}`);
            mounts = mounts.map(m => {
                m.gtin = m.path;
                m.path = `${ORDER_MOUNT_PATH}/${m.path}`;
                return m;
            });
            super.readAll(mounts, callback);
        });
    }

    /**
     *
     * @param model
     * @returns {Order}
     */
    fromModel(model){
        return new Order(model.orderId.value, model.requesterId.value, model.senderId.value, model.shipToAddress.value, OrderStatus.CREATED, []);
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