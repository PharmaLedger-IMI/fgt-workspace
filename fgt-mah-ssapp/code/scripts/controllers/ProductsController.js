import { LocalizedController } from "../../assets/pdm-web-components/index.esm.js";

export default class ProductsController extends LocalizedController {

    getModel = () => ({});

    constructor(element, history) {
        super(element, history);
        const wizard = require('wizard');
        super.bindLocale(this, "products");
        this.participantManager = wizard.Managers.getParticipantManager();
        this.productManager = wizard.Managers.getProductManager(this.participantManager);

        this.setModel(this.getModel());

        let self = this;
        self.onTagEvent('add-product', 'click', (evt) => {
            if (evt){
                evt.preventDefault();
                evt.stopImmediatePropagation();
            }
            console.log('add product');
            self._showProductModal();
        });
        // this.on('add-product', (event) => {
        //     event.stopImmediatePropagation();
        //     self._showProductModal();
        // });

        // this.on('perform-add-product', (event) => {
        //     event.stopImmediatePropagation();
        //     self._addProduct(event.detail, (err) => {
        //         if (err) {
        //             this.showError(err);
        //             return;
        //         }
        //         self.closeModal('product-modal');
        //         self.getProductsAsync();
        //     });
        // });
        //
        // this.on('manage-batches', (event) => {
        //     event.stopImmediatePropagation();
        //     const gtin = event.target.getAttribute("gtin");
        //     this.History.navigateToPageByUrl("/batches", {gtin: gtin});
        // });

        self.on('refresh', (evt) => {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            self.element.querySelector('pdm-ion-table').refresh();
        }, {capture: true});
    }

    _showProductModal(){
        this.createWebcModal({
            template: "productModal",
            controller: "ProductController",
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
     * @param product
     * @param callback
     * @private
     */
    _addProduct(product, callback){
        let self = this;
        self.productManager.create(product, (err, keySSI, path) => {
            if (err)
                return callback(err);
            callback();
        });
    }
}