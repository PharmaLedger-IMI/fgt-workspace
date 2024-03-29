import { LocalizedController, HistoryNavigator, EVENT_REFRESH, EVENT_ACTION, BUTTON_ROLES } from "../../assets/pdm-web-components/index.esm.js";

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
        self.productManager.bindController(this);
        this.productEl = this.element.querySelector('managed-product');
        HistoryNavigator.registerTab({
            'tab-product': self.translate('title')
        })

        self.on(EVENT_REFRESH, (evt) => {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            self.model.manufId = self.productManager.getIdentity().id;

            const state = evt.detail;
            const label = !!state.previousTab ? state.previousTab.label : HistoryNavigator.getPreviousTab().label;
            self.model.back = this.translate('back', label);
            if (state && state.gtin){
                if (state.gtin === self.model.gtinRef) {
                    self.productEl.refresh();
                    return self.element.querySelector('pdm-ion-table').refresh();
                }
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
            return this.showErrorToast(this.translate(`error.invalid`));

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
                return sendError(self.translate('error.error', err));
            self.showToast(self.translate('create.success'));
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