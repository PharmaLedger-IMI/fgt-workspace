import { w as wizard } from './WizardService-462ec42a.js';
import { W as WebManagerService } from './WebManagerService-82558d63.js';

const EVENT_CONFIG_GET_CORE_TYPE = 'webcardinal:config:getCoreType';
const EVENT_CONFIG_GET_DOCS_SOURCE = 'webcardinal:config:getDocsSource';
const EVENT_CONFIG_GET_IDENTITY = 'webcardinal:config:getIdentity';
const EVENT_CONFIG_GET_LOG_LEVEL = 'webcardinal:config:getLogLevel';
const EVENT_CONFIG_GET_ROUTING = 'webcardinal:config:getRouting';
// export const EVENT_CONFIG_GET_TRANSLATIONS = 'webcardinal:config:getTranslations';
// export const EVENT_CONFIG_GET_SKINS = 'webcardinal:config:getSkins';
const EVENT_MODEL_GET = 'webcardinal:model:get';
const EVENT_ROUTING_GET = 'webcardinal:routing:get';
const EVENT_TAGS_GET = 'webcardinal:tags:get';
const EVENT_TRANSLATION_MODEL_GET = 'webcardinal:translationModel:get';
/**
 * @namespace Constants
 */
/**
 * Send error Event. Handled by Home Controller
 * @memberOf Constants
 */
const EVENT_SEND_ERROR = 'ssapp-send-error';
/**
 * Send Message Event. Handled by Home Controller
 * @memberOf Constants
 */
const EVENT_SEND_MESSAGE = 'ssapp-send-message';
/**
 * Signals when the SSApp has loaded
 * @memberOf Constants
 */
const EVENT_SSAPP_HAS_LOADED = 'ssapp-has-loaded';
/**
 * signals loading progress
 * @memberOf Constants
 */
const EVENT_SSAPP_STATUS_UPDATE = 'ssapp-update-status';
/**
 * Signals a refresh event
 * @memberOf Constants
 */
const EVENT_REFRESH = 'ssapp-refresh';
/**
 * Send Select event
 * @memberOf Constants
 */
const EVENT_SELECT = 'ssapp-select';
/**
 * Standard event for navigation events on PDM's SSApp Architecture
 * Expects an object like
 * <pre>
 *  {
 *    tab: 'tab name',
 *    props: 'optional properties that will appear on the tab's controller's {@link EVENT_REFRESH} event detail
 *  }
 * </pre>
 *
 * @memberOf Constants
 */
const EVENT_NAVIGATE_TAB = 'ssapp-navigate-tab';
/**
 * Show more event
 * @memberOf Constants
 */
const EVENT_SHOW_MORE = 'ssapp-show-more';
/**
 * Send action event
 * @memberOf Constants
 */
const EVENT_ACTION = 'ssapp-action';
/**
 * Ioniuc's tab change event
 * @memberOf Constants
 */
const EVENT_ION_TABS_WILL_CHANGE = "ionTabsWillChange";
/**
 * CSS constants
 * @memberOf Constants
 */
const CSS = {
  ALERT: 'ssapp-alert',
  TOAST: 'ssapp-toast',
  SPINNER: 'ssapp-spinner'
};
/**
 * Button roles
 * @memberOf Constants
 */
const BUTTON_ROLES = {
  CONFIRM: 'confirm',
  CANCEL: 'cancel'
};
/**
 * Specific CSS selector for the side menu button
 * @memberOf Constants
 */
const SIDE_MENU_CLASS_SELECTOR = ".side-menu menu-tab-button";

class WebController{
  constructor(...args){
    console.log(`Called constructor of Mock Controller with args:`, ...args);
  }

  on(...args){
    console.log(`Called ON on the mock Controller with args:`, ...args);
  }
}

let BaseController;
try {
  const {WebcController} = WebCardinal.controllers;
  BaseController = WebcController;
} catch (e) {
  BaseController = WebController;
}


