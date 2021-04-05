import LocalizedController from "./LocalizedController.js";
const Product = require('wizard').Model.Product;

export default class ShipmentController extends LocalizedController{
    constructor(element, history) {
        super(element, history, "shipment");
        const wizard = require('wizard');
        const participantManager = wizard.Managers.getParticipantManager();
        //this.stockManager = wizard.Managers.getShipmentManager(participantManager);

        // this.setModel({
        //     stock: []
        // });
        //
        // this.model.addExpression('hasStock', () => {
        //     return typeof this.model.stock !== 'undefined' && this.model.stock.length > 0;
        // }, 'stock');
        //
        // this.getStockAsync();
    }
}