import { LocalizedController, EVENT_REFRESH } from "../../assets/pdm-web-components/index.esm.js";

export default class ShipmentController extends LocalizedController{

    initializeModel = () => ({
        shipmentReference: ''
    });

    constructor(element, history) {
        super(element, history);
        super.bindLocale(this, 'issuedShipment');
        this.model = this.initializeModel();
        const wizard = require('wizard');
        const participantManager = wizard.Managers.getParticipantManager();
        this.issuedShipmentManager = wizard.Managers.getIssuedShipmentManager(participantManager);
        let self = this;
        self.on(EVENT_REFRESH, (evt) => {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            const state = self.getState();
            if (state && state.requesterId && state.shipmentLines){
                self.setState(undefined);
                self.model.shipmentReference = `${state.requesterId}-${state.orderId}`
            } else {
                self.showErrorToast(`No Shipment Received`);
            }
        }, {capture: true});
    }
}