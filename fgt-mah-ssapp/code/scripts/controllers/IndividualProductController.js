import { LocalizedController, EVENT_REFRESH, EVENT_SSAPP_HAS_LOADED, EVENT_ACTION, BUTTON_ROLES } from "../../assets/pdm-web-components/index.esm.js";
const {ShipmentLine, utils, Shipment, ShipmentStatus, IndividualProduct} = require('wizard').Model;

export default class IndividualProductController extends LocalizedController{

    initializeModel = () => ({
        individualRef: '',
        identity: {}
    });

    constructor(...args) {
        super(false, ...args);
        super.bindLocale(this, 'individualProduct');
        this.model = this.initializeModel();
        this._updateStatuses(IndividualProduct);
        const wizard = require('wizard');
        const participantManager = wizard.Managers.getParticipantManager();
        this.issuedShipmentManager = wizard.Managers.getIssuedShipmentManager(participantManager);
        this.receivedShipmentManager = wizard.Managers.getReceivedShipmentManager(participantManager);
        this.stockManager = wizard.Managers.getStockManager(participantManager);
        this.productEl = this.element.querySelector('managed-individual-product');

        let self = this;

        self.on(EVENT_REFRESH, (evt) => {
            evt.preventDefault();
            evt.stopImmediatePropagation();

        }, {capture: true});

        self.on(EVENT_ACTION, async (evt) => {
            evt.preventDefault();
            evt.stopImmediatePropagation();

        });
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

    async _handleUpdateIndividualProduct(product, newStatus){
        const self = this;
        const oldStatus = product.status;
        product.status = newStatus;
        const errors = product.validate(oldStatus);
        if (errors)
            return self.showErrorToast(self.translate(`manage.error.invalid`, errors.join('\n')));

        const alert = await self.showConfirm('manage.confirm', product.status, newStatus);

        const {role} = await alert.onDidDismiss();

        if (BUTTON_ROLES.CONFIRM !== role)
            return console.log(`Shipment update canceled by clicking ${role}`);

        const loader = self._getLoader(self.translate('manage.loading'));
        await loader.present();

        const sendError = async function(msg){
            await loader.dismiss();
            self.showErrorToast(msg);
        }

        self.issuedShipmentManager.update(product, async (err, updatedShipment) => {
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