import ContainerController from "../../cardinal/controllers/base-controllers/ContainerController.js";

const wizard = require('wizard');
const LocaleService = wizard.Services.LocaleService;

export default class BatchesController extends ContainerController {
    constructor(element, history) {
        super(element, history);
        LocaleService.bindToLocale(this, LocaleService.supported.en_US, "batches");
        this.model = this.setModel({});
    }
}