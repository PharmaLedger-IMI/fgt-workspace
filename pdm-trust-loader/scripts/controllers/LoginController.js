mport LocalizedController from "../../../pdm-dsu-toolkit/controllers/LocalizedController.js";

export default class RegistrationController extends LocalizedController {

    getModel = () => ({});

    constructor(element) {
        super(element);
        super.bindLocale(this, ".login");
        this.setModel(this.getModel());
        this.onTagClick('registration', this._submitRegistration.bind(this));

        console.log("RegistrationController initialized");
    }

    _submitRegistration = function (evt) {

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