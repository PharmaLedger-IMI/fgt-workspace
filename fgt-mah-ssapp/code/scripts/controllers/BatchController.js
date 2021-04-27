import {LocalizedController} from "../../assets/pdm-web-components/index.esm";
const Managers = require('wizard').Managers

export default class BatchController extends LocalizedController {
    constructor(element, history) {
        super(element, history, false);
        const LocaleService = require('wizard').Services.WebcLocaleService;
        LocaleService.bindToLocale(this, "batch", true);
        let participantManager = Managers.getParticipantManager();
        this.batchManager = Managers.getBatchManager(participantManager);
        this.on('submit-batch', this._handleSubmit.bind(this));
    }

    _handleSubmit(event){
        let batch = this.batchManager.fromModel(this.model);
        this.send('perform-add-batch', batch);
    }
}