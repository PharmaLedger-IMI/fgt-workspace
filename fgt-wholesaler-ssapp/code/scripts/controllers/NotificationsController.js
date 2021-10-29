import {LocalizedController, EVENT_REFRESH, HistoryNavigator} from "../../assets/pdm-web-components/index.esm.js";

/**
 * List all the orders, and allows the creation of new orders.
 */
export default class NotificationsController extends LocalizedController {
    initializeModel = () => ({
       
    }); // uninitialized blank model

    constructor(...args) {
        super(false, ...args);
        super.bindLocale(this, "notifications");
        this.model = this.initializeModel();
        const wizard = require('wizard');

        const participantManager = wizard.Managers.getParticipantManager();
        //this.notificationManager = wizard.Managers.getNotificationManager(participantManager);
        this.table = this.element.querySelector('pdm-ion-table');
        // HistoryNavigator.registerTab({
        //     'tab-issued-orders': this.translate('title')
        // })

        let self = this;
        // the HomeController takes care of sending refresh events for each tab.
        self.on(EVENT_REFRESH, (evt) => {
            console.log(evt);
            evt.preventDefault();
            evt.stopImmediatePropagation();
            self.table.refresh();
        }, {capture: true});

        // // pressing "NEW" to create a new Issued Order
        // self.onTagClick("new-issued-order", () => {
        //     self.navigateToTab('tab-order');
        // });
    }
}

