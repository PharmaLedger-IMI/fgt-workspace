const { WebcController } = WebCardinal.controllers;

/**
 * Master Controller to provide access to the Localization features provided by WebCardinal.
 *
 * Also provides integration with WebCardinal config api eg: {@link setIdentity}
 *
 * All child classes must perform the following on their constructor:
 * <pre code=javascript>
 *      constructor(element, history){
 *          super(element, history);
 *          super.bindLocale(this, pageName);
 *          this.setModel(this.getModel());
 *      }
 * </pre>
 */
export default class LocalizedController extends WebcController {
    getModel = () => {
        throw new Error("Child classes must implement this");
    }

    /**
     * Sets the identity that is shown on the menu's identity component
     * @param {Participant} identity
     */
    setIdentity = (identity) => {
        const id = WebCardinal.root.querySelector('webc-app-identity');
        id.name = identity.name;
        id.email = identity.id;
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
     */
    showIonicModal(modalName, swipeToClose){
        swipeToClose = !!swipeToClose;
        const modal = this.createElement('ion-modal',{
            component: modalName,
            controller: "RegistrationController",
            backdropDismiss: false,
            swipeToClose: swipeToClose
        });
        WebCardinal.root.querySelector('webc-container[controller="HomeController"]').append(modal)
        return modal.present();
    }

    /**
     * Adds the locale info to the model.
     * @param {LocalizedController} controller
     * @param {string} pageName
     */
    bindLocale(controller, pageName){
        require('wizard').Services.WebcLocaleService.bindToLocale(controller, pageName);
    }

    constructor(element, history) {
        super(element, history);
        require('wizard').Model.Validations.bindIonicValidation(this);
    }
}
