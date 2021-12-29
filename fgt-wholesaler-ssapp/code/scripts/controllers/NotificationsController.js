import {LocalizedController, EVENT_REFRESH, HistoryNavigator} from "../../assets/pdm-web-components/index.esm.js";

/**
 * List all the orders, and allows the creation of new orders.
 */
export default class NotificationsController extends LocalizedController {
    initializeModel = () => ({});

    constructor(...args) {
        super(false, ...args);
        super.bindLocale(this, "notifications");
        const wizard = require('wizard');

        const participantManager = wizard.Managers.getParticipantManager();
        this.notificationManager = wizard.Managers.getNotificationManager(participantManager);
        this.notificationManager.bindController(this);
        let self = this;
        this.model = this.initializeModel();
        HistoryNavigator.registerTab({
            'tab-notifications': this.translate('title')
        })

        this.on(EVENT_REFRESH, (evt) => {
            let notification = evt.detail;
            self._handleNotifications.call(self,notification);
            evt.preventDefault();
            evt.stopImmediatePropagation();
            self.element.querySelector('pdm-ion-table-default').refresh();
        }, {capture: true});
    }

    _handleNotifications(notification){
        const self = this;   
    }
}

