import { LocalizedController, EVENT_SSAPP_HAS_LOADED, EVENT_SSAPP_STATUS_UPDATE} from "../../assets/pdm-web-components/index.esm.js";

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
        const self = this;
        self.send(EVENT_SSAPP_STATUS_UPDATE, {
            status: this.model.loading.loading.status,
            progress: this.model.loading.loading.progress
        }, {capture: true});
        this.on('ionTabsWillChange', (evt) => {
            const el = self.element.querySelector(`ion-tab[tab="${evt.detail.tab}"] webc-container`);
            if (el)
                el.dispatchEvent(new Event(`refresh`));
        }, {capture: true});

        this.participantManager = require('wizard').Managers.getParticipantManager(this.DSUStorage, false, (err, pManager) => {
            if (err)
                console.log(`Failed Participant Manager Initialization`);
            else
                console.log(`Participant manager initialized`);
            self.send(EVENT_SSAPP_STATUS_UPDATE, {
                status: this.model.loading.loaded.status,
                progress: this.model.loading.loaded.progress
            }, {capture: true});
        });

        console.log("Home controller initialized");
        this._testParticipant();
    }

    _testParticipant(){
        let self = this;
        self.send(EVENT_SSAPP_STATUS_UPDATE, {
            status: self.model.loading.booting.status,
            progress: self.model.loading.booting.progress
        }, {capture: true});
        this.participantManager.getIdentity((err, identity) => {
            if (err)
                return self.showErrorToast(`Could not retrieve identity. Build process seems to not have worked properly`);
            self.send(EVENT_SSAPP_STATUS_UPDATE, {
                status: this.model.loading.booted.status,
                progress: this.model.loading.booted.progress
            }, {capture: true});
            self.model['participant'] = identity;
            self.send(EVENT_SSAPP_HAS_LOADED, {}, {capture: true});
            self.showToast(`Welcome back to ${identity.name}'s Finished Goods Traceability App`);
        });
    }
}