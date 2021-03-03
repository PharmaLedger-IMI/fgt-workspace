import ContainerController from "../../cardinal/controllers/base-controllers/ContainerController.js";
const LocaleService = require('wizard').Services.LocaleService;

export default class DashboardController extends ContainerController {
    constructor(element, history) {
        super(element, history);
        LocaleService.bindToLocale(this, LocaleService.supported.en_US, "dashboard");
        this.model = this.setModel({});
    }
}