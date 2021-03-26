import ContainerController from "../../cardinal/controllers/base-controllers/ContainerController.js";

export default class ParticipantController extends ContainerController {
    constructor(element) {
        super(element);
        const LocaleService = require('wizard').Services.LocaleService;
        LocaleService.bindToLocale(this, LocaleService.supported.en_US);
        const Version = require('wizard').Version;
        this.model = this.setModel({
            identified: false,
            participant: undefined,
            version: Version.version+"-"+Version.hash
        });
        this.participantManager = require('wizard').Managers.getParticipantManager(this.DSUStorage, "traceability");
        console.log("Participant controller initialized");
        element.addEventListener('perform-registration', (event) => {
            event.preventDefault();
            event.stopImmediatePropagation();
            this.closeModal();
            this.participantManager.registerPharmacy(event.detail, (err) => {
                if (err)
                    return this.showError(err);
                this._testParticipant();
            });
        }, true)
        this._testParticipant();
    }

    _showRegistrationModal(){
        this.showModal('registration-modal', {});
    }

    /**
     * Update model.participant and model.identified.
     */
    _testParticipant(){
        let self = this;
        this.participantManager.getParticipant((err, participant) => {
            if (err || !participant) {
                self.model.identified = false;
                self._showRegistrationModal();
            } else {
                self.model.participant = participant;
                self.model.identified = true;
            }
        });
    }
}