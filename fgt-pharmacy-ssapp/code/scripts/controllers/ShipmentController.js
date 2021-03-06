import { LocalizedController, EVENT_REFRESH, EVENT_SSAPP_HAS_LOADED, EVENT_ACTION, BUTTON_ROLES } from "../../assets/pdm-web-components/index.esm.js";
const {ShipmentLine, utils} = require('wizard').Model;

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
        const wizard = require('wizard');
        const participantManager = wizard.Managers.getParticipantManager();
        this.issuedShipmentManager = wizard.Managers.getIssuedShipmentManager(participantManager);
        this.receivedShipmentManager = wizard.Managers.getReceivedShipmentManager(participantManager);
        this.stockManager = wizard.Managers.getStockManager(participantManager);
        this.shipmentEl = this.element.querySelector('managed-shipment');

        let self = this;

        self.on(EVENT_REFRESH, (evt) => {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            self.model.identity = self.issuedShipmentManager.getIdentity();

            const state = evt.detail;
            if (state && state.mode) {
                self.model.mode = state.mode;
                if (state.order){
                    self.model.order = JSON.stringify(state.order);
                    self.model.shipmentRef = '';
                    return;
                }

                const newRef = `${state.mode === 'issued' ? state.shipment.requesterId : state.shipment.senderId}-${state.shipment.shipmentId}`;
                if (newRef === self.model.shipmentRef)
                    return self.shipmentEl.refresh();
                self.model.shipmentRef = newRef;
                self.model.order = '{}'

            } else {
                self.model.shipmentRef = '';
                self.mode = 'issued';
                self.order = '{}';
            }
        }, {capture: true});

        self.on(EVENT_SSAPP_HAS_LOADED, async () => {
            await self.shipmentEl.updateDirectory();
        }, {capture: true});

        self.on(EVENT_ACTION, (evt) => {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            const {shipment, stock, orderId} = evt.detail;
            self._handleCreateShipment.call(self, shipment, stock, orderId);
        });
    }

    /**
     * Sends an event named create-issued-order to the IssuedOrders controller.
     */
    async _handleCreateShipment(shipment, stockInfo, orderId) {
        let self = this;
        shipment.shipmentId = Date.now();
        shipment.shipFromAddress = self.model.identity.address;

        utils.confirmWithStock(self.stockManager, shipment, stockInfo, async (err, confirmedShipment) => {
            if (err)
                return self.showErrorToast(self.translate(`create.error.stock`, err));
            const errors = confirmedShipment.validate();
            if (errors)
                return self.showErrorToast(self.translate(`create.error.invalid`, errors.join('\n')));

            const alert = await self.showConfirm('create.confirm', shipment.requesterId);

            const {role} = await alert.onDidDismiss();

            if (BUTTON_ROLES.CONFIRM !== role)
                return console.log(`Shipment creation canceled by clicking ${role}`);

            const loader = self._getLoader(self.translate('create.loading'));
            await loader.present();

            const sendError = async function(msg){
                await loader.dismiss();
                self.showErrorToast(msg);
            }

            self.issuedShipmentManager.create(orderId, shipment,  async (err, keySSI, dbPath) => {
                if (err)
                    return sendError(self.translate('create.error.error'));
                self.showToast(self.translate('create.success'));
                self.model.mode = 'issued';
                self.model.shipmentRef = `${shipment.requesterId}-${shipment.shipmentId}`;
                await loader.dismiss();
            });
        });
    }

    async showConfirm(action = 'create.confirm', ...args){
        return super.showConfirm(this.translate(`${action}.message`, ...args),
            this.translate(`${action}.buttons.ok`),
            this.translate(`${action}.buttons.cancel`));
    }
}