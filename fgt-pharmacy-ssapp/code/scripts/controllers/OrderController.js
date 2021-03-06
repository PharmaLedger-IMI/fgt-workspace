import { LocalizedController, EVENT_REFRESH, EVENT_ACTION, EVENT_SSAPP_HAS_LOADED, BUTTON_ROLES } from "../../assets/pdm-web-components/index.esm.js";
export default class OrderController extends LocalizedController {

    initializeModel = () => ({
        orderLines: JSON.stringify([]),
        identity: {},
        orderRef: '',
        mode: 'issued'
    });

    constructor(...args) {
        super(false, ...args);
        let self = this;
        super.bindLocale(self, `order`);
        self.model = self.initializeModel();

        const wizard = require('wizard');
        const participantManager = wizard.Managers.getParticipantManager();
        self.issuedOrderManager = wizard.Managers.getIssuedOrderManager(participantManager);
        self.orderEl = self.querySelector('managed-order');

        self.on(EVENT_REFRESH, (evt) => {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            self.model.identity = self.issuedOrderManager.getIdentity();

            const state = evt.detail;
            if (state && state.mode && state.order) {
                self.model.mode = state.mode;
                const newRef = `${state.mode === 'issued' ? state.order.senderId : state.order.requesterId}-${state.order.orderId}`;
                if (newRef === self.model.orderRef)
                    return self.orderEl.refresh();
                self.model.orderRef = newRef;

            } else {
                self.model.orderRef = '';
                self.mode = 'issued';
                self.model.orderLines = JSON.stringify(state && state.orderLines ? [...state.orderLines] : []);
            }
        });

        self.on(EVENT_SSAPP_HAS_LOADED, async () => {
            await self.orderEl.updateDirectory();
        }, {capture: true});

        self.on(EVENT_ACTION, async (evt) => {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            await self._handleCreateOrder.call(self, evt.detail);
        });

        console.log("OrderController initialized");
    }

    /**
     * Sends an event named create-issued-order to the IssuedOrders controller.
     */
     async _handleCreateOrder(order) {
        let self = this;
        if (order.validate())
            return this.showErrorToast(this.translate(`create.error.invalid`));

        const alert = await self.showConfirm('create.confirm');

        const {role} = await alert.onDidDismiss();

        if (BUTTON_ROLES.CONFIRM !== role)
            return console.log(`Order creation canceled by clicking ${role}`);

        const loader = self._getLoader(self.translate('create.loading'));
        await loader.present()

        const sendError = async function(msg){
            await loader.dismiss();
            self.showErrorToast(msg);
        }

        self.issuedOrderManager.create(order, async (err, keySSI, dbPath) => {
            if (err)
                return sendError(self.translate('create.error.error'));
            self.showToast(self.translate('create.success'));
            self.model.mode = 'issued';
            self.model.orderRef = `${order.senderId}-${order.orderId}`;
            await loader.dismiss();
        });
    }

    async showConfirm(action = 'create.confirm'){
         return super.showConfirm(this.translate(`${action}.message`),
             this.translate(`${action}.buttons.ok`),
             this.translate(`${action}.buttons.cancel`));
    }
}