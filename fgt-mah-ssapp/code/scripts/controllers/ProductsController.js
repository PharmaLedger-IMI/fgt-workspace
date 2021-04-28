import { LocalizedController, EVENT_REFRESH, EVENT_NAVIGATE_TAB } from "../../assets/pdm-web-components/index.esm.js";

export default class ProductsController extends LocalizedController {

    initializeModel = () => ({});

    constructor(element, history) {
        super(element, history, false);
        const wizard = require('wizard');
        super.bindLocale(this, "products");
        this.participantManager = wizard.Managers.getParticipantManager();
        this.productManager = wizard.Managers.getProductManager(this.participantManager);

        this.model = this.initializeModel();

        let self = this;
        self.onTagEvent('add-product', 'click', () => {
            self._showProductModal();
        });

        self.onTagEvent('cancel-create-product', 'click', () => {
            self.hideModal();
        });

        self.on('create-product',  (evt) => {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            self._addProductAsync(evt.detail);
        });

        self.on(EVENT_REFRESH, (evt) => {
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
     * @private
     */
    _addProductAsync(product){
        let self = this;
        self.productManager.create(product, (err, keySSI, path) => {
            if (err)
                return self.showErrorToast(`Could not create Product`, err);
            self.hideModal();
            self.showToast(`Product ${product.name} with gtin ${product.gtin} has been created`);
            self.send(EVENT_REFRESH);
        });
    }
}