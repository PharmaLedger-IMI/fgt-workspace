import LocalizedController from "./LocalizedController.js";

export default class FormController extends LocalizedController {

    getModel = () => ({});

    constructor(element, history) {
        super(element, history);
        // let locale_key = this.model.page;
        // if (!locale_key)
        //     throw new Error("Missing fields info");
        let self = this;
        super.bindLocale(self, `.login`, true);
        self._createModalForm(WebCardinal.translations.en['/'].login);
        self.setModel(self.getModel());
        console.log("FormController initialized");
        //require('toolkit').Model.Validations.bindIonicValidation(self);
        Object.entries(self.getModel().buttons).forEach(b => {
            self.onTagClick(`try${b[0]}`, self._handleTry.bind(self));
        });

        self.on('input-has-changed', self._handleErrorElement.bind(self));
    }

    async presentLoading(message, duration) {
        duration = duration || 5000;
        const loading = document.createElement('ion-loading');

        loading.cssClass = 'ion-loading';
        loading.message = message;
        loading.translucent = true;
        loading.duration = duration;

        document.body.appendChild(loading);
        await loading.present();

        const { role, data } = await loading.onDidDismiss();
        console.log('Loading dismissed!');
    }

    _handleTry(evt){
        evt.preventDefault();
        evt.stopImmediatePropagation();
        if (this.hasErrors())
            return console.log("There are errors in the form");


    }

    _createModalForm(model){
        // create inputs from model objects
        const fields = Object.entries(model)
            .map(e => ({name: e[0], attributes: e[1]}))
            .filter(e => typeof e.attributes === 'object');
        const inputs = fields.filter(f => f.name !== 'buttons');
        this._defineElements(inputs);
    }

    _handleErrorElement(evt){
        let name = evt.detail;
        let attributes = this.model.toObject()[name];
        let errorEl = this.element.querySelector(`ion-note[name="note-${name}"]`);
        if (attributes.error){
            if (errorEl){
                errorEl.innerHTML = attributes.error;
            } else {
                errorEl = document.createElement('ion-note');
                errorEl.setAttribute('position', 'stacked');
                errorEl.setAttribute('slot', 'end');
                errorEl.setAttribute('color', 'danger');
                errorEl.setAttribute('name', `note-${name}`)
                errorEl.innerHTML = attributes.error;
                let htmlEl = this.element.querySelector(`ion-item ion-input[name="input-${name}"]`);
                htmlEl.insertAdjacentElement('afterend', errorEl);
            }
        } else if (errorEl) {
            errorEl.remove();
        }
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
        <ion-input name="input-${name}" data-model="@${name}" 
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