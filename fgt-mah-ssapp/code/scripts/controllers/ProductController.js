import { LocalizedController } from "../../assets/pdm-web-components/index.esm.js";

/**
 * Controls Application Flow
 * Makes the bridge between the UI and the ProductManager
 *
 * Handles data input and validation for the manipulation of Products
 * @class ProductController
 * @module controllers
 */
export default class ProductController extends LocalizedController {

    initializeModel = () => ({
        manufName: {
            value: this.productManager.getIdentity().id
        }
    });

    constructor(element, history) {
        super(element, history, false);
        let self = this;
        const wizard = require('wizard');
        super.bindLocale(self, `product`, true);
        this.participantManager = wizard.Managers.getParticipantManager();
        this.productManager = wizard.Managers.getProductManager(this.participantManager);
        self.model = self.initializeModel();
        self.onTagClick(`try-create-product`, self._submitProduct.bind(self));
        console.log("ProductController initialized");
    }

    _submitProduct = function () {
        let self = this;
        if (self.hasErrors(true))
            return this.showErrorToast('There are errors in the form');
        const product = self.productManager.fromModel(self.model);
        this.send('create-product', product);
    }
}