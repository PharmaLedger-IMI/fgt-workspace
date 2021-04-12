import LocalizedController from "./LocalizedController.js";

/**
 * List all the orders, and allows the creation of new orders.
 */
export default class IssuedOrdersController extends LocalizedController {
    getModel = () => ({
        pharmacy: undefined,
        orders: []
    }); // uninitialized blank model

    constructor(element, history) {
        super(element, history);
        super.bindLocale(this, "issuedOrders");
        const wizard = require('wizard');

        this.participantManager = wizard.Managers.getParticipantManager();
        this.orderManager = wizard.Managers.getOrderManager(this.participantManager);

        this.setModel(this.getModel());

        this.model.addExpression('hasOrders', () => {
            return this.model.orders && this.model.orders.length > 0;
        }, 'orders');

        let self = this;
        // the HomeController takes care of sending refresh events for each tab.
        self.on('refresh', (evt) => {
            console.log(evt);
            evt.preventDefault();
            evt.stopImmediatePropagation();
            self.getOrdersAsync();
        }, {capture: true});

        // pressing "NEW" to create a new Issued Order
        self.onTagClick("new-issued-order", () => {
            self._showOrderModal();
        });

        // pressing "CANCEL" while creating a new Issued Order
        self.on("cancel-new-issued-order", (event) => {
            event.preventDefault();
            event.stopImmediatePropagation();
            self.hideModal();
        }, true);

        // pressing "OK" while creating a new Issued Order
        self.on("create-issued-order", (event) => {
            event.preventDefault();
            event.stopImmediatePropagation();
            self.createIssuerOrder(event.detail, (err) => {
                if (err)
                    self.showErrorToast(err);
            });
        }, true);
    }

    _showOrderModal() {
        let self = this;
        // this.showIonicModal("a-generic-configurable-modal", false, {page: "registration"});
        self.createWebcModal({
            template: "issuedOrderModal",
            controller: "IssuedOrderController",
            disableBackdropClosing: true,
            disableFooter: true,
            disableHeader: true,
            disableExpanding: true,
            disableClosing: true,
            disableCancelButton: true,
            expanded: false,
            centered: true
        });
        /*
        self.participantManager.newBlankOrder(self.orderManager, (err, order) => {
            if (err)
                return this.showError(err);
            self.showModal('issued-order-modal', self.orderManager.toModel(order), true);
        });
        */
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
    }

    /**
     * Retrieves the orders from the DSU and updates the model
     * by calling {@link OrdersController#updateOrders} after retrieval
     */
    getOrdersAsync() {
        let self = this;
        self.orderManager.listIssued((err, orders) => {
            console.log("getOrdersAsync gotOrders ", orders);
            if (err)
                return self.showError(err);
            self.updateOrders(orders);
        });
    }
}