import { LocalizedController } from "../../assets/pdm-web-components/index.esm.js";

export default class DashboardController extends LocalizedController {

    initializeModel = () => ({});

    constructor(...args) {
        super(false, ...args);
        super.bindLocale(this, "dashboard");
        this.model = this.initializeModel();
        console.log('DashboardController Initialized');
    }
}