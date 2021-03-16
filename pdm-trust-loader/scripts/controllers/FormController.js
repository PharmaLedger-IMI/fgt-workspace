import LocalizedController from "./LocalizedController.js";

export default class FormController extends LocalizedController {

    getModel = () => ({});

    constructor(element) {
        super(element);
        let locale_key = this.model.page;
        if (!locale_key)
            throw new Error("Missing fields info");
        super.bindLocale(this, `.${locale_key}`);
        this.setModel(this.getModel());
        this.onTagClick('registration', this._submitRegistration.bind(this));

        console.log("FormController initialized");
    }

    _createModalForm(){
        let content_div = this.root.querySelector("div.modal-content");
        // create inputs from model objects
        Object.entries(this.model.toObject())
            .filter((k,v) => typeof v === 'object')
            .forEach((name, input) => {

        });
    }

    /**
     *
     * @param {object} field read from model containing the fields attributes
     * @private
     */
    _getIonInput(name){
        customElements.define("loader-input", class extends HTMLElement{
            connectedCallback(){
                this.innerHTML = `
    <ion-item>
        <ion-label position="stacked"> {{ @name.label }}</ion-label>
        <ion-input name="input-${name}" data-model="@${name}.name" type="${field.type}" inputmode="text" required="true" clear-on-edit="true" value="value"></ion-input>
    </ion-item>
    <ion-button name="register" color="primary" data-tag="registration" expand="full">{{ @register }}</ion-button>`
            }
        });
    }

    _getIonButtons(buttons){
        const getButton = function(name){
            customElements.define("loader-input", class extends HTMLElement{
                connectedCallback(){
                    this.innerHTML = `
    <ion-button name="register" color="primary" data-tag="" expand="full">{{ @register }}</ion-button>`
                }
            });
        }
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