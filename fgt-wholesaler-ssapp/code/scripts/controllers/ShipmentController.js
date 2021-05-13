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
                self._initializeShipment(state, (err, shipment) => {
                    if (err)
                        return self.showErrorToast(err);
                    self.model.shipmentReference = `${shipment.requesterId}-${shipment.shipmentId}`;
                });
            } else {
                self.showErrorToast(`No Shipment Received`);
            }
        }, {capture: true});
    }

    _initializeShipment(shipment, callback){
        const self = this;
        self.issuedShipmentManager._bindParticipant(shipment, (err, newShipment) => {
            if (err)
                return callback(`Could not bind Participant to shipment`);
            const errors = newShipment.validate();
            if (!!errors)
                return callback("Invalid Shipment:" + errors.join(', '));
            self.issuedShipmentManager.create(newShipment, (err, keySSI, shipmentLinesSSIs) => {
                if (err)
                    return callback(`Could not create new Shipment, ${err}`);
                callback(undefined, newShipment);
            });
        });
    }
}