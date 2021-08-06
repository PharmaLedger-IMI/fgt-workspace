import {LocalizedController, EVENT_REFRESH, HistoryNavigator} from "../../assets/pdm-web-components/index.esm.js";
const Product = require('wizard').Model.Product;

export default class StockController extends LocalizedController{
    initializeModel = () => ({});

    constructor(...args) {
        super(false, ...args);
        super.bindLocale(this, "stock");
        const wizard = require('wizard');

        const participantManager = wizard.Managers.getParticipantManager();
        this.stockManager = wizard.Managers.getStockManager(participantManager);
        let self = this;
        this.model = this.initializeModel();
        HistoryNavigator.registerTab({
            'tab-stock': this.translate('title')
        })

        this.on(EVENT_REFRESH, (evt) => {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            self.element.querySelector('pdm-ion-table').refresh();
        }, {capture: true});
    }
}