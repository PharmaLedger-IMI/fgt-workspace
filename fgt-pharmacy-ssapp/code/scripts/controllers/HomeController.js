import { HomeController as BaseHomeController, EVENT_SSAPP_HAS_LOADED } from "../../assets/pdm-web-components/index.esm.js";
export default class HomeController extends BaseHomeController{
    constructor(...args) {
        super(...args);
        let self = this;
        self.on(EVENT_SSAPP_HAS_LOADED, (evt) => {
            if (self.model.participant)
                self.showToast(`Welcome back to Finished Goods Traceability's Pharmacy App ${self.model.participant.name}`);
        }, {capture: true});
    }
}