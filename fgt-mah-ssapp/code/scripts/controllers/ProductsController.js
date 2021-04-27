import { LocalizedController } from "../../assets/pdm-web-components/index.esm.js";

export default class ProductsController extends LocalizedController {

    getModel = () => ({});

    constructor(element, history) {
        super(element, history);
        const wizard = require('wizard');
        super.bindLocale(this, "products");
        this.participantManager = wizard.Managers.getParticipantManager();
        this.productManager = wizard.Managers.getProductManager(this.participantManager);

        this.model = this.getModel();

        let self = this;
        self.onTagEvent('add-product', 'click', (evt) => {
            if (evt){
                evt.preventDefault();
                evt.stopImmediatePropagation();
            }
            console.log('add product');
            self._showProductModal();
        });

        self.onTagEvent('cancel-create-product', 'click', (evt) => {
            if (evt){
                evt.preventDefault();
                evt.stopImmediatePropagation();
            }
            self.hideModal();
        });

        self.on('create-product',  (evt) => {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            self.productManager.create(evt.detail, (err) => {
                if (err)
                    return self.showErrorToast(`Could not create Product`, err);
                self.hideModal();
                self.showToast(`Product ${evt.details.name} with gtin ${evt.detail.gtin} has been created`);
                self.send('refresh');
            });
        });

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