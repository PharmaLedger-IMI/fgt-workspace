import LocalizedController from "./LocalizedController.js";

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
            if (err)
                return self.showErrorToast(`Could not retrieve identity. Build process seems to not have worked properly`);
            self.model.participant = identity;
            self.showToast(`Welcome back to ${identity.name}'s Finished Goods Traceability App`);
        });
    }
}