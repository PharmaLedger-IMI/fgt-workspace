import LocalizedController from "./LocalizedController.js";

export default class ParticipantController extends LocalizedController {

    getModel = () => ({
        participant: undefined
    });

    constructor(element, history) {
        super(element, history);
        super.bindLocale(this, "participant");
        this.setModel(this.getModel());
        this.model.addExpression('identified', () => {
            return this.model.participant !== undefined;
        }, "participant");


        this.participantManager = require('wizard').Managers.getParticipantManager(this.DSUStorage, "traceability");
        console.log("Participant controller initialized");
        // this.on('perform-registration', (event) => {
        //         event.preventDefault();
        //         this.closeModal();
        //         this.register(event.detail, (err) => {
        //             if (err)
        //                 console.log("ERROR - Could not register - Should not be possible!");
        //             this._testParticipant();
        //         });
        // })
        //
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
        const onConfirm = (event) => {
            event.preventDefault();
            this.register(event.detail, (err) => {
                if (err)
                    console.log("ERROR - Could not register - Should not be possible!");
                this._testParticipant();
            });
        };
        this.showModalFromTemplate('registrationModal', onConfirm);
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