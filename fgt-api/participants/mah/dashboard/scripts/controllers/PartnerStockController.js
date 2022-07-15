import {LocalizedController, HistoryNavigator} from "../../assets/pdm-web-components/index.esm.js";

export default class PartnerStockController extends LocalizedController {

    initializeModel = () => ({    });

    constructor(...args) {
        super(false, ...args);
        super.bindLocale(this, "partnerStock");
        this.model = this.initializeModel();
        HistoryNavigator.registerTab({
            'tab-partner-stock': this.translate('title')
        })

        console.log('PartnerStockController Initialized');
    }
}