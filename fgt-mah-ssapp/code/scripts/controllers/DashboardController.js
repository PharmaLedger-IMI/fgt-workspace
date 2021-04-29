import { LocalizedController } from "../../assets/pdm-web-components/index.esm.js";

/**
 * Controls Application Flow
 *
 * Displays Metrics
 * @class DashBoardController
 * @module controllers
 */
export default class DashboardController extends LocalizedController {

    initializeModel = () => ({});

    constructor(element, history) {
        super(element, history, false);
        super.bindLocale(this, "dashboard");
        this.model = this.initializeModel();
        console.log('DashboardController Initialized');
    }
}