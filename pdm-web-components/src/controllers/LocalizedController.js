/**
 * @module controllers
 */

import {EVENT_SEND_ERROR, EVENT_SEND_MESSAGE, EVENT_REFRESH, EVENT_NAVIGATE_TAB} from "../constants/events";

/**
 *
 */
const {WebcController} = WebCardinal.controllers;

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
 * @module controllers
 * @class LocalizedController
 */
export default class LocalizedController extends WebcController {
  initializeModel = () => {
    throw new Error("Child classes must implement this");
  }

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
      toast.cssClass = cssClass;
    if (button)
      toast.buttons = [
        {
          text: button,
          role: 'cancel',
          handler: buttonHandler ? buttonHandler : () => {
            console.log('Cancel clicked');
          }
        }
      ];

    return toast.present();
  }

  /**
   * Adds the locale info to the model.
   * @param {LocalizedController} controller
   * @param {string} [pageName]
   * @param {boolean} [enableValidations] defaults to false. If provided enabled Ionic Inputs form validations
   */
  bindLocale(controller, pageName, enableValidations) {
    require('wizard').Services.WebcLocaleService.bindToLocale(controller, pageName);
    if (enableValidations)
      require('wizard').Model.Validations.bindIonicValidation(controller);
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

  refresh(){
    this.send(EVENT_REFRESH, {}, {capture: true});
  }

  navigateToTab(tabName, props){
    this.send(EVENT_NAVIGATE_TAB, {
      tab: tabName,
      props: props
    });
  }

  /**
   *
   * @param {HTMLElement} element
   * @param {*} history
   * @param {boolean} [bindMessageHandlers] defaults to false. binds (or not) the error handler to the controller
   */
  constructor(element, history, bindMessageHandlers) {
    super(element, history);
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
