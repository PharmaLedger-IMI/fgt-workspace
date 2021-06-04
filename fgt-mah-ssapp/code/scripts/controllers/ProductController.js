import { LocalizedController, EVENT_REFRESH, EVENT_ACTION } from "../../assets/pdm-web-components/index.esm.js";

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
        manufId: undefined,
        gtinRef: undefined
    });

    constructor(...args) {
        super(false, ...args)
        let self = this;
        super.bindLocale(self, `product`, false);
        self.model = self.initializeModel();

        const wizard = require('wizard');
        const participantManager = wizard.Managers.getParticipantManager();
        this.productManager = wizard.Managers.getProductManager(participantManager);

        self.on(EVENT_REFRESH, (evt) => {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            self.model.manufId = self.productManager.getIdentity().id;
            self.model.gtinRef = evt.detail ? evt.detail : undefined;
        });

        self.on(EVENT_ACTION, (evt) => {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            self._handleCreateProduct.call(self, evt.detail);
        });

        console.log("ProductController initialized");
    }

    /**
     * Sends an event named create-issued-order to the IssuedOrders controller.
     */
    _handleCreateProduct(product) {
        let self = this;
        if (product.validate())
            return this.showErrorToast('Invalid Product');

        self.productManager.create(product, (err, keySSI, dbPath) => {
            if (err)
                return self.showErrorToast(`Could not create Product ${JSON.stringify(product, undefined, 2)}`, err);
            self.showToast(`Product ${product.name} with gtin ${product.gtin} has been created`);
            self.model.gtinRef = product.gtin;
        });
    }
}