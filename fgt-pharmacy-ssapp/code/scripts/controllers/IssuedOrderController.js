import LocalizedController from "./LocalizedController.js";
export default class IssuedOrderController extends LocalizedController {

    getModel = () => ({}); // initial empty model

    constructor(element, history) {
        super(element, history);
        let self = this;
        super.bindLocale(self, `issuedOrder`, true);
        const wizard = require('wizard');
        self.participantManager = wizard.Managers.getParticipantManager();
        self.orderManager = wizard.Managers.getOrderManager(this.participantManager);

        self.setModel(self.getModel());

        console.log("IssuedOrderController initialized");
        /*
        Object.entries(self.getModel().buttons).forEach(b => {
            self.onTagClick(`try${b[0]}`, self._handleTry(`${b[0]}`).bind(self));
        });
        */
        //self.on('input-has-changed', self._handleErrorElement.bind(self));
        self._setupBlankOrder();
    }

    _setupBlankOrder() {
        let self = this;
        self.participantManager.getIdentity( (err, participant) => {
            if (err) {
                return self.showErrorToast(err);
            }
            self.model.orderId.value = Math.floor(Math.random() * Math.floor(99999999999)); // TODO sequential unique numbering ? It should comes from the ERP anyway.
            self.model.requesterId.value = participant.id;
            self.model.shippingAddress.value = participant.address;
            console.log(self.model.toObject());
        });
        /*
        let order = self.orderManager.newBlankOrderSync(
            Math.floor(Math.random() * Math.floor(99999999999)),
            participant.id, 
            participant.address
            );
        self.orderManager.toModel(self.model, order);
        */
    }
}