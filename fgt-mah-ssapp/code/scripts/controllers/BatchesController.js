import {EVENT_SEND_ERROR, LocalizedController} from "../../assets/pdm-web-components/index.esm.js";
const Batch = require('wizard').Model.Batch;

export default class BatchesController extends LocalizedController {

    initializeModel = () => ({});

    constructor(element, history) {
        super(element, history, false);
        const wizard = require('wizard');
        const LocaleService = wizard.Services.WebcLocaleService;
        LocaleService.bindToLocale(this,"batches");
        this.participantManager = wizard.Managers.getParticipantManager();
        this.batchManager = wizard.Managers.getBatchManager(this.participantManager);

        this.model = this.initializeModel();

        let self = this;

        self.on('refresh', (evt) => {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            self.element.querySelector('pdm-ion-table').refresh();
        }, {capture: true});
    }

    /**
     *
     * @param batch
     * @param callback
     * @private
     */
    _addBatch(batch, callback){
        let self = this;
        self.batchManager.create(batch, (err, keySSI, path) => {
            if (err)
                return callback(err);
            callback();
        });
    }
}