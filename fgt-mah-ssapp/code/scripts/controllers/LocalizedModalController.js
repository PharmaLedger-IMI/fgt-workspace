import ModalController from "../../cardinal/controllers/base-controllers/ModalController.js";
const LocaleService = require('wizard').Services.LocaleService;


export default class LocalizedModalController extends ModalController {
    constructor(element) {
        super(element);
        LocaleService.bindToLocale(this, LocaleService.supported.en_US);
        this.model = this.setModel({});
    }
}