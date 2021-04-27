/**
 * @module controllers
 */

/**
 *
 */
import LocalizedController from './LocalizedController.js'

/**
 * @class FormController
 */
export default class FormController extends LocalizedController {

    initializeModel = () => ({});

    constructor(element, history) {
        super(element, history);
        let self = this;
        super.bindLocale(self, `form`, true);

        self.model = self.initializeModel();
        console.log("FormController initialized");
        Object.entries(self.model.buttons).forEach(b => {
            self.onTagClick(`try${b[0]}`, self._handleTry(`${b[0]}`).bind(self));
        });

        self._createModalForm(this.model.toObject());
    }

    _handleTry(name){
        return function() {
            if (this.hasErrors())
                return this.showErrorToast('There are errors in the form');
            switch (name){
                case 'register':
                    return this._submitRegistration();
                case 'login':
                    return this._submitLogin();
            }
        }
    }

    _createModalForm(model){
        // create inputs from model objects
        const fields = Object.entries(model)
            .map(e => ({name: e[0], attributes: e[1]}))
            .filter(e => typeof e.attributes === 'object');
        const inputs = fields.filter(f => f.name !== 'buttons');
        this._defineElements(inputs);
    }

    _defineElements(inputs){
        let el, elName;
        const content_div = this.element.querySelector("div.modal-content");
        inputs.forEach(input => {
            elName = this._defineIonInput(input.name, input.attributes);
            el = document.createElement(elName);
            content_div.append(el);
        });
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
        <ion-label position="stacked">${attributes.label}</ion-label>
        <ion-input name="input-${name}" data-view-model="@${name}" 
            ${['number', 'date'].indexOf(attributes.type) !== -1 ? `inputmode="${attributes.type}"` : `inputmode="text"`} 
            ${attributes.max ? `max="${attributes.max}"` : ""} 
            ${attributes.min ? `min="${attributes.min}"` : ""} 
            ${attributes["max-length"] ? `max-length="${attributes['max-length']}"` : ""} 
            ${attributes["min-length"] ? `min-length="${attributes['min-length']}"` : ""}  
            type="${attributes.type}" required="${attributes.required}" clear-on-edit="true" value="${attributes.value}"></ion-input>
    </ion-item>`
            }
        });
        return el_name;
    }

    _getColor(index){
        switch (index) {
            case 1: return "primary"
            case 2: return "secondary"
            default: return "tertiary"
        }
    }

    _submitRegistration = function () {
        let participant = this._toSecrets();
        this.send('perform-registration', participant);
    }

    _submitLogin = function () {
        let secrets = this._toSecrets();
        this.send('perform-login', secrets);
    }

    _toSecrets = function (model) {
        model = model || this.model
        let result = {};
        Object.entries(model.toObject())
            .filter(k => !!k[1].value).forEach(e => {
                result[e[0]] = {
                    secret: e[1].value,
                    "public": !!e[1].public
                };
            })
        return result;
    }
}