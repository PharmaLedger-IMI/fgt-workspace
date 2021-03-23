import LocalizedController from "./LocalizedController.js";

export default class FormController extends LocalizedController {

    getModel = () => ({});

    constructor(element, history) {
        super(element, history);
        // let locale_key = this.model.page;
        // if (!locale_key)
        //     throw new Error("Missing fields info");;
        super.bindLocale(this, `.login`, true);
        this.setModel(this.getModel());
        console.log("FormController initialized");
        this.onTagClick("trylogin", this._tryLogin.bind(this));
        this.onTagClick("tryregister", this._tryRegister.bind(this));
    }
    //
    // _createModalForm(model){
    //     // create inputs from model objects
    //     const fields = Object.entries(model)
    //         .map(e => ({name: e[0], attributes: e[1]}))
    //         .filter(e => typeof e.attributes === 'object');
    //     const buttons = fields.filter(f => f.name === 'buttons').map(f => f.attributes)[0];
    //     const inputs = fields.filter(f => f.name !== 'buttons');
    //     this._defineElements(inputs, buttons);
    // }

    _tryLogin(evt){
        console.log(evt);
    }

    _tryRegister(evt){

    }

    _submitRegistration = function (evt) {
        let participant = this._modelToDSU();
        let errors = participant.hasErrors();
        if (!errors)
            this.send('perform-registration', participant);
    }

    _modelToDSU = function (model) {
        let info = {};
        model = model || this.model
        Object.keys(model)
            .filter(k => !!model[k].value)
            .map(k => info[k] = model[k].value);
        return info;
    }
}