import {LocalizedController, EVENT_REFRESH, EVENT_ACTION} from "../../assets/pdm-web-components/index.esm.js";

/**
 * Controls Application Flow
 * Makes the bridge between the UI and the BatchManager
 *
 * Handles data input and validation for the manipulation of Batches
 * @class BatchController
 * @module controllers
 */
export default class BatchController extends LocalizedController {

    initializeModel = () => ({
        gtinBatch: undefined
    });

    constructor(...args) {
        super(false, ...args)
        let self = this;
        super.bindLocale(self, `batch`, false);
        self.model = self.initializeModel();

        const wizard = require('wizard');
        const participantManager = wizard.Managers.getParticipantManager();
        this.batchManager = wizard.Managers.getBatchManager(participantManager);
        this.batchEl = this.element.querySelector('managed-batch');

        self.on(EVENT_REFRESH, (evt) => {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            const state = evt.detail;
            if (state && state.gtin){
                const gtinRef = state.gtin + (state.batchNumber ? `-${state.batchNumber}` : '');
                if (self.model.gtinBatch === gtinRef)
                    return self.batchEl.refresh();
                self.model.gtinBatch = gtinRef;
            } else {
                if (self.model.gtinBatch !== "")
                    self.model.gtinBatch = "";
            }
        }, {capture: true});

        self.on(EVENT_ACTION, (evt) => {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            self._handleCreateBatch.call(self, evt.detail);
        });

        console.log("BatchController initialized");
    }

    _getGtinFromRef(){
        if (!this.model.gtinBatch)
            throw new Error(`No gtin present. Should not happen`);
        return this.model.gtinBatch.split('-')[0];
    }

    /**
     * Sends an event named create-issued-order to the IssuedOrders controller.
     */
    _handleCreateBatch(batch) {
        let self = this;
        if (batch.validate())
            return this.showErrorToast('Invalid Batch');

        self.batchManager.create(this._getGtinFromRef(), batch, (err, keySSI, dbPath) => {
            if (err)
                return self.showErrorToast(`Could not create Batch ${JSON.stringify(batch, undefined, 2)}`, err);
            self.showToast(`Batch ${batch.batchNumber} from ${self._getGtinFromRef()} has been created`);
            self.model.gtinBatch = `${self.model.gtinBatch}-${batch.batchNumber}`;
        });
    }
}