import {LocalizedController} from "../../assets/pdm-web-components/index.esm";

/**
 * Controls Application Flow
 * Makes the bridge between the UI and the BatchManager
 *
 * Handles data input and validation for the manipulation of Batches
 * @class BatchController
 * @module controllers
 */
export default class BatchController extends LocalizedController {

    initializeModel = () => ({});

    constructor(...args) {
        super(false, ...args);
        let self = this;
        const wizard = require('wizard').Managers
        super.bindLocale(this, "batch", true);
        let participantManager = wizard.Managers.getParticipantManager();
        this.batchManager = wizard.Managers.getBatchManager(participantManager);
        this.model = self.initializeModel();
        self.onTagClick(`try-create-batch`, self._submitBatch.bind(self));
    }

    _submitBatch = function () {
        let self = this;
        if (self.hasErrors(true))
            return this.showErrorToast('There are errors in the form');
        const product = self.batchManager.fromModel(self.model);
        this.send('create-batch', product);
    }
}