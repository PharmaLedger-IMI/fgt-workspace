import ContainerController from "../../cardinal/controllers/base-controllers/ContainerController.js";
import {getProductManager} from "../managers/ProductManager.js";
import {getBatchManager} from "../managers/BatchManager.js";
const Batch = require('wizard').Model.Batch;

export default class BatchesController extends ContainerController {
    constructor(element, history) {
        super(element, history);
        const wizard = require('wizard');
        const LocaleService = wizard.Services.LocaleService;
        LocaleService.bindToLocale(this, LocaleService.supported.en_US, "batches");
        this.productManager = getProductManager(this.DSUStorage);
        this.batchManager = getBatchManager(this.DSUStorage);

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

        let state = this.History.getState();

        this.model = this.setModel({
            gtin: state.gtin,
            batches: []
        });

        this.model.addExpression('hasBatches', () => {
            return typeof this.model.batches !== 'undefined' && this.model.batches.length > 0;
        }, 'batches');


    }

    _showBatchModal(){
        this.showModal('batch-modal', this.batchManager.toModel(new Batch({
            gtin: this.model.gtin
        })), true);
    }

    /**
     *
     * @param {Batch} batch
     * @param {function(err)} callback
     * @private
     */
    _addBatchAsync(batch, callback){
        let self = this;
        self.productManager.addBatch(this.model.gtin, batch, (err, keySSI, mount) => {
            if (err)
                return callback(err);
            callback();
        });
    }

    /**
     * Updates the batches model
     * @param {object[]} batches where the properties must be:
     * <ul>
     *     <li>*batchNumber:* {@link Batch#batchNumber}</li>
     *     <li>*expiry:* {@link Batch#expiry}</li>
     *     <li>*serials:* serial numbers</li>
     * </ul>
     */
    updateBatches(batches){
        this.model['batches'] = batches;
    }

    /**
     * Retrieves the batches from the product DSU and updates the model
     */
    getBatchesAsync(){
        let self = this;
        self.batchManager.listBatches(this.model.gtin, (err, batches) => {
            if (err)
                throw err;
            self.updateBatches(batches);
        });
    }
}