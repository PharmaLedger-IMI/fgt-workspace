import { LocalizedController, EVENT_REFRESH, EVENT_ACTION, EVENT_SSAPP_HAS_LOADED } from "../../assets/pdm-web-components/index.esm.js";
export default class IssuedOrderController extends LocalizedController {

    initializeModel = () => ({
        orderLines: [],
        requester: undefined
    });

    constructor(element, history) {
        super(element, history);
        let self = this;
        super.bindLocale(self, `issuedOrder`);
        self.model = self.initializeModel();
        const wizard = require('wizard');
        const participantManager = wizard.Managers.getParticipantManager();
        self.issuedOrderManager = wizard.Managers.getIssuedOrderManager(participantManager);

        self.on(EVENT_REFRESH, (evt) => {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            self.model.requester = self.issuedOrderManager.getIdentity();
            self.model.orderLines = evt.detail ? [...evt.detail] : [];
        });

        self.on(EVENT_SSAPP_HAS_LOADED, async () => {
            await self.element.querySelector('managed-issued-order').updateDirectory();
        }, {capture: true});

        self.on(EVENT_ACTION, (evt) => {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            self._handleCreateOrder.call(self, evt.detail);
        });

        console.log("IssuedOrderController initialized");
    }

    /**
     * Sends an event named create-issued-order to the IssuedOrders controller.
     */
     _handleCreateOrder(order) {
        let self = this;
        if (order.validate())
            return this.showErrorToast('invalid Order');

        self.issuedOrderManager.create(order, (err, keySSI, dbPath) => {
            if (err)
                return self.showErrorToast(err);

            self.send('created-issued-order', order);
        });
    }
}