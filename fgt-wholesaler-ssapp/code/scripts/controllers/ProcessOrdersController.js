const {WebcController} = WebCardinal.controllers;
const Order = require('wizard').Model.Order;
const OrderLine = require('wizard').Model.OrderLine;
const Shipment = require('wizard').Model.Shipment;

export default class BatchesController extends WebcController {
    constructor(element, history) {
        super(element, history);
        const wizard = require('wizard');
        const LocaleService = wizard.Services.LocaleService;
        LocaleService.bindToLocale(this, LocaleService.supported.en_US, "processorders");
        const participantManager = wizard.Managers.getParticipantManager();
        this.stockManager = wizard.Managers.getStockManager(participantManager.getParticipantDSU());

        this.setModel({
            pendingOrders: []
        });

        this.model.addExpression('hasPendingOrders', () => {
            return typeof this.model.pendingOrders !== 'undefined' && this.model.pendingOrders.length > 0;
        }, 'pendingOrders');

        this.getPendingOrdersAsync();
    }

    /**
     * Updates the batches model
     * @param {object[]} orders
     */
    updatePendingOrders(orders){
        this.model['pendingOrders'] = orders;
    }

    /**
     * Retrieves the batches from the product DSU and updates the model
     */
    getPendingOrdersAsync(){
        let self = this;
        let pending = [1, 2, 3].map(orderId => self._genOrder(orderId));
        self.updatePendingOrders(pending);
    }

    _genOrder(index) {
        let gtins = [1, 435, 1241, 435346]
        return new Order(index, 1, 2, "address", undefined, gtins.map(gtin => {
                return new OrderLine(gtin, 100, 1, 2);
            }));
    }
}