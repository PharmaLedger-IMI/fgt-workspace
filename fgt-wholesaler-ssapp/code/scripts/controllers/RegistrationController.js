import LocalizedController from "./LocalizedController.js";
const MAH = require('wizard').Model.MAH;

export default class RegistrationController extends LocalizedController {

    getModel = () => ({});

    constructor(element) {
        super(element);
        super.bindLocale(this, "participant.registration");
        this.setModel(this.getModel());
        this.onTagClick('registration', this._submitRegistration.bind(this));
    }

    _submitRegistration = function () {
        this.send('perform-registration', this._modelToParticipant());
        //this.closeModal();
    }

    _modelToParticipant = function () {
        let info = {};
        Object.keys(this.model)
            .filter(k => !!this.model[k].value)
            .map(k => info[k] = this.model[k].value);
        return new MAH(info);
    }
}