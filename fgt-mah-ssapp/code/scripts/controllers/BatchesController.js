import ContainerController from "../../cardinal/controllers/base-controllers/ContainerController.js";
import {getProductManager} from "../managers/ProductManager.js";
const Batch = require('wizard').Model.Batch;

export default class BatchesController extends ContainerController {
    constructor(element, history) {
        super(element, history);
        const wizard = require('wizard');
        const LocaleService = wizard.Services.LocaleService;
        LocaleService.bindToLocale(this, LocaleService.supported.en_US, "batches");
        this.productManager = getProductManager(this.DSUStorage);

        let self = this;
        this.on('add-batch', (event) => {
            event.stopImmediatePropagation();
            self._showBatchModal();
        });

        this.on('perform-add-batch', (event) => {
            event.stopImmediatePropagation();
            self._addBatchAsync(event.detail, (err) => {
                if (err)
                    throw err;
                self.closeModal('batch-modal');
                self.getBatchesAsync();
            });
        });

        this.model.addExpression('hasBatches', () => {
            return typeof this.model.batches !== 'undefined' && this.mode.batches.length > 0;
        }, 'batches');


    }

    _showBatchModal(){
        let self = this;
        self.idManager.getId((err, actor) => {
            if (err)
                throw err;
            self.showModal('batch-modal', this.batchManager.batchToModel(new Batch({
                manufName: actor.name
            })), true);
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
        self.productManager.addBatch(model.gtin, batch, (err, keySSI), mount => {
            if (err)
                return callback(err);
            callback();
        });
    }
}