/**
 * Master Controller to provide access to the Localization features provided by WebCardinal.
 *
 * Also provides integration with pdm's web components error events
 *
 * All child classes must perform the following on their constructor:
 * <pre code=javascript>
 *      constructor(element, history){
 *          super(element, history);
 *          super.bindLocale(this, pageName);
 *          this.model = this.initializeModel();
 *      }
 * </pre>
 * @memberOf Controllers
 * @class LocalizedController
 * @extends WebcController
 * @abstract
 */
class LocalizedController extends BaseController {

  /**
   * Should return the initialized model for the controller when needed.
   * <strong>MUST</strong> be called on the constructor for locale binding via {@link WebcLocaleService}
   * @return {{}}
   */
  initializeModel = () => ({});

  /**
   * Shows an Ionic model
   * @param {string} modalName the modal's name registered via:
   * <pre>
   *     customElements.define('registration-modal', class extends HTMLElement{
   *          connectedCallback(){
   *              this.innerHTML = `
   *                  <ion-header class="ion-padding">
   *                      <ion-title>Title</ion-title>
   *                      <ion-content>
   *                          Content
   *                      </ion-content>
   *                  </ion-header>`
   *              }
   *          });
   * </pre>
   * @param {boolean} [swipeToClose]: enables slideToClose when available. defaults to false
   * @param {object} [params]: passes param to modal (ionic functionality)
   * @deprecated
   */
  showIonicModal(modalName, swipeToClose, params) {
    if (typeof swipeToClose === 'object') {
      params = swipeToClose;
      swipeToClose = false;
    }
    swipeToClose = !!swipeToClose;
    this.modal = this.createAndAddElement('ion-modal', {
      id: `Id${modalName}`,
      component: modalName,
      backdropDismiss: false,
      swipeToClose: swipeToClose,
      componentProps: params
    });
    this.modal.present();
  }

  /**
   * @deprecated
   */
  closeIonicModal() {
    if (this.modal)
      this.modal.dismiss();
  }

  /**
   * Shows a Toast via {@link showToast} with
   *  - header: 'Error'
   *  - cssClass: 'danger
   *  - button: 'Close'
   * @param {string} message
   * @param {err} [err]
   */
  showErrorToast(message, err) {
    if (this.useEvents)
      return this.send(EVENT_SEND_ERROR, message, {capture: true});
    return this.showToast(message + (err ? `\n$err` : ''), 'Error', 'danger', 'Close');
  }

  /**
   * Integrates with {@link PdmBarcodeScannerController}. that mean that element needs to be somewhere,
   * typically inside ion-tabs
   * @param {{}} [props] props to pass to scanner:
   *  - title: the modal title. falls back to its barcode-title prop
   * @param {function(err, result)} callback
   */
  showBarcodeScanner(props, callback){
    if (!callback && typeof props === 'function'){
      callback = props;
      props= undefined;
    }
    const getScannerByHost = function(host){
      return host.querySelector('pdm-barcode-scanner-controller');
    };

    let scannerEl = getScannerByHost(this.element) || getScannerByHost(document.body);
    if (!scannerEl)
      return callback(`Could not find the mandatory 'pdm-barcode-scanner-controller' element`);
    scannerEl.present(props, callback);
  }

  /**
   * Shows Toast Alert
   *
   * @param {string} message
   * @param {string} [header] if given will be presenter in the header
   * @param {string|string[]} [cssClass]
   * @param {string} button the text on the close button
   * @param {function()} buttonHandler
   */
  showToast(message, header, cssClass, button, buttonHandler) {
    if (this.useEvents)
      return this.send(EVENT_SEND_MESSAGE, message, {capture: true});

    const toast = this.createAndAddElement('ion-toast');
    toast.header = header;
    toast.message = message;
    toast.position = 'bottom';
    toast.duration = 2000;
    if (cssClass)
      toast.cssClass = cssClass || CSS.TOAST;
    if (button)
      toast.buttons = [
        {
          text: button,
          role: BUTTON_ROLES.CANCEL,
          handler: buttonHandler ? buttonHandler : () => {
            console.log('Cancel clicked');
          }
        }
      ];

    return toast.present();
  }

