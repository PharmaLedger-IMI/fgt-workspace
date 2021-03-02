import ModalController from "../../cardinal/controllers/base-controllers/ModalController.js";
const LocaleService = require('wizard').Services.LocaleService;


export default class RegistrationController extends ModalController {
    constructor(element) {
        super(element);
        this.locale = LocaleService.getInstance(LocaleService.supported.en_US, this);
        this.model = this.setModel({});
    }
}