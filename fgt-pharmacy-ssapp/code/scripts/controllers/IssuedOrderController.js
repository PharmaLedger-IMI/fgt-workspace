import ModalController from "../../cardinal/controllers/base-controllers/ModalController.js";

export default class IssuedOrderController extends ModalController {
    constructor(element, history) {
        super(element, history);
        const wizard = require('wizard');
        const LocaleService = wizard.Services.LocaleService;
        LocaleService.bindToLocale(this, LocaleService.supported.en_US, "issuedOrder");
        const participantManager = wizard.Managers.getParticipantManager();
        this.orderManager = wizard.Managers.getOrderManager(participantManager.getParticipantDSU());
        this.on('submit-issued-order', this._handleSubmit.bind(this));
    }

    _handleSubmit(event){
        let order = this.orderManager.fromModel(this.model);
        this.send('perform-add-issued-order', order);
    }
}