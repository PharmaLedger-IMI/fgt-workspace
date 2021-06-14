import { LocalizedController, EVENT_REFRESH, EVENT_ACTION, BUTTON_ROLES } from "../../assets/pdm-web-components/index.esm.js";

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
        this.productEl = this.element.querySelector('managed-product');

        self.on(EVENT_REFRESH, (evt) => {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            self.model.manufId = self.productManager.getIdentity().id;

            const state = evt.detail;
            if (state && state.gtin){
                if (state.gtin === self.model.gtinRef)
                    return self.productEl.refresh();
                self.model.gtinRef = state.gtin;
            }
            else
                self.model.gtinRef = '';
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
    async _handleCreateProduct(product) {
        let self = this;
        if (product.validate())
            return this.showErrorToast(this.translate(`create.error.invalid`));

        const alert = await self.showConfirm('create.confirm');

        const {role} = await alert.onDidDismiss();

        if (BUTTON_ROLES.CONFIRM !== role)
            return console.log(`Order creation canceled by clicking ${role}`);

        const loader = self._getLoader(self.translate('create.loading'));
        await loader.present()

        const sendError = async function(msg){
            await loader.dismiss();
            self.showErrorToast(msg);
        }

        self.productManager.create(product, async (err, keySSI, dbPath) => {
            if (err)
                return sendError(`Could not create Product ${JSON.stringify(product, undefined, 2)}`, err);
            self.showToast(`Product ${product.name} with gtin ${product.gtin} has been created`);
            self.model.gtinRef = product.gtin;
            await loader.dismiss();
        });
    }

    async showConfirm(action = 'create.confirm'){
        return super.showConfirm(this.translate(`${action}.message`),
            this.translate(`${action}.buttons.ok`),
            this.translate(`${action}.buttons.cancel`));
    }
}