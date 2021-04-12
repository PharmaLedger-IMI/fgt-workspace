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
        self.onTagClick(`tryOk`, self._handleTryOk.bind(self));
        self.onTagClick(`tryCancel`, () => { self.closeModals(); });
        //self.on('input-has-changed', self._handleErrorElement.bind(self));

        self._setupBlankOrder();
    }


    /**
     * 
     * @returns a function that validates the order, and if ok, sends an event named create-issued-order with the order.
     */
    _handleTryOk() {
        console.log("_handleTryOk run");
        let self = this;
        if (self.hasErrors()) // bind to this on setting up _handleTry handler
            return this.showErrorToast('There are errors in the form');
        let order = self.orderManager.fromModel(self.getModel());
        let errors = order.validate();
        if (errors) {
            return self.showErrorToast(errors);
        }
        self.send('create-issued-order', order);
    }

    _setupBlankOrder() {
        let self = this;
        self.participantManager.getIdentity((err, participant) => {
            if (err) {
                return self.showErrorToast(err);
            }
            self.model.orderId.value = Math.floor(Math.random() * Math.floor(99999999999)); // TODO sequential unique numbering ? It should comes from the ERP anyway.
            self.model.requesterId.value = participant.id;
            self.model.senderId.value = '';
            self.model.shipToAddress.value = participant.address;
            self.model.orderLines.value = '';
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