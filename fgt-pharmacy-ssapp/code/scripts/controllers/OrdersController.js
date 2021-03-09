import ContainerController from "../../cardinal/controllers/base-controllers/ContainerController.js";
//import {getOrderManager} from "../managers/OrderManager.js"
const Order = require('wizard').Model.Order;

export default class OrdersController extends ContainerController {
    constructor(element, history) {
        super(element, history);
        const wizard = require('wizard');
        const LocaleService = wizard.Services.LocaleService;
        LocaleService.bindToLocale(this, LocaleService.supported.en_US, "orders");
        //this.orderManager = getOrderManager(this.DSUStorage);
        this.participantManager = wizard.Managers.getParticipantManager(this.DSUStorage, "traceability");

        this.model = this.setModel({
            pharmacy: undefined,
            orders: [],
            hasOrders: false
        });

        let self = this;
        this.on('add-order', (event) => {
            event.stopImmediatePropagation();
            self._showOrderModal();
        });

        this.on('perform-add-orders', (event) => {
            event.stopImmediatePropagation();
            self._addOrderAsync(event.detail, (err) => {
                if (err) {
                    this.showError(err);
                    return;
                }
                self.closeModal('product-modal');
                self.getOrdersAsync();
            });
        });

        this.getOrdersAsync();
    }

    _showOrderModal() {
        let self = this;
        self.participantManager.getParticipant((err, participant) => {
            if (err)
                throw err;
            self.showModal('order-modal', self.orderManager.toModel(new Order({
                manufName: participant.name
            })), true);
        });
    }

    /**
     *
     * @param order
     * @param callback
     * @private
     */
    _addOrderAsync(order, callback) {
        let self = this;
        self.orderManager.create(order, (err, keySSI, path) => {
            if (err)
                return callback(err);
            callback();
        });
    }

    /**
     * Updates the products model
     * @param {object[]} orders.
     */
    updateOrders(orders) {
        this.model['orders'] = orders;
        this.model['hasOrders'] = orders.length > 0;
    }

    /**
     * Retrieves the orders from the DSU and updates the model
     * by calling {@link OrdersController#updateOrders} after retrieval
     */
    getOrdersAsync() {
        let self = this;
        if (!self.model.pharmacy) {
            console.log("getOrdersAsync getParticipant");
            self.participantManager.getParticipant((err, participant) => {
                if (err)
                    return self.showError(err);
                self.model.pharmacy = participant;
                self.getOrdersAsync();
            });
        } else {
            console.log("getOrdersAsync getOrders");
            self.participantManager.getOrders(self.model.pharmacy, (err, orders) => {
                console.log("getOrdersAsync gotOrders ", orders);
                if (err)
                    return self.showError(err);
                self.model.orders = orders;
                self.model.hasOrders = orders.length > 0;
            })
        }
    }
}