import {EVENT_SEND_ERROR, LocalizedController} from "../../assets/pdm-web-components/index.esm.js";
const Batch = require('wizard').Model.Batch;

export default class BatchesController extends LocalizedController {

    getModel = () => ({});

    constructor(element, history) {
        super(element, history);
        const wizard = require('wizard');
        const LocaleService = wizard.Services.WebcLocaleService;
        LocaleService.bindToLocale(this,"batches");
        this.participantManager = wizard.Managers.getParticipantManager();
        this.batchManager = wizard.Managers.getBatchManager(this.participantManager);

        this.model = this.getModel();

        let self = this;

        self.on('refresh', (evt) => {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            self.element.querySelector('pdm-ion-table').refresh();
        }, {capture: true});

        self.on(EVENT_SEND_ERROR, (evt) => {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            self.showErrorToast(evt);
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