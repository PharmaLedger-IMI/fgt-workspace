import {LocalizedController, EVENT_REFRESH, BUTTON_ROLES} from "../../assets/pdm-web-components/index.esm.js";

const {ShipmentStatus, Shipment} = require('wizard').Model;

/**
 * Controls Application Flow
 * Makes the bridge between the UI and the BatchManager
 *
 * Handles listing and querying of Batches
 * @class BatchesController
 * @module controllers
 */
export default class OrderController extends LocalizedController {

    initializeModel = () => ({
        orderReference: ''
    });

    constructor(element, history) {
        super(element, history, false);
        super.bindLocale(this, 'createShipment');
        this.model = this.initializeModel();
        const wizard = require('wizard');
        const participantManager = wizard.Managers.getParticipantManager();
        this.receivedOrderManager = wizard.Managers.getReceivedOrderManager(participantManager);
        this.issuedShipmentManager = wizard.Managers.getIssuedShipmentManager(participantManager);
        let self = this;
        self.on(EVENT_REFRESH, (evt) => {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            const state = self.getState();
            if (state && state.orderId && state.requesterId){
                self.setState(undefined);
                self.model.orderReference = `${state.requesterId}-${state.orderId}`
            } else {
                self.showErrorToast(`No Order Received`);
            }
        }, {capture: true});

        self.on(ShipmentStatus.CREATED, self._createShipment.bind(self), {capture: true});
        self.on(ShipmentStatus.REJECTED, self._createShipment.bind(self), {capture: true});
    }

    async _showConfirm(){
        return this.showAlert(this.translate('creation.confirm.message'),
            {
                buttons: [
                    {
                        text: this.translate('creation.confirm.buttons.cancel'),
                        role: 'cancel'
                    },
                    {
                        text: this.translate('creation.confirm.buttons.ok'),
                        role: 'confirm'
                    }
                ]
            })
    }

    async _createShipment(evt){
        evt.preventDefault();
        evt.stopImmediatePropagation();
        const self = this;

        const alert = await self._showConfirm();

        const {role} = await alert.onDidDismiss();

        if (BUTTON_ROLES.CONFIRM !== role)
            return console.log(`Shipment creation canceled by clicking ${role}`);

        const loader = self._getLoader(self.translate('creation.loading'));
        await loader.present()

        const sendError = async function(msg){
            await loader.dismiss();
            self.showErrorToast(msg);
        }

        const {shipmentId, requesterId, senderId, shipToAddress, status, shipmentLines} = evt.detail;
        const shipment = new Shipment(shipmentId, requesterId, senderId, shipToAddress, status, shipmentLines);

        self.receivedOrderManager.getOne(self.model.orderReference, false, (err, orderSSI) => {
            if (err)
                return callback(err);
            self.issuedShipmentManager._bindParticipant(shipment, (err, newShipment) => {
                if (err)
                    return sendError(self.translate('creation.error.bind'));
                const errors = newShipment.validate();
                if (!!errors)
                    return sendError(self.translate('creation.error.invalid') + errors.join(', '));
                self.issuedShipmentManager.create(orderSSI, newShipment, async (err, keySSI, shipmentLinesSSIs) => {
                    if (err)
                        return sendError(`${self.translate('creation.error.error')}${err}`);
                    self.showToast(self.translate('creation.success'));
                    await loader.dismiss();
                    const props = {
                        shipmentId: newShipment.shipmentId,
                        participantId: newShipment.requesterId
                    }
                    super.navigateToTab('tab-shipment', props);
                });
            });
        });
    }
}