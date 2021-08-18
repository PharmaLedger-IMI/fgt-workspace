import { LocalizedController, HistoryNavigator, EVENT_REFRESH } from "../../assets/pdm-web-components/index.esm.js";

/**
 * List all the orders, and allows the creation of new orders.
 */
export default class ReceivedShipmentsController extends LocalizedController {
    initializeModel = () => ({
        pharmacy: undefined
    }); // uninitialized blank model

    constructor(...args) {
        super(false, ...args);
        super.bindLocale(this, "receivedShipments");
        this.model = this.initializeModel();
        const wizard = require('wizard');

        const participantManager = wizard.Managers.getParticipantManager();
        this.receivedShipmentManager = wizard.Managers.getReceivedShipmentManager(participantManager);
        this.receivedShipmentManager.bindController(this);
        this.table = this.element.querySelector('pdm-ion-table');
        HistoryNavigator.registerTab({
            'tab-received-shipments': this.translate('title')
        })

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