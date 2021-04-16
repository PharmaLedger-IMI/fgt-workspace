import LocalizedController from "./LocalizedController.js";

/**
 * List all the received orders, and allows refresh from inbox.
 */
export default class ReceivedOrdersController extends LocalizedController {
    getModel = () => ({
        pharmacy: undefined,
        orders: []
    }); // uninitialized blank model

    constructor(element, history) {
        super(element, history);
        super.bindLocale(this, "receivedOrders");
        const wizard = require('wizard');

        this.participantManager = wizard.Managers.getParticipantManager();
        this.receivedOrderManager = wizard.Managers.getReceivedOrderManager(this.participantManager);

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
            self.getAll();
        }, {capture: true});

        // pressing "NEW" to create a new received Order
        self.onTagClick("refreshMessages", () => {
            console.log("REFRESH button pressed");
            self.receivedOrderManager.processMessages();
        });
    }

    /**
     * Updates the received orders model
     * @param {object[]} orders.
     */
    update(orders) {
        this.model['orders'] = orders;
    }

    /**
     * Retrieves the received orders from the DSU and updates the model
     * by calling {@link ReceivedOrdersController#updatereceived} after retrieval
     */
     getAll() {
        let self = this;
        self.receivedOrderManager.getAll(true, (err, orders) => {
            console.log("getAll got orders ", orders);
            if (err)
                return self.showError(err);
            self.update(orders);
        });
    }
}