  /**
   * Shows an alert with the specified message.
   *
   * Standard Usage:
   * <pre>
   *   const alert = await controller.showAlert('this is an <strong>alert</strong> message');
   *   const { role } = await alert.onDidDismiss();
   *   console.log('onDidDismiss resolved with role', role);
   *   if (role === 'confirm') ...
   *   if (role === 'cancel') ...
   * </pre>
   *
   * @param {string} message
   * @param {object} options object with additional configuration options:
   * <pre>
   *   {
   *     cssClass: '...' css class to be used. defaults to 'ssapp-alert'
   *     header: '...' Title text (optional)
   *     subHeader: '...' subTitle text (optional)
   *     buttons: [
   *       {
   *         text: '...' button text,
   *         role: '...' sets a role to be caught by the handler method
   *         cssClass: '...' additional styling
   *         handler: (e) => {      (optional and not recommended)
   *            console.log(e);
   *         }
   *       }
   *     ]
   *   }
   * </pre>
   *
   * defaults to:
   * <pre>
   *   {
   *    buttons: [
   *      {
   *        text: 'Ok',
   *        role: 'confirm'
   *      },
   *      {
   *        text: 'Cancel',
   *        role: 'cancel'
   *      }
   *    ]
   *   }
   * </pre>
   * @return {HTMLElement}
   */
  async showAlert(message, options){
    options = Object.assign( {
      buttons: [
        {
          text: 'Cancel',
          role: BUTTON_ROLES.CANCEL
        },
        {
          text: 'Ok',
          role: BUTTON_ROLES.CONFIRM
        }
      ]
    }, options || {});

    const alert = document.createElement('ion-alert');
    alert.cssClass = options.cssClass || CSS.ALERT;
    alert.header = options.header;
    alert.subHeader = options.subHeader;
    alert.message = message;
    alert.animated = options.animated !== false;
    alert.backDropDismiss = options.backDropDismiss !== false;
    alert.buttons = options.buttons;

    document.body.appendChild(alert);
    await alert.present();
    return alert;
  }

  /**
   * Shows a confirmation Popup
   * @param {string} message the message
   * @param {string} confirmText the ok button text
   * @param {string} cancelText the cancel button text
   * @return {Promise<HTMLElement>}
   */
  async showConfirm(message, confirmText, cancelText = "Cancel"){
    return this.showAlert(message,
      {
        buttons: [
          {
            text: cancelText,
            role: 'cancel'
          },
          {
            text: confirmText,
            role: 'confirm'
          }
        ]
      });
  }


  /**
   * Instantiates a new Spinner
   *
   * API:
   * <pre>
   *     const loader = controller._getLoader('message', options);
   *     await loader.present();
   *     ...
   *     await loader.dismiss();
   * </pre>
   *
   * for styling the class
   *
   * @param {string} message
   * @param {object} [options] accepts params:
   *  - duration duration in ms. (no duration or 0) makes the spinner stay until dismissed (defaults to 0);
   *  - cssClass css class to append. defaults to 'ion-loading'
   *  - translucent defaults to true
   *
   * @return {ion-loading} a spinner
   * @protected
   */
  _getLoader(message, options){
    options = options || {};
    let {duration, cssClass, translucent} = options;
    duration = duration || 0;
    cssClass = cssClass || CSS.SPINNER;
    translucent = translucent !== false;
    const loading = document.createElement('ion-loading');
    loading.cssClass = cssClass;
    loading.message = message;
    loading.translucent = translucent;
    loading.duration = duration;
    document.body.appendChild(loading);
    return loading;
  }

  /**
   * Adds the locale info to the model.
   * @param {LocalizedController} controller
   * @param {string} [pageName]
   * @param {boolean} [enableValidations] defaults to false. If provided enabled Ionic Inputs form validations
   */
  bindLocale(controller, pageName, enableValidations) {
    wizard.LocaleService.bindToLocale(controller, pageName);
    if (enableValidations)
      wizard.Model.Validations.bindIonicValidation(controller);
  }

