import LocalizedController from "./LocalizedController.js";
const MAH = require('wizard').Model.MAH;

export default class RegistrationController extends LocalizedController {

    getModel = () => ({
    });

    constructor(element) {
        super(element);
        super.bindLocale(this, "participant.registration");
        this.setModel(this.getModel());

        this.onTagClick('registration', (event) => {
            console.log(event);
        });
        //element.addEventListener('submit-registration', this._submitRegistration.bind(this), true)
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

    onClick(){
        console.log("click")
    }

    onTagClick(tag, listener, options) {
        console.log(tag);
        super.onTagClick(tag, listener, options);
    }
}