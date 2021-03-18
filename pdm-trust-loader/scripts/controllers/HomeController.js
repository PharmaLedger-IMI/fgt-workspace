import LocalizedController from "./LocalizedController.js";
//import WalletService from "../services/WalletService.js";

export default class ParticipantController extends LocalizedController {
    getModel = () => ({
        participant: undefined
    });

    constructor(element, history) {
        super(element, history);
        super.bindLocale(this, "");
        this.setModel(this.getModel());

        let self = this;
        this.on('perform-registration', (event) => {
            event.preventDefault();
            event.stopImmediatePropagation();
            self.register(event.detail, (err) => {
                if (err)
                    self.showErrorModal();
                self.hideModal();
                self._testParticipant();
            });
        }, true)

        this.on('perform-login', (event) => {
            event.preventDefault();
            event.stopImmediatePropagation();
            // self.login(event.detail, (err) => {
            //     if (err)
            //         self.showErrorModal();
            //     self.hideModal();
            //     self._testParticipant();
            // });
        }, true)


        console.log("Home controller initialized");
        this._showLoginModal();
    }

    /**
     * Creates the ID DSU and mounts it to the id_path
     * @param {object} credentials
     * @param {function} callback
     */
    register(credentials, callback){
        let self = this;
        self.participantManager.create(credentials, (err, keySSI) => {
            if (err)
                return callback(err);
            callback();
        });
    }

    _showLoginModal() {
        this.createWebcModal({
            modelTitle: "",
            modalName: 'loginModal',
            showFooter: false,
            canClose: false,
            showCancelButton: false
        });
    }

    _showRegistrationModal() {
        this.createWebcModal({
            modelTitle: "",
            modalName: 'registrationModal',
            showFooter: false,
            canClose: false,
            showCancelButton: false
        });
    }

    _testParticipant(){
        let self = this;
        this.participantManager.getParticipant((err, participant) => {
            if (err || !participant) {
                self._showRegistrationModal.call(this);
            } else {
                self.model.participant = participant;
                console.log(`Welcome ${self.model.participant.name}`);
            }
        });
    }
}