/**
 * @module controllers
 */

/**
 *
 */
import { LocalizedController } from "../../assets/pdm-web-components/index.esm.js";


/**
 * @class ProductController
 */
export default class ProductController extends LocalizedController {

    initializeModel = () => ({
        manufName: {
            value: this.productManager.getIdentity().id
        }
    });

    constructor(element, history) {
        super(element, history, true);
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
        if (self.hasErrors())
            return this.showErrorToast('There are errors in the form');
        const product = self.productManager.fromModel(self.model);


        this.send('create-product', product);
    }
}