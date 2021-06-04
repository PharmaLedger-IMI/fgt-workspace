import { LocalizedController, EVENT_REFRESH } from "../../assets/pdm-web-components/index.esm.js";

export default class StockController extends LocalizedController{
    initializeModel = () => ({});

    constructor(...args) {
        super(false, ...args);
        super.bindLocale(this, "stock");
        this.model = this.initializeModel();

        const wizard = require('wizard');
        const participantManager = wizard.Managers.getParticipantManager();
        this.stockManager = wizard.Managers.getStockManager(participantManager);
        this.table = this.element.querySelector('pdm-ion-table');
        let self = this;

        this.on(EVENT_REFRESH, (evt) => {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            self.table.refresh();
        }, {capture: true});
    }
}