import ModalController from "../../cardinal/controllers/base-controllers/ModalController.js";

export default class OrderController extends ModalController {
    constructor(element, history) {
        super(element, history);
        const LocaleService = require('wizard').Services.LocaleService;
        LocaleService.bindToLocale(this, LocaleService.supported.en_US, "order");
        this.participantManager = wizard.Managers.getParticipantManager(this.DSUStorage, "traceability");
        this.on('submit-order', this._handleSubmit.bind(this));
    }

    _handleSubmit(event){
        let order = this.participantManager.fromOrderModel(this.model);
        this.send('perform-add-order', order);
    }
}