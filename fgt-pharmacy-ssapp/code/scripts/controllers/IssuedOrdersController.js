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

        // pressed "CANCEL" while creating a new Issued Order
        self.on("cancel-new-issued-order", (event) => {
            event.preventDefault();
            event.stopImmediatePropagation();
            self.hideModal();
        }, true);

        // created a new Issued Order with success
        self.on("created-issued-order", (event) => {
            event.preventDefault();
            event.stopImmediatePropagation();
            self.hideModal();
            self.send("refresh"); // force refresh of the listing
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
    }

    /**
     * Updates the issued orders model
     * @param {object[]} orders.
     */
    updateIssued(orders) {
        this.model['orders'] = orders;
    }

    /**
     * Retrieves the issued orders from the DSU and updates the model
     * by calling {@link IssuedOrdersController#updateIssued} after retrieval
     */
     getOrdersAsync() {
        let self = this;
        self.orderManager.listIssued(true, (err, orders) => {
            console.log("getOrdersAsync gotOrders ", orders);
            if (err)
                return self.showError(err);
            self.updateIssued(orders);
        });
    }
}

