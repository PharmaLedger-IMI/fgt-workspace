import ModalController from "../../cardinal/controllers/base-controllers/ModalController.js";

export default class BatchController extends ModalController {
    constructor(element, history) {
        super(element, history);
        const LocaleService = require('wizard').Services.LocaleService;
        LocaleService.bindToLocale(this, LocaleService.supported.en_US, "batch");
        console.log(this.model);
        let state = this.History.getState();
    }
}