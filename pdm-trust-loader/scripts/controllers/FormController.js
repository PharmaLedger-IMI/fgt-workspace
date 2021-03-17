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
        // create inputs from model objects
        const fields = Object.entries(this.model.toObject())
            .map(e => ({name: e[0], attributes: e[1]}))
            .filter(e => typeof e.attributes === 'object');
        const buttons = fields.filter(f => f.name === 'buttons');
        const inputs = fields.filter(f => f.name !== 'buttons');
        this._defineElements(inputs, buttons);
    }

    _defineElements(inputs, buttons){
        let el, elName;
        const content_div = this.root.querySelector("div.modal-content");
        inputs.forEach(input => {
            elName = this._defineIonInput(input.name, input.attributes);
            el = content_div.createElement(elName);
            content_div.appendChild(el);
        });
        const footer_el = this.root.querySelector("div.modal-content");
    }

    /**
     *
     * @param {string} name read from model containing the fields attributes
     * @param {object} attributes
     * @private
     */
    _defineIonInput(name, attributes){
        const el_name = `loader-input-${name}`;
        customElements.define(el_name, class extends HTMLElement{
            connectedCallback(){
                this.innerHTML = `
    <ion-item>
        <ion-label position="stacked"> {{ @${name}.label }}</ion-label>
        <ion-input name="input-${name}" data-model="@${name}" inputmode="text" required="true" clear-on-edit="true"></ion-input>
    </ion-item>`
            }
        });
        return el_name;
    }

    _getIonButtons(buttons){
        const getColor = function(index){
            switch (index) {
                case 1: return "primary"
                case 2: return "secondary"
                default: return "tertiary"
            }
        }
        const getButton = function(name, index){
            customElements.define(`loader-button-${name}`, class extends HTMLElement{
                connectedCallback(){
                    this.innerHTML = `
    <ion-button name="${name}" slot="footer" color="${getColor(index)}" data-tag="${name}">{{ @${name} }}</ion-button>`
                }
            });
        }

        let resulting_el = []
        buttons.forEach((b, i) => {
            resulting_el.push(getButton(b, i));
        });
        return resulting_el;
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
        return new MAH(info);
    }
}