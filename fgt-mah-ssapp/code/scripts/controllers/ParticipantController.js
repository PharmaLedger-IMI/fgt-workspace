import ContainerController from "../../cardinal/controllers/base-controllers/ContainerController.js";

export default class ParticipantController extends ContainerController {
    constructor(element) {
        super(element);
        const LocaleService = require('wizard').Services.LocaleService;
        LocaleService.bindToLocale(this, LocaleService.supported.en_US);
        this.model = this.setModel({
            identified: false,
            participant: undefined
        });
        this.participantManager = require('wizard').Managers.getParticipantManager(this.DSUStorage, "traceability");
        console.log("Participant controller initialized");
        element.addEventListener('perform-registration', (event) => {
            event.preventDefault();
            event.stopImmediatePropagation();
            this.closeModal();
            this.register(event.detail, (err) => {
                if (err)
                    return this.showError(err);
                this._testParticipant();
            });
        }, true)
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

    _showRegistrationModal(){
        this.showModal('registration-modal', {});
    }

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