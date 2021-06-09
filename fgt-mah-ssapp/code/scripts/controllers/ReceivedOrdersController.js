import { LocalizedController, EVENT_REFRESH } from "../../assets/pdm-web-components/index.esm.js";

/**
 * List all the received orders, and allows refresh from inbox.
 */
export default class ReceivedOrdersController extends LocalizedController {
    initializeModel = () => ({}); // creates a new uninitialized blank model

    constructor(...args) {
        super(false, ...args);
        super.bindLocale(this, "receivedOrders");
        this.model = this.initializeModel();
        const wizard = require('wizard');
        const participantManager = wizard.Managers.getParticipantManager();
        this.receivedOrderManager = wizard.Managers.getReceivedOrderManager(participantManager);
        this.receivedOrderManager.bindController(this); // This allows for the manager to 'refresh' the view
        this.table = this.element.querySelector('pdm-ion-table');

        let self = this;
        self.on(EVENT_REFRESH, (evt) => {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            self.table.refresh()
        }, {capture: true});

    }
}

