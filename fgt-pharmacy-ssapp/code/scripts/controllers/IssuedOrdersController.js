import { LocalizedController, EVENT_REFRESH } from "../../assets/pdm-web-components/index.esm.js";

/**
 * List all the orders, and allows the creation of new orders.
 */
export default class IssuedOrdersController extends LocalizedController {
    initializeModel = () => ({
        pharmacy: undefined,
    }); // uninitialized blank model

    constructor(...args) {
        super(false, ...args);
        super.bindLocale(this, "issuedOrders");
        this.model = this.initializeModel();
        const wizard = require('wizard');

        const participantManager = wizard.Managers.getParticipantManager();
        this.issuedOrderManager = wizard.Managers.getIssuedOrderManager(participantManager);
        this.table = this.element.querySelector('pdm-ion-table');

        let self = this;
        // the HomeController takes care of sending refresh events for each tab.
        self.on(EVENT_REFRESH, (evt) => {
            console.log(evt);
            evt.preventDefault();
            evt.stopImmediatePropagation();
            self.table.refresh();
        }, {capture: true});

        // pressing "NEW" to create a new Issued Order
        self.onTagClick("new-issued-order", () => {
            self._showCreateModal();
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
            self.refresh();
        }, true);
    }

    _showCreateModal() {
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
}

