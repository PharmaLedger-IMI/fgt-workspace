import { LocalizedController } from "../../assets/pdm-web-components/index.esm.js";

export default class HomeController extends LocalizedController {
    getModel = () => ({
        participant: undefined
    });

    constructor(element, history) {
        super(element, history);
        super.bindLocale(this, "");
        this.setModel(this.getModel());
        this.model.addExpression('identified', () => {
            return this.model.participant !== undefined;
        }, "participant");
        this.participantManager = require('wizard').Managers.getParticipantManager(this.DSUStorage);

        this.on('ionTabsWillChange', (evt) => {
            const el = this.element.querySelector(`ion-tab[tab="${evt.detail.tab}"] webc-container`);
            if (el)
                el.dispatchEvent(new Event(`refresh`));
        }, {capture: true});

        console.log("Home controller initialized");
        this._testParticipant();
    }

    _testParticipant(){
        let self = this;
        this.participantManager.getIdentity((err, identity) => {
            if (err)
                return self.showErrorToast(`Could not retrieve identity. Build process seems to not have worked properly`);
            self.model['participant'] = identity;
            self.showToast(`Welcome back to ${identity.name}'s Finished Goods Traceability App`);
        });
    }
}