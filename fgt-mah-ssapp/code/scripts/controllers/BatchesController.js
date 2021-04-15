import { LocalizedController } from "../../assets/pdm-web-components/index.esm.js";
const Batch = require('wizard').Model.Batch;

export default class ProductsController extends LocalizedController {

    getModel = () => ({
        products: []
    });

    constructor(element, history) {
        super(element, history);
        const wizard = require('wizard');
        const LocaleService = wizard.Services.WebcLocaleService;
        LocaleService.bindToLocale(this,"batches");
        this.participantManager = wizard.Managers.getParticipantManager();
        this.batchManager = wizard.Managers.getBatchManager(this.participantManager);

        this.setModel(this.getModel());

        let self = this;

        self.model.addExpression('hasBatches', () => {
            return typeof self.model.batches !== 'undefined' && self.model.batches.length > 0;
        }, 'batches');

        this.on('refresh', (evt) => {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            this.getBatchesAsync();
        }, {capture: true});
    }
    //
    // _showProductModal(){
    //     let self = this;
    //     self.participantManager.getParticipant((err, actor) => {
    //        if (err)
    //            throw err;
    //         self.showModal('product-modal', self.productManager.toModel(new Product({
    //             manufName: actor.name
    //         })), true);
    //     });
    // }

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

    /**
     * Updates the batches model
     * @param {Batch[]} batches where the properties must be:
     * <ul>
     *     <li>*gtin:* {@link Product#gtin}</li>
     *     <li>*product:* {@link Product}</li>
     *     <li>*index:* not implemented. for sorting/filtering purposes</li>
     * </ul>
     */
    updateBatches(batches){
        this.model['batches'] = batches;
    }

    /**
     * Retrieves the products from the DSU and updates the model
     * by calling {@link ProductsController#updateBatches} after retrieval
     */
    getBatchesAsync(){
        let self = this;
        self.batchManager.getAll(true, (err, products) => {
            if (err)
                return self.showErrorToast(`Could not list batches`, err);
            self.updateBatches(products);
        });
    }
}