  /**
   * Makes the controller listen for the {@link EVENT_SEND_ERROR} event and show the error toast to the user
   * @protected
   */
  _bindErrorHandler(){
    let self = this;
    self.on(EVENT_SEND_ERROR, (evt) => {
      evt.preventDefault();
      evt.stopImmediatePropagation();
      self.showErrorToast(evt.detail);
    }, {capture: true});
  }

  /**
   * Makes the controller listen for the {@link EVENT_SEND_MESSAGE} event and show the toast to the user
   * @protected
   */
  _bindMessageHandler(){
    let self = this;
    self.on(EVENT_SEND_MESSAGE, (evt) => {
      evt.preventDefault();
      evt.stopImmediatePropagation();
      self.showToast(evt.detail);
    }, {capture: true});
  }

  /**
   * Calls Refresh on the controller
   * @param {{}} [detail] option props to pass on the event
   */
  refresh(detail){
    this.send(EVENT_REFRESH, detail || {}, {capture: true});
  }

  /**
   *
   * @param tabName
   * @param props
   */
  navigateToTab(tabName, props){
    this.send(EVENT_NAVIGATE_TAB, {
      tab: tabName,
      props: props
    });
  }

  /**
   * Override just for the special case of {@link EVENT_SSAPP_HAS_LOADED} to set it on document body and not the element it self because its raised on the body level
   * @param eventName
   * @param handler
   * @param options
   * @override
   */
  on(eventName, handler, options){
    if (eventName === EVENT_SSAPP_HAS_LOADED && document && document.body)
      return document.body.addEventListener(eventName, handler, options);
    super.on(eventName, handler, options);
  }

  /**
   *
   * @param {boolean} [bindMessageHandlers] defaults to false. binds (or not) the error handler to the controller
   * @param args the args for {@link WebcController}
   */
  constructor(bindMessageHandlers, ...args) {
    super(...args);
    if (typeof bindMessageHandlers === 'undefined'){
      this.useEvents = false;
    } else if(typeof bindMessageHandlers === 'boolean'){
      if (bindMessageHandlers){
        this._bindErrorHandler();
        this._bindMessageHandler();
        this.useEvents = false;
      } else {
        this.useEvents = true;
      }
    }
  }
}

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
class HomeController extends LocalizedController {
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
        const self = this;
        self._updateLoading(this.model.loading.loading.status, this.model.loading.loading.progress);

        this.on(EVENT_ION_TABS_WILL_CHANGE, (evt) => {
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
                el.dispatchEvent(event);
              });
            }

        }, {capture: true});

        this.on(EVENT_NAVIGATE_TAB, (evt) => {
          evt.preventDefault();
          evt.stopImmediatePropagation();
          self._navigateToTab.call(self, evt.detail);
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
            }, Math.floor(Math.random() * 100));
        });

        participantManager.setController(this);
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
        console.log(`A tab navigation request was received, but no ion-tabs could be found...`);
        return;
      }
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
            self._updateLoading(this.model.loading.booted.status, this.model.loading.booted.progress);
            self.model.participant = identity;

            // Give UI some time to breathe and render stuff, it needs it this time...
            setTimeout(() => {
              self._concludeLoading();
            }, 500);

          });
        }, Math.floor(Math.random() * 100));
    }
}

/**
 * @namespace pdm-web-components
 */

export { BUTTON_ROLES, CSS, EVENT_ACTION, EVENT_CONFIG_GET_CORE_TYPE, EVENT_CONFIG_GET_DOCS_SOURCE, EVENT_CONFIG_GET_IDENTITY, EVENT_CONFIG_GET_LOG_LEVEL, EVENT_CONFIG_GET_ROUTING, EVENT_ION_TABS_WILL_CHANGE, EVENT_MODEL_GET, EVENT_NAVIGATE_TAB, EVENT_REFRESH, EVENT_ROUTING_GET, EVENT_SELECT, EVENT_SEND_ERROR, EVENT_SEND_MESSAGE, EVENT_SHOW_MORE, EVENT_SSAPP_HAS_LOADED, EVENT_SSAPP_STATUS_UPDATE, EVENT_TAGS_GET, EVENT_TRANSLATION_MODEL_GET, HomeController, LocalizedController, SIDE_MENU_CLASS_SELECTOR };
