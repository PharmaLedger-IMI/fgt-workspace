import LocalizedController from "./LocalizedController.js";

/**
 * List all the orders, and allows the creation of new orders.
 */
export default class ReceivedShipmentsController extends LocalizedController {
    getModel = () => ({
        pharmacy: undefined,
        shipments: []
    }); // uninitialized blank model

    constructor(element, history) {
        super(element, history);
        super.bindLocale(this, "receivedShipments");
        const wizard = require('wizard');

        this.participantManager = wizard.Managers.getParticipantManager();
        this.receivedShipmentManager = undefined; // wizard.Managers.getIssuedOrderManager(this.participantManager); // change to getReceivedShipmentManager

        this.setModel(this.getModel());

        this.model.addExpression('hasShipments', () => {
            return this.model.shipments && this.model.shipments.length > 0;
        }, 'shipments');

        let self = this;
        // the HomeController takes care of sending refresh events for each tab.
        this.on('refresh', (evt) => {
            console.log(evt);
            evt.preventDefault();
            evt.stopImmediatePropagation();
            self.getReceivedShipmentsAsync();
        }, {capture: true});
    }
 
}