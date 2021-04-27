import { LocalizedController } from "../../assets/pdm-web-components/index.esm.js";
const Product = require('wizard').Model.Product;

export default class StockController extends LocalizedController{
    initializeModel = () => ({
        stock: []
    });

    constructor(element, history) {
        super(element, history);
        super.bindLocale(this, "stock");
        const wizard = require('wizard');

        const participantManager = wizard.Managers.getParticipantManager();
        this.stockManager = wizard.Managers.getStockManager(participantManager);

        this.model = this.initializeModel();

        this.model.addExpression('hasStock', () => {
            return typeof this.model.stock !== 'undefined' && this.model.stock.length > 0;
        }, 'stock');

        this.on('refresh', (evt) => {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            this.getStockAsync();
        }, {capture: true});
    }

    /**
     * Updates the stock model
     * @param {object[]} stock where the properties must be:
     */
    updateStock(stock){
        this.model['stock'] = stock;
    }

    /**
     * Retrieves the products from the DSU and updates the model
     * by calling {@link StockController#updateStock} after retrieval
     */
    getStockAsync(){
        let self = this;
        self.stockManager.getByStatus((err, stock) => {
            if (err)
                return callback(err);
            self.updateStock(self.stockManager.toModel(stock));
        });
    }
}