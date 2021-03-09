import ModalController from "../../cardinal/controllers/base-controllers/ModalController.js";
const MAH = require('wizard').Model.MAH;

export default class RegistrationController extends ModalController {
    constructor(element) {
        super(element);
        const LocaleService = require('wizard').Services.LocaleService;
        LocaleService.bindToLocale(this, LocaleService.supported.en_US, "registration");
        element.addEventListener('submit-registration', this._submitRegistration.bind(this), true)
    }

    _submitRegistration = function(event){
        event.preventDefault();
        event.stopImmediatePropagation();
        this.send('perform-registration', this._modelToParticipant());
    }

    _modelToParticipant = function(){
        let info = {};
        Object.keys(this.model)
            .filter(k => !!this.model[k].value)
            .map(k => info[k] = this.model[k].value);
        return new MAH(info);
    }
}