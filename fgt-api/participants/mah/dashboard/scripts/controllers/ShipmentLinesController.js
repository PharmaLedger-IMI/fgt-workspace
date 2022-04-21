import { LocalizedController, HistoryNavigator, EVENT_REFRESH} from "../../assets/pdm-web-components/index.esm.js";

/**
 * Controls Application Flow
 * Makes the bridge between the UI and the ShipmentLineManager
 *
 * Handles listing and querying of Order(line)s
 * @class ShipmentLinesController
 * @module controllers
 */
export default class ShipmentLinesController extends LocalizedController {

    initializeModel = () => ({});

    constructor(...args) {
        super(false, ...args)
        const wizard = require('wizard');
        super.bindLocale(this, "shipmentLines");
        this.model = this.initializeModel();

        this.participantManager = wizard.Managers.getParticipantManager();
        this.shipmentLineManager = wizard.Managers.getShipmentLineManager(this.participantManager);
        this.shipmentLineManager.bindController(this);
        HistoryNavigator.registerTab({
            'tab-shipmentLines': this.translate('title')
        })

        this.table = this.element.querySelector('pdm-ion-table');

        let self = this;
        self.on(EVENT_REFRESH, (evt) => {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            self.table.refresh();
        }, {capture: true});
    }
}