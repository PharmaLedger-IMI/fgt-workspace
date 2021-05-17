import { LocalizedController, EVENT_REFRESH } from "../../assets/pdm-web-components/index.esm.js";

export default class ShipmentController extends LocalizedController{

    initializeModel = () => ({
        shipmentReference: ''
    });

    constructor(element, history) {
        super(element, history);
        super.bindLocale(this, 'processShipment');
        this.model = this.initializeModel();
        const wizard = require('wizard');
        const participantManager = wizard.Managers.getParticipantManager();
        this.issuedShipmentManager = wizard.Managers.getIssuedShipmentManager(participantManager);

        let self = this;

        self.on(EVENT_REFRESH, (evt) => {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            const state = self.getState();
            if (state && state.shipmentId && state.participantId){
                self.setState(undefined);
                self.model.shipmentReference = `${state.participantId}-${state.shipmentId}`;
            } else {
                self.showErrorToast(`No Shipment Received`);
            }
        }, {capture: true});
    }
}