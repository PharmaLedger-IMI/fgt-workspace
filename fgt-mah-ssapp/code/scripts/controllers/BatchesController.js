import {LocalizedController, EVENT_REFRESH} from "../../assets/pdm-web-components/index.esm.js";
const Batch = require('wizard').Model.Batch;

/**
 * Controls Application Flow
 * Makes the bridge between the UI and the BatchManager
 *
 * Handles listing and querying of Batches
 * @class BatchesController
 * @module controllers
 */
export default class BatchesController extends LocalizedController {

    initializeModel = () => ({
        query: ''
    });

    constructor(element, history) {
        super(element, history, false);
        super.bindLocale(this, "batches");
        const wizard = require('wizard');
        this.model = this.initializeModel();
        this.participantManager = wizard.Managers.getParticipantManager();
        this.batchManager = wizard.Managers.getBatchManager(this.participantManager);

        let self = this;

        self.onTagEvent('add-batch', 'click', () => {
            self._showBatchModal(this.model.query);
        });

        self.onTagEvent('cancel-create-batch', 'click', () => {
            self.hideModal();
        });

        self.on('create-batch',  (evt) => {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            self._addBatchAsync(evt.detail);
        });

        self.on(EVENT_REFRESH, (evt) => {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            const state = self.getState();
            if (state && state.gtin){
                self.setState(undefined);
                self.model.query = state.gtin;
            } else {
                if (self.model.query !== "")
                    self.model.query = "";
                else
                    self.element.querySelector('pdm-ion-table').refresh();
            }
        }, {capture: true});
    }

    _showBatchModal(gtin){
        this.createWebcModal({
            template: "batchModal",
            controller: "BatchController",
            state: {gtin: gtin},
            disableBackdropClosing: false,
            disableFooter: true,
            disableHeader: true,
            disableExpanding: true,
            disableClosing: true,
            disableCancelButton: true,
            expanded: false,
            centered: true
        });
    }

    /**
     *
     * @param batch
     * @param callback
     * @private
     */
    _addBatchAsync(batch, callback){
        let self = this;
        if (!this.query)
            return callback(`No gtin defined`);
        self.batchManager.create(this.query, batch, (err, keySSI, path) => {
            if (err)
                return self.showErrorToast(`Could not create Batch ${JSON.stringify(batch, undefined, 2)}`, err);
            self.hideModal();
            self.showToast(`Batch ${batch.batchNumber} for Product ${self.query} has been created`);
            self.send(EVENT_REFRESH);
        });
    }
}