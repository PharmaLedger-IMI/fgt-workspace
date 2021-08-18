import { LocalizedController, HistoryNavigator } from "../../assets/pdm-web-components/index.esm.js";

export default class DashboardController extends LocalizedController {

    initializeModel = () => ({});

    constructor(...args) {
        super(false, ...args);
        super.bindLocale(this, "dashboard");
        this.model = this.initializeModel();
        console.log('DashboardController Initialized');
        HistoryNavigator.registerTab({
            'tab-dashboard': this.translate('title')
        })
    }
}