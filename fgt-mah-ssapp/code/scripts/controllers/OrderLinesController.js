import { LocalizedController, EVENT_REFRESH} from "../../assets/pdm-web-components/index.esm.js";

/**
 * Controls Application Flow
 * Makes the bridge between the UI and the OrderLineManager
 *
 * Handles listing and querying of Order(line)s
 * @class OrderLinesController
 * @module controllers
 */
export default class OrderLinesController extends LocalizedController {

    initializeModel = () => ({});

    constructor(element, history) {
        super(element, history, false);
        const wizard = require('wizard');
        super.bindLocale(this, "orderLines");
        this.participantManager = wizard.Managers.getParticipantManager();
        this.orderLineManager = wizard.Managers.getOrderLineManager(this.participantManager);
        this.orderLineManager.bindController(this);

        this.model = this.initializeModel();

        let self = this;
        self.on(EVENT_REFRESH, (evt) => {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            self.element.querySelector('pdm-ion-table').refresh();
        }, {capture: true});
    }
}