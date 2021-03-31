import LocalizedController from "./LocalizedController.js";
const MAH = require('wizard').Model.MAH;

export default class RegistrationController extends LocalizedController {

    getModel = () => ({});

    constructor(element) {
        super(element);
        console.log(`The translation model in the registration controller is: ${WebCardinal.translations}`);
        super.bindLocale(this, "registration");
        this.setModel(this.getModel());
        this.onTagClick('registration', this._submitRegistration.bind(this));

        console.log("RegistrationController initialized");
    }

    _submitRegistration = function (evt) {
        //this.updateModelFromIonicForms();
        let participant = this._modelToParticipant();
        let errors = participant.hasErrors();
        if (!errors)
            this.send('perform-registration', participant);
    }

    _modelToParticipant = function (model) {
        let info = {};
        model = model || this.model
        Object.keys(model)
            .filter(k => !!model[k].value)
            .map(k => info[k] = model[k].value);
        return new MAH(info);
    }
}