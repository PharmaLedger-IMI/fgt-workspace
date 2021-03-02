import ModalController from "../../cardinal/controllers/base-controllers/ModalController.js";
const LocaleService = require('wizard').Services.LocaleService;
const Actor = require('wizard').Model.MAH;


export default class RegistrationController extends ModalController {
    constructor(element) {
        super(element);
        LocaleService.bindToLocale(this, LocaleService.supported.en_US, "registration");
        this.model = this.setModel({});
        element.addEventListener('submit-registration', this.__submitRegistration.bind(this), true)
    }

    __submitRegistration = function(event){
        event.preventDefault();
        event.stopImmediatePropagation();
        this.send('perform-registration', this.__modelToActor());
    }

    __modelToActor = function(){
        let info = {};
        Object.keys(this.model)
            .filter(k => !!this.model[k].value)
            .map(k => info[k] = this.model[k].value);
        return new Actor(info);
    }
}