import { LocalizedController, EVENT_REFRESH } from "../../assets/pdm-web-components/index.esm.js";

/**
 * List all the orders, and allows the creation of new orders.
 */
export default class ReceivedShipmentsController extends LocalizedController {
    initializeModel = () => ({
        pharmacy: undefined
    }); // uninitialized blank model

    constructor(element, history) {
        super(element, history);
        super.bindLocale(this, "receivedShipments");
        this.model = this.initializeModel();
        const wizard = require('wizard');

        const participantManager = wizard.Managers.getParticipantManager();
        this.receivedShipmentManager = wizard.getReceivedShipmentManager(participantManager);
        this.table = this.element.querySelector('pdm-ion-table');

        let self = this;
        // the HomeController takes care of sending refresh events for each tab.
        this.on(EVENT_REFRESH, (evt) => {
            console.log(evt);
            evt.preventDefault();
            evt.stopImmediatePropagation();
            self.table.refresh();
        }, {capture: true});
    }
 
}