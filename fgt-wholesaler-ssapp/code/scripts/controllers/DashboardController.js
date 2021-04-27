import { LocalizedController } from "../../assets/pdm-web-components/index.esm.js";

export default class DashboardController extends LocalizedController {

    initializeModel = (_) => ({
        title: "This is a Dashboard",
        none: "There are no pending orders"
    });

    constructor(element, history) {
        super(element, history);

        this.model = this.initializeModel();
        //const LocaleService = require('wizard').Services.LocaleService;
        //LocaleService.bindToLocale(this, LocaleService.supported.en_US, "dashboard");


    }
}