import ContainerController from "../../cardinal/controllers/base-controllers/ContainerController.js";

/**
 * List all the orders, and allows the creation of new orders.
 */
export default class IssuedOrdersController extends ContainerController {
    constructor(element, history) {
        super(element, history);
        const wizard = require('wizard');
        const LocaleService = wizard.Services.LocaleService;
        LocaleService.bindToLocale(this, LocaleService.supported.en_US, "issuedOrders");
        this.participantManager = wizard.Managers.getParticipantManager(this.DSUStorage, "traceability");
        this.orderManager = wizard.Managers.getOrderManager(this.participantManager.getParticipantDSU());

        this.model = this.setModel({
            pharmacy: undefined,
            orders: [],
            hasOrders: false
        });

        let self = this;
        this.on('add-issued-order', (event) => {
            event.stopImmediatePropagation();
            self._showOrderModal();
        });

        this.on('perform-add-issued-order', (event) => {
            event.stopImmediatePropagation();
            self._addOrderAsync(event.detail, (err) => {
                if (err)
                    return this.showError(err);
                self.closeModal('issued-order-modal');
                self.getOrdersAsync();
            });
        });

        this.getOrdersAsync();
    }

    _showOrderModal() {
        let self = this;
        self.participantManager.newBlankOrder(self.orderManager, (err, order) => {
            if (err)
                return this.showError(err);
            self.showModal('issued-order-modal', self.orderManager.toModel(order), true);
        });
    }

    /**
     *
     * @param order
     * @param callback
     * @private
     */
    _addOrderAsync(order, callback) {
        let self = this;
        // toggle lines to allow creation of Orders without a partner.
        //self.orderManager.create(order,  order, (err, keySSI, path) => {
        self.participantManager.createIssuedOrder(self.orderManager, order, (err, keySSI, path) => {
            if (err)
                return callback(err);
            callback();
        });
    }

    /**
     * Updates the products model
     * @param {object[]} orders.
     */
    updateOrders(orders) {
        this.model['orders'] = orders;
        this.model['hasOrders'] = orders.length > 0;
    }

    /**
     * Retrieves the orders from the DSU and updates the model
     * by calling {@link OrdersController#updateOrders} after retrieval
     */
    getOrdersAsync() {
        let self = this;
        self.orderManager.list((err, orders) => {
            console.log("getOrdersAsync gotOrders ", orders);
            if (err)
                return self.showError(err);
            self.updateOrders(orders);
        });
    }
}