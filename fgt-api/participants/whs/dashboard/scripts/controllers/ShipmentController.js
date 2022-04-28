import {
    LocalizedController,
    EVENT_REFRESH,
    EVENT_SSAPP_HAS_LOADED,
    EVENT_ACTION,
    BUTTON_ROLES,
    HistoryNavigator
} from "../../assets/pdm-web-components/index.esm.js";
const {ShipmentLine, Order, utils, Shipment, ShipmentStatus} = require('wizard').Model;

export default class ShipmentController extends LocalizedController{

    initializeModel = () => ({
        shipmentRef: '',
        order: "{}",
        identity: {},
        mode: 'issued'
    });

    constructor(...args) {
        super(false, ...args);
        super.bindLocale(this, 'shipment');
        this.model = this.initializeModel();
        this._updateStatuses(Shipment);
        const wizard = require('wizard');
        const participantManager = wizard.Managers.getParticipantManager();
        this.issuedShipmentManager = wizard.Managers.getIssuedShipmentManager(participantManager);
        this.receivedShipmentManager = wizard.Managers.getReceivedShipmentManager(participantManager);
        this.issuedShipmentManager.bindController(this);
        this.receivedShipmentManager.bindController(this);
        this.stockManager = wizard.Managers.getStockManager(participantManager);
        this.shipmentEl = this.element.querySelector('managed-simple-shipment ');
        HistoryNavigator.registerTab({
            'tab-shipment': this.translate('title')
        })

        let self = this;
        self.model.identity = self.issuedShipmentManager.getIdentity();

        self.on(EVENT_REFRESH, (evt) => {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            self.shipmentEl.updateDirectory();
            const state = evt.detail;
            const label = !!state.previousTab ? state.previousTab.label : HistoryNavigator.getPreviousTab().label;
            self.model.back = this.translate('back', label);
            if (state && state.mode) {
                this._updateStatuses(state.mode === ShipmentStatus.ISSUED ? Shipment : Order);
                const newRef = state.shipment.shipmentId;
                self.mode = state.mode;
                if (newRef === self.model.shipmentRef)
                    return self.shipmentEl.refresh();
                self.model.shipmentRef = newRef;
            } else {
                self._updateStatuses(Shipment);
                self.mode = 'issued';
                self.model.shipmentRef = '';
            }
        }, {capture: true});

        self.on(EVENT_ACTION, async (evt) => {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            const {action, props} = evt.detail;
            const {shipment} = props;
            switch (action){
                case ShipmentStatus.CREATED:
                    const {stock, orderId} = props;
                    return await self._handleCreateShipment.call(self, shipment, stock, orderId);
                default:
                    const {newStatus, extraInfo} = props;
                    return await self._handleUpdateShipmentStatus.call(self, shipment, newStatus, extraInfo);
            }
        });
    }

    _updateStatuses(clazz){
        if (!clazz.getAllowedStatusUpdateFromOrder)
            throw new Error("Invalid Class provided")
        const obj = this.model.toObject().statuses;
        this.model.statuses = Object.keys(obj).reduce((accum, state) => {
            accum[state].paths = clazz.getAllowedStatusUpdateFromOrder(state);
            return accum;
        }, obj);
    }

    async _handleUpdateShipmentStatus(shipment, newStatus, extraInfo){
        const self = this;
        const oldStatus = shipment.status.status;
        const oldExtraInfo = shipment.status.extraInfo;
        shipment.status['status'] = newStatus;
        shipment.status['extraInfo'] = extraInfo;
        const errors = shipment.validate(oldStatus);
        if (errors) {
            shipment.status['status'] = oldStatus; // rollback
            shipment.status['extraInfo'] = oldExtraInfo;
            return self.showErrorToast(self.translate(`manage.error.invalid`, errors.join('\n')));
        }

        const loader = self._getLoader(self.translate('manage.loading'));
        await loader.present();

        const sendError = async function(msg){
            await loader.dismiss();
            self.showErrorToast(msg);
        }

        self.issuedShipmentManager.update(shipment, async (err, updatedShipment) => {
            if (err)
                return sendError(self.translate('manage.error.error'));
            self.showToast(self.translate('manage.success'));
            self.refresh({
                mode: 'issued',
                shipment: updatedShipment
            });
            await loader.dismiss();
        });
    }

    /**
     * Sends an event named create-issued-order to the IssuedOrders controller.
     */
    async _handleCreateShipment(shipment, stockInfo, shipmentId) {
        let self = this;
        shipment.shipmentId = shipment.shipmentId || shipmentId || Date.now();
        shipment.shipFromAddress = self.model.identity.address;

        utils.confirmWithStock(self.stockManager, shipment, stockInfo, async (err, confirmedShipment) => {
            if (err)
                return self.showErrorToast(self.translate(`create.error.stock`, err));
            const errors = confirmedShipment.validate();
            if (errors)
                return self.showErrorToast(self.translate(`create.error.invalid`, errors.join('\n')));

            const alert = await self.showConfirm('create.confirm', confirmedShipment.requesterId);

            const {role} = await alert.onDidDismiss();

            if (BUTTON_ROLES.CONFIRM !== role)
                return console.log(`Shipment creation canceled by clicking ${role}`);

            const loader = self._getLoader(self.translate('create.loading'));
            await loader.present();

            const sendError = async function(msg){
                await loader.dismiss();
                self.showErrorToast(msg);
            }

            self.issuedShipmentManager.create(shipmentId, confirmedShipment,  async (err, keySSI, dbPath) => {
                if (err)
                    return sendError(self.translate('create.error.error'));
                self.showToast(self.translate('create.success'));
                self.model.mode = 'issued';
                self.model.shipmentRef = confirmedShipment.shipmentId;
                await loader.dismiss();
            });
        });
    }

    async showConfirm(action = 'create.confirm', ...args){
        return super.showConfirm(this.translate(`${action}.message`, ...args),
            this.translate(`${action}.buttons.ok`),
            this.translate(`${action}.buttons.cancel`));
    }

    async _showPopup(message = 'create.confirm', popupOptions, callback, ...args){
        return super.showPopup({
            message: this.translate(`${message}.message`, ...args),
            confirmButtonLabel: this.translate(`${message}.buttons.ok`),
            cancelButtonLabel: this.translate(`${message}.buttons.cancel`),
            options: popupOptions
        }, callback);
    }
}