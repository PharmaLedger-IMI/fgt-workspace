import ModalController from "../../cardinal/controllers/base-controllers/ModalController.js";

export default class ProductController extends ModalController {
    constructor(element, history) {
        super(element, history);
        const wizard = require('wizard');
        const LocaleService = wizard.Services.LocaleService;
        LocaleService.bindToLocale(this, LocaleService.supported.en_US, "product");
        const participantManager = wizard.Managers.getParticipantManager();
        this.productManager = wizard.Managers.getProductManager(participantManager.getParticipantDSU());
        this.on('submit-product', this._handleSubmit.bind(this));
    }

    _handleSubmit(event){
        let product = this.productManager.fromModel(this.model);
        this.send('perform-add-product', product);
    }
}