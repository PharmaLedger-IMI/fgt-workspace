import LocalizedController from "./LocalizedController.js";
const REGISTRATION_MODAL = "registration-modal";

customElements.define(REGISTRATION_MODAL, class extends HTMLElement{
    connectedCallback(){
        this.innerHTML = `
    <ion-title color="primary">{{ @registration.title }}</ion-title>
    <ion-item>
        <ion-label position="stacked"> {{ @registration.name.label }}</ion-label>
        <ion-input name="input-name" data-model="@registration.name" type="text" inputmode="text" required="true" clear-on-edit="true" value="value"></ion-input>
    </ion-item>
    <ion-item>
        <ion-label position="stacked"> {{ @id.label }}</ion-label>
        <ion-input name="id" data-model="@id" type="text" inputmode="text" required="true" clear-on-edit="true" value="value"></ion-input>
    </ion-item>
    <ion-item>
        <ion-label position="stacked"> {{ @email.label }}</ion-label>
        <ion-input name="email" data-model="@email" type="email" inputmode="email" required="true" clear-on-edit="true" value="value"></ion-input>
    </ion-item>
    <ion-item>
        <ion-label position="stacked"> {{ @tin.label }}</ion-label>
        <ion-input name="tin" data-model="@tin" type="number" inputmode="numeric" min="0" required="true" maxLength="9" clear-on-edit="true" value="value"></ion-input>
    </ion-item>
    <ion-item>
        <ion-label position="stacked"> {{ @address.label }}</ion-label>
        <ion-input name="address" data-model="@address" type="text" inputmode="text" required="true" clear-on-edit="true" value="value"></ion-input>
    </ion-item>
    <ion-button name="register" color="primary" data-tag="registration" expand="full">{{ @register }}</ion-button>`
    }
});

export default class ParticipantController extends LocalizedController {

    getModel = () => ({
        participant: undefined
    });

    constructor(element, history) {
        super(element, history);
        super.bindLocale(this, "home");
        this.setModel(this.getModel());
        this.model.addExpression('identified', () => {
            return this.model.participant !== undefined;
        }, "participant");

        this.on('perform-registration', (event) => {
            event.preventDefault();
            this.register(event.detail, (err) => {
                if (err)
                    return this.showError(err);
                this._testParticipant();
            });
        }, true)

        this.participantManager = require('wizard').Managers.getParticipantManager(this.DSUStorage, "traceability");
        console.log("Home controller initialized");
        this._testParticipant();
    }

    /**
     * Creates the ID DSU and mounts it to the id_path
     * @param {Participant} participant
     * @param {function} callback
     */
    register(participant, callback){
        let self = this;
        self.participantManager.create(participant, (err, keySSI) => {
            if (err)
                return callback(err);
            callback();
        });
    }

    _showRegistrationModal() {
        //this.showIonicModal(REGISTRATION_MODAL);
        const onConfirm = (event) => {
            event.preventDefault();
            this.register(event.detail, (err) => {
                if (err)
                    console.log("ERROR - Could not register - Should not be possible!");
                this._testParticipant();
            });
        };
        this.createWebcModal({
            modelTitle: "",
            modalName: 'registrationModal',
            showFooter: false,
            canClose: false,
            showCancelButton: false,
            onConfirm: onConfirm
        });
    }

    _testParticipant(){
        let self = this;
        this.participantManager.getParticipant((err, participant) => {
            if (err || !participant) {
                self._showRegistrationModal();
            } else {
                self.model.participant = participant;
            }
        });
    }
}