import { LocalizedController, HistoryNavigator, EVENT_REFRESH} from "../../assets/pdm-web-components/index.esm.js";

/**
 * Controls Application Flow
 * Makes the bridge between the UI and the ProductManager
 *
 * Handles listing and querying of Products
 * @class ProductsController
 * @module controllers
 */
export default class ProductsController extends LocalizedController {

    initializeModel = () => ({});

    constructor(...args) {
        super(false, ...args)
        const wizard = require('wizard');
        super.bindLocale(this, "products");
        this.participantManager = wizard.Managers.getParticipantManager();
        this.productManager = wizard.Managers.getProductManager(this.participantManager);

        this.model = this.initializeModel();
        HistoryNavigator.registerTab({
            'tab-products': this.translate('title')
        })

        let self = this;
        self.onTagEvent('add-product', 'click', () => {
            self.navigateToTab('tab-product', {});
        });

        self.on(EVENT_REFRESH, (evt) => {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            self.element.querySelector('pdm-ion-table-default').refresh();
        }, {capture: true});
    }
}