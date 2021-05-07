import { LocalizedController, EVENT_SEND_ERROR, EVENT_REFRESH } from "../../assets/pdm-web-components/index.esm.js";
const Order = require('wizard').Model.Order;

/**
 * List all the received orders, and allows refresh from inbox.
 */
export default class ProcessOrderController extends LocalizedController {

    initializeModel = () => ({
        order: undefined
    });

    constructor(element, history) {
        super(element, history);
        super.bindLocale(this, "receivedOrders");
        const wizard = require('wizard');
        this.participantManager = wizard.Managers.getParticipantManager();
        this.receivedOrderManager = wizard.Managers.getReceivedOrderManager(this.participantManager);
        this.stockManager = wizard.Managers.getStockManager(this.participantManager);

        this.model = this.initializeModel();

        let self = this;
        // the HomeController takes care of sending refresh events for each tab.
        self.on(EVENT_REFRESH, (evt) => {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            const state = self.getState();
            if (state && state.orderId &&  state.requesterId){
                self.setState(undefined);

            }
        }, {capture: true});
    }

    _getOrderAsync(){

    }
}