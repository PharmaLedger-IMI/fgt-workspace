import { LocalizedController, EVENT_REFRESH, EVENT_SSAPP_HAS_LOADED } from "../../assets/pdm-web-components/index.esm.js";

export default class ShipmentController extends LocalizedController{

    initializeModel = () => ({
        shipmentRef: undefined,
        orderRef: undefined,
        identity: undefined,
        mode: undefined,
        lines: []
    });

    constructor(...args) {
        super(false, ...args);
        super.bindLocale(this, 'shipment');
        this.model = this.initializeModel();
        const wizard = require('wizard');
        const participantManager = wizard.Managers.getParticipantManager();
        this.issuedShipmentManager = wizard.Managers.getIssuedShipmentManager(participantManager);
        this.receivedShipmentManager = wizard.Managers.getReceivedShipmentManager(participantManager);
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
                    self.model.order = state.order;
                    self.model.shipmentRef = undefined;
                    self.model.lines = [];
                    return;
                }

                const newRef = `${state.mode === 'issued' ? state.shipment.senderId : state.shipment.requesterId}-${state.shipment.shipmentId}`;
                if (newRef === self.model.shipmentRef)
                    return self.shipmentEl.refresh();
                self.model.shipmentRef = newRef;
                self.model.lines = [];

            } else {
                self.model.shipmentRef = undefined;
                self.mode = 'issued';
                self.model.lines = state && state.shipmentLines ? [...state.shipmentLines] : [];
            }
        }, {capture: true});

        self.on(EVENT_SSAPP_HAS_LOADED, async () => {
            await self.shipmentEl.updateDirectory();
        }, {capture: true});
    }
}