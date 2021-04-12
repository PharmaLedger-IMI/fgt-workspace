import { LocalizedController } from "../../assets/pdm-web-components/index.esm.js";

export default class DashboardController extends LocalizedController {
    constructor(element, history) {
        super(element, history);
        const LocaleService = require('wizard').Services.WebcLocaleService;
        LocaleService.bindToLocale(this, "dashboard");
    }
}