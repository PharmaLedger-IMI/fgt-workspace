import {LocalizedController, EVENT_REFRESH} from "../../assets/pdm-web-components/index.esm.js";

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
        super.bindLocale(this, 'receivedOrder');
        this.model = this.initializeModel();
        let self = this;
        self.on(EVENT_REFRESH, (evt) => {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            const state = self.getState();
            if (state && state.orderId&& state.requesterId){
                self.setState(undefined);
                self.model.orderReference = `${state.requesterId}-${state.orderId}`
            } else {
                self.showErrorToast(`No Order Received`);
            }
        }, {capture: true});

        self.on(ShipmentStatus.CREATED, self.createShipment.bind(self), {capture: true});
        self.on(ShipmentStatus.REJECTED, self.createShipment.bind(self), {capture: true});
    }

    createShipment(evt){
        evt.preventDefault();
        evt.stopImmediatePropagation();
        const {shipmentId, requesterId, senderId, shipToAddress, status, shipmenLines} = evt.detail;
        const shipment = new Shipment(shipmentId, requesterId, senderId, shipToAddress, status, shipmenLines);
        super.navigateToTab('tab-shipment', shipment);
    }
}