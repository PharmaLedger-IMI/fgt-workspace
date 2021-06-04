import { LocalizedController, EVENT_REFRESH } from "../../assets/pdm-web-components/index.esm.js";
const {ShipmentStatus, Shipment} = require('wizard').Model;

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
        this.participantManager = wizard.Managers.getParticipantManager();
        this.receivedOrderManager = wizard.Managers.getReceivedOrderManager(this.participantManager);
        this.receivedOrderManager.bindController(this); // This allows for the manager to 'refresh' the view

        let self = this;
        // the HomeController takes care of sending refresh events for each tab.
        self.on(EVENT_REFRESH, (evt) => {
            console.log(evt);
            evt.preventDefault();
            evt.stopImmediatePropagation();
            self.element.querySelector('pdm-ion-table').refresh()
        }, {capture: true});

    }
}

