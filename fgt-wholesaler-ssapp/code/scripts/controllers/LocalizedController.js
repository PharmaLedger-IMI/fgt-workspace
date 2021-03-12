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
     * Adds the locale info to the model.
     * @param {LocalizedController} controller
     * @param {string} pageName
     */
    bindLocale(controller, pageName){
        require('wizard').Services.WebcLocaleService.bindToLocale(controller, pageName);
    }

    constructor(element, history) {
        super(element, history);
    }
}
