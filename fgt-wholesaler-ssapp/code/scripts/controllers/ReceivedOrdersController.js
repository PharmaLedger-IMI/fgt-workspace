import { LocalizedController, EVENT_SEND_ERROR } from "../../assets/pdm-web-components/index.esm.js";

/**
 * List all the received orders, and allows refresh from inbox.
 */
export default class ReceivedOrdersController extends LocalizedController {
    getModel = () => ({}); // creates a new uninitialized blank model

    constructor(element, history) {
        super(element, history);
        const wizard = require('wizard');
        const LocaleService = wizard.Services.WebcLocaleService;
        LocaleService.bindToLocale(this,"receivedOrders");

        this.participantManager = wizard.Managers.getParticipantManager();
        this.receivedOrderManager = wizard.Managers.getReceivedOrderManager(this.participantManager);

        this.setModel(this.getModel());

        let self = this;
        // the HomeController takes care of sending refresh events for each tab.
        self.on('refresh', (evt) => {
            console.log(evt);
            evt.preventDefault();
            evt.stopImmediatePropagation();
            self.element.querySelector('pdm-ion-table').refresh()
        }, {capture: true});

        self.on(EVENT_SEND_ERROR, (evt) => {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            self.showErrorToast(evt);
        }, {capture: true});

        // pressing "NEW" to create a new received Order
        self.onTagClick("refreshMessages", () => {
            console.log("REFRESH button pressed");
            // scan pending messages
            self.receivedOrderManager.processMessages( (err) => {
                if (err)
                    return self.showErrorToast(err);
                self.element.querySelector('pdm-ion-table').refresh()
            });
        });
    }

}

