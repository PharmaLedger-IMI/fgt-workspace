import LocalizedController from "./LocalizedController.js";
const REGISTRATION_MODAL = "registration-modal";

customElements.define(REGISTRATION_MODAL, class extends HTMLElement{
    connectedCallback(){
        this.innerHTML = `
    <ion-title color="primary">{{ $registration.title }}</ion-title>
    <ion-item>
        <ion-label position="stacked"> {{ $registration.name.label }}</ion-label>
        <ion-input name="input-name" data-model="@registration.name" type="text" inputmode="text" required="true" clear-on-edit="true" value="value"></ion-input>
    </ion-item>
    <ion-item>
        <ion-label position="stacked"> {{ $id.label }}</ion-label>
        <ion-input name="id" data-model="@id" type="text" inputmode="text" required="true" clear-on-edit="true" value="value"></ion-input>
    </ion-item>
    <ion-item>
        <ion-label position="stacked"> {{ $email.label }}</ion-label>
        <ion-input name="email" data-model="@email" type="email" inputmode="email" required="true" clear-on-edit="true" value="value"></ion-input>
    </ion-item>
    <ion-item>
        <ion-label position="stacked"> {{ $tin.label }}</ion-label>
        <ion-input name="tin" data-model="@tin" type="number" inputmode="numeric" min="0" required="true" maxLength="9" clear-on-edit="true" value="value"></ion-input>
    </ion-item>
    <ion-item>
        <ion-label position="stacked"> {{ $address.label }}</ion-label>
        <ion-input name="address" data-model="@address" type="text" inputmode="text" required="true" clear-on-edit="true" value="value"></ion-input>
    </ion-item>
    <ion-button name="register" color="primary" data-tag="registration" expand="full">{{ $register }}</ion-button>`
    }
});

export default class ParticipantController extends LocalizedController {
    getModel = () => ({
        participant: undefined
    });

    constructor(element, history) {
        super(element, history);
        console.log(`The translation model in the Home controller is: ${WebCardinal.translations.en}`);
        super.bindLocale(this, "");
        this.setModel(this.getModel());
        this.model.addExpression('identified', () => {
            return this.model.participant !== undefined;
        }, "participant");
        this.participantManager = require('wizard').Managers.getParticipantManager(this.DSUStorage);
        console.log("Home controller initialized");
        this._testParticipant();
    }

    _testParticipant(){
        let self = this;
        this.participantManager.getIdentity((err, identity) => {
            if (err){
                self.showErrorToast(`Could not retrieve identity. Build process seems to not have worked properly`);
                return console.log(createOpenDSUErrorWrapper(`Could not retrieve identity`, err));
            }
            console.log9
        });
    }
}