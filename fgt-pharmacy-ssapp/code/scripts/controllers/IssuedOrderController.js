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
        self.onTagClick(`tryOk`, () => { self._handleTryOk(); });
        self.onTagClick(`tryCancel`, () => { self._handleTryCancel(); });
        //self.on('input-has-changed', self._handleErrorElement.bind(self));

        self._setupBlankOrder();
    }

    /**
     * Sends an event named create-issued-order to the IssuedOrders controller.
     */
     _handleTryOk() {
        let self = this;
        if (self.hasErrors())
            return this.showErrorToast('There are errors in the form');
        console.log(self.getModel());
        let order = self.orderManager.fromModel(self.getModel());
        let errors = order.validate();
        if (errors) {
            return self.showErrorToast(errors);
        }
        self.send('create-issued-order', order);
    }

    /**
     * Sends an event named cancel-new-issued-order to the IssuedOrders controller.
     */
     _handleTryCancel() {
        let self = this;
        self.send('cancel-new-issued-order');
    }

    _setupBlankOrder() {
        let self = this;
        /*
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
        */        
        self.orderManager.newBlankOrder( (err, order) => {
            console.log("order", order);
            self.orderManager.toModel(order, self.model);
            console.log("toModel", self.model);
        });
    }

}