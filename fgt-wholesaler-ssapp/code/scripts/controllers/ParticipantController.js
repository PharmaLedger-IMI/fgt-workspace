const { WebcController } = WebCardinal.controllers;

export default class ParticipantController extends WebcController {

    _getModel = (_) => ({
        identified: false,
        participant: undefined
    });

    constructor(element, history) {
        super(element, history);
        this.setModel(this._getModel());
        this.participantManager = require('wizard').Managers.getParticipantManager(this.DSUStorage, "traceability");
        console.log("Participant controller initialized");
        this.on('perform-registration', (event) => {
                event.preventDefault();
                event.stopImmediatePropagation();
                this.closeModal();
                this.register(event.detail, (err) => {
                    if (err)
                        console.log("ERROR - Could not register - Should not be possible!");
                    this._testParticipant();
                });
        })

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
        const onConfirm = (evt) => {
            console.log(evt);
        };
        this.showModalFromTemplate('registrationModal', onConfirm);
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