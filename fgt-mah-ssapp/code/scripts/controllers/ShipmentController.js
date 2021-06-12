import { LocalizedController, EVENT_REFRESH } from "../../assets/pdm-web-components/index.esm.js";

export default class ShipmentController extends LocalizedController{

    initializeModel = () => ({
        shipmentReference: '',
        identity: undefined
    });

    constructor(...args) {
        super(false, ...args);
        super.bindLocale(this, 'shipment');
        this.model = this.initializeModel();
        const wizard = require('wizard');
        const participantManager = wizard.Managers.getParticipantManager();
        this.issuedShipmentManager = wizard.Managers.getIssuedShipmentManager(participantManager);
        this.receivedShipmentManager = wizard.Managers.getReceivedShipmentManager(participantManager);

        let self = this;

        self.on(EVENT_REFRESH, (evt) => {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            self.model.identity = self.issuedShipmentManager.getIdentity();
            const state = self.detail();
            if (state && state.shipmentId && state.participantId){
                self.model.shipmentReference = `${state.participantId}-${state.shipmentId}`;
            } else {
                self.showErrorToast(`No Shipment Received`);
            }
        }, {capture: true});
    }
}