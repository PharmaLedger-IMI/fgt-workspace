import { LocalizedController, HistoryNavigator, EVENT_REFRESH, EVENT_ACTION, EVENT_SSAPP_HAS_LOADED, BUTTON_ROLES } from "../../assets/pdm-web-components/index.esm.js";
const {OrderStatus} = require('wizard').Model;


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
        const {Order} = wizard.Model;
        self._updateStatuses(Order);

        const participantManager = wizard.Managers.getParticipantManager();
        self.issuedOrderManager = wizard.Managers.getIssuedOrderManager(participantManager);
        self.issuedOrderManager.bindController(self);
        self.orderEl = self.querySelector('managed-order');
        HistoryNavigator.registerTab({
            'tab-order': this.translate('title')
        })

        self.orderEl.updateDirectory();

        self.on(EVENT_REFRESH, (evt) => {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            self.model.identity = self.issuedOrderManager.getIdentity();

            const state = evt.detail;
            self.model.back = this.translate('back', state.previousTab.label);
            if (state && state.mode && state.order) {
                self.model.mode = state.mode;
                const newRef = `${state.mode === 'issued' ? state.order.senderId : state.order.requesterId}-${state.order.orderId}`;
                if (newRef === self.model.orderRef)
                    return self.orderEl.refresh();
                self.model.orderRef = newRef;

            } else {
                self.mode = 'issued';
                self.model.orderRef = '';
                self.model.orderLines = JSON.stringify(state && state.orderLines ? [...state.orderLines] : []);
            }
        });

        self.on(EVENT_ACTION, async (evt) => {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            const {action, props} = evt.detail;
            switch (action){
                case OrderStatus.CREATED:
                    return await self._handleCreateOrder.call(self, props);
                default:
                    const {newStatus, order} = props;
                    return await self._handleUpdateOrderStatus.call(self, order, newStatus);
            }
        });

        console.log("OrderController initialized");
    }

    _updateStatuses(clazz){
        if (!clazz.getAllowedStatusUpdates)
            throw new Error("Invalid Class provided")
        const obj = this.model.toObject().statuses;
        this.model.statuses = Object.keys(obj).reduce((accum, state) => {
            accum[state].paths = clazz.getAllowedStatusUpdates(state);
            return accum;
        }, obj);
    }

    async _handleUpdateOrderStatus(order, newStatus){
        const self = this;

        const oldStatus = order.status;
        order.status = newStatus;
        const errors = order.validate(oldStatus);
        if (errors)
            return self.showErrorToast(self.translate(`manage.error.invalid`, errors.join('\n')));

        const alert = await self.showConfirm('manage.confirm', oldStatus, newStatus);

        const {role} = await alert.onDidDismiss();

        if (BUTTON_ROLES.CONFIRM !== role)
            return console.log(`Order update canceled by clicking ${role}`);

        const loader = self._getLoader(self.translate('manage.loading'));
        await loader.present();

        const sendError = async function(msg){
            await loader.dismiss();
            self.showErrorToast(msg);
        }

        self.issuedOrderManager.update(order, async (err, updatedOrder) => {
            if (err)
                return sendError(self.translate('manage.error.error'));
            self.showToast(self.translate('manage.success'));
            self.refresh({
                mode: 'issued',
                order: updatedOrder
            });
            await loader.dismiss();
        });
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

    async showConfirm(action = 'create.confirm', ...args){
        return super.showConfirm(this.translate(`${action}.message`, ...args),
            this.translate(`${action}.buttons.ok`),
            this.translate(`${action}.buttons.cancel`));
    }
}