import { LocalizedController, EVENT_REFRESH } from "../../assets/pdm-web-components/index.esm.js";

export default class ShipmentController extends LocalizedController{

    initializeModel = () => ({
        shipmentReference: ''
    });

    constructor(...args) {
        super(false, ...args);
        super.bindLocale(this, 'processShipment');
        this.model = this.initializeModel();
        const wizard = require('wizard');
        const participantManager = wizard.Managers.getParticipantManager();
        this.issuedShipmentManager = wizard.Managers.getIssuedShipmentManager(participantManager);

        let self = this;

        self.on(EVENT_REFRESH, (evt) => {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            const state = self.detail();
            if (state && state.shipmentId && state.participantId){
                self.model.shipmentReference = `${state.participantId}-${state.shipmentId}`;
            } else {
                self.showErrorToast(`No Shipment Received`);
            }
        }, {capture: true});
    }
}