import { LocalizedController, EVENT_REFRESH } from "../../assets/pdm-web-components/index.esm.js";

/**
 * List all the orders, and allows the creation of new orders.
 */
export default class ReceiptsController extends LocalizedController {
    initializeModel = () => ({}); // uninitialized blank model

    constructor(...args) {
        super(false, ...args);
        super.bindLocale(this, "receipts");
        this.model = this.initializeModel();
        const wizard = require('wizard');

        const participantManager = wizard.Managers.getParticipantManager();
        this.receiptManager = wizard.Managers.getReceiptManager(participantManager);
        this.receiptManager.bindController(this);
        this.table = this.element.querySelector('pdm-ion-table-default');

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