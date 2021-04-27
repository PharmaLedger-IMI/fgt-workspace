import LocalizedController from "./LocalizedController";
import {EVENT_SSAPP_HAS_LOADED, EVENT_SSAPP_STATUS_UPDATE} from '../constants/events'

export default class HomeController extends LocalizedController {
    getModel = () => ({
        participant: undefined
    });

    constructor(element, history) {
        super(element, history);
        super.bindLocale(this, "");
        this.model = this.getModel();

        this.model.addExpression('identified', () => {
            return this.model.participant !== undefined;
        }, "participant");
        const self = this;
        self._updateLoading(this.model.loading.loading.status, this.model.loading.loading.progress)
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
            self._updateLoading(this.model.loading.loaded.status, this.model.loading.loaded.progress)
            console.log("Home controller initialized");
            this._testParticipant();
        });
    }

    _updateLoading(status, progress){
      const loader = document.querySelector('pdm-ssapp-loader');
      if (!loader){
        console.log(`No Loader could be found`);
        return;
      }
      if (!status && !progress)
        return this._concludeLoading();

      this.send(EVENT_SSAPP_STATUS_UPDATE, {
          status: status,
          progress: progress
        }, {capture: true});
    };

    _concludeLoading(){
      this.send(EVENT_SSAPP_HAS_LOADED, {}, {capture: true});
    }

    _testParticipant(){
        let self = this;
        self._updateLoading(self.model.loading.booting.status, self.model.loading.booting.progress)
        this.participantManager.getIdentity((err, identity) => {
            if (err)
                return self.showErrorToast(`Could not retrieve identity. Build process seems to not have worked properly`);
            self._updateLoading(this.model.loading.booted.status, this.model.loading.booted.progress)
            self.model['participant'] = identity;
            self._concludeLoading()
        });
    }
}