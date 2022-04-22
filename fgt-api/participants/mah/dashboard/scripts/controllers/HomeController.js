import { HomeController as BaseHomeController, EVENT_SSAPP_HAS_LOADED } from "../../assets/pdm-web-components/index.esm.js";
/**
 * Central Controller
 *
 * Controls Application Flow
 *
 * Holds all other Controllers and manages identity, database access and messaging via {@link BaseHomeController} and {@link ParticipantManager}
 * @class HomeController
 * @module controllers
 */
export default class HomeController extends BaseHomeController{
    constructor(...args) {
        super(...args);
        let self = this;
        this.model.addExpression('identified', () => {
            return !!this.model.participant.id && this.model.token;
        }, "participant", "token");
        self.on(EVENT_SSAPP_HAS_LOADED, (evt) => {
            // This event must bubble to be caught by the loader
            if (self.model.participant)
                self.showToast(`Welcome back to Finished Goods Traceability's App ${self.model.participant.name}`);
        }, {capture: true});

        self.on("fgt-api-password-submit", (evt) => {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            if (!evt.detail)
                return

            const token = `${self.model.participant.id}:${evt.detail}`
            self.participantManager.getStorage().setToken(token);

            const input = document.querySelector("dashboard-token-input");
            input.remove()
            self.model.token = true;
        })
    }
}