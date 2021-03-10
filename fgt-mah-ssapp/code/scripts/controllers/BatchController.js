import ModalController from "../../cardinal/controllers/base-controllers/ModalController.js";
const Managers = require('wizard').Managers

export default class BatchController extends ModalController {
    constructor(element, history) {
        super(element, history);
        const LocaleService = require('wizard').Services.LocaleService;
        LocaleService.bindToLocale(this, LocaleService.supported.en_US, "batch");
        let rootDSU = Managers.getParticipantManager(this.DSUStorage);
        this.batchManager = Managers.getBatchManager(rootDSU);
        this.on('submit-batch', this._handleSubmit.bind(this));
    }

    _handleSubmit(event){
        let batch = this.batchManager.fromModel(this.model);
        this.send('perform-add-batch', batch);
    }
}