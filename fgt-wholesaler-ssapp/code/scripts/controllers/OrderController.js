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
                if (self.model.orderReference !== "")
                    self.model.orderReference = "";
            }
        }, {capture: true});

        self.on(ShipmentStatus.CREATED, self.createShipmentAsync.bind(self), {capture: true});
        self.on(ShipmentStatus.REJECTED, self.createShipmentAsync.bind(self), {capture: true});
    }

    createShipmentAsync(evt){
        console.log(evt);
        const shipment = new Shipment(evt.detail);
    }
}