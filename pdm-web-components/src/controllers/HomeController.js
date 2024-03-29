import LocalizedController from "./LocalizedController";
import {
  EVENT_SSAPP_HAS_LOADED,
  EVENT_SSAPP_STATUS_UPDATE,
  EVENT_REFRESH,
  EVENT_NAVIGATE_TAB,
  SIDE_MENU_CLASS_SELECTOR,
  EVENT_ION_TABS_WILL_CHANGE,
  EVENT_SELECT,
  EVENT_BACK_NAVIGATE
} from '../constants/events'
import {WebManagerService} from '../services/WebManagerService';
import HistoryNavigator from "../utils/HistoryNavigator";
/**
 * Main Controller For the SSApp Architecture. Should be instantiated like so:
 *
 * <pre>
 *   <webc-container controller="HomeController">
 *     <ion-app>
 *       <ion-header class="ion-no-border ion-padding">
 *         (...)
 * </pre>
 *
 * Initializes the {@link BaseManager} providing access to:
 * Complies with the Architecture described
 *  - Access to Identity DSU;
 *  - Access to Database DSU;
 *  - Access to the Messaging API
 *
 * and provides the implementation for navigation and data management in an Ionic Tab Single Page Application Schema
 * @memberOf Controllers
 * @class HomeController
 * @abstract
 */
export default class HomeController extends LocalizedController {
    initializeModel = () => ({
        participant: {}
    });
    constructor(...args) {
        super(true, ...args);
        super.bindLocale(this, "");
        this.model = this.initializeModel();
        this.model.addExpression('identified', () => {
            return !!this.model.participant.id;
        }, "participant");
      this.historyNavigator = new HistoryNavigator({tab: 'tab-dashboard', props: {}}, 10);
        const self = this;
        self._updateLoading(this.model.loading.loading.status, this.model.loading.loading.progress)
        this.on(EVENT_ION_TABS_WILL_CHANGE, (evt) => {
            self._handleIonChange.call(self, evt);
        }, {capture: true});
        this.on(EVENT_NAVIGATE_TAB, (evt) => {
          evt.preventDefault();
          evt.stopImmediatePropagation();
          self._navigateToTab.call(self, evt.detail);
        });
        this.on(EVENT_BACK_NAVIGATE, (evt) => {
          const previousTab = this.historyNavigator.getBackToPreviousTab();
          evt.preventDefault();
          evt.stopImmediatePropagation();
          self._navigateToTab.call(self, previousTab);
        });
        const participantManager = require('wizard').Managers.getParticipantManager(this.DSUStorage, false, (err, pManager) => {
              if (err)
                  console.log(`Failed Participant Manager Initialization`);
              else
                  console.log(`Participant manager initialized`);
              self.participantManager = pManager;
              self._updateLoading(this.model.loading.loaded.status, this.model.loading.loaded.progress);
            // Give UI some time to breathe and render stuff (including our animation)
              setTimeout(() => {
                WebManagerService.registerRepository(self.participantManager);
                console.log("Home controller initialized");
                self._testParticipant();
              }, Math.floor(Math.random() * 250));
          });
        self.onTagClick('logout', () => {
          location.reload();
        })

        participantManager.setController(this);
    }
    
  _handleIonChange(evt){
    const self = this;
    const el = self.element.querySelector(`ion-tab[tab="${evt.detail.tab}"] webc-container`)
               || self.querySelector(`ion-tab[tab="${evt.detail.tab}"] ion-content`);
    if (el){
      const detail = self.getState();
      const evt = new Event(EVENT_REFRESH);
      evt.detail = detail;
      el.dispatchEvent(evt);
    }
    // For side Menu Integration we forward the ionTabsWillChange event if it exists
    const menuEl = self.element.querySelectorAll(SIDE_MENU_CLASS_SELECTOR);
    if (menuEl && menuEl.length){
      menuEl.forEach(el => {
        const event = new Event(EVENT_SELECT);
        event.detail = evt.detail;
        el.dispatchEvent(event)
        });
    }
  }

  /**
   * Handles navigation request events
   * @param {*} props the props to send to the controllers at the required tab
   * @private
   */
  _navigateToTab(props){
      let self = this;
      const el = self.element.querySelector(`ion-tabs`);
      if (!el){
        console.log(`A tab navigation request was received, but no ion-tabs could be found...`)
        return;
      }
      const {previousTab} = this.historyNavigator.addToHistory(props);
      props.props = Object.assign(props.props || {}, {previousTab});
      self.setState(props.props);
      el.select(props.tab);
    }
  /**
   * Updates loading status
   * @param status
   * @param progress
   * @private
   */
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
  /**
   * Signals the SSApp has finished loading
   * @private
   */
  _concludeLoading(){
      this.send(EVENT_SSAPP_HAS_LOADED, {}, {capture: true});
    }
  /**
   * Reads the identity from the DSU
   * @private
   */
  _testParticipant(){
        let self = this;
        self._updateLoading(self.model.loading.booting.status, self.model.loading.booting.progress);
      // Give UI some time to breathe and render stuff (including our animation)
        setTimeout(() => {
          this.participantManager.getIdentity((err, identity) => {
            if (err)
              return self.showErrorToast(`Could not retrieve identity. Build process seems to not have worked properly`);
            self._updateLoading(this.model.loading.booted.status, this.model.loading.booted.progress)
            self.model.participant = identity;
            // Give UI some time to breathe and render stuff, it needs it this time...
            setTimeout(() => {
              self._concludeLoading();
            }, 500);
          });
        }, Math.floor(Math.random() * 100));
    }
}
