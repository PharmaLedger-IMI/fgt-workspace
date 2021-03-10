import ContainerController from "../../cardinal/controllers/base-controllers/ContainerController.js";
const Product = require('wizard').Model.Product;

export default class StockController extends ContainerController {
    constructor(element, history) {
        super(element, history);
        const wizard = require('wizard');
        const LocaleService = wizard.Services.LocaleService;
        LocaleService.bindToLocale(this, LocaleService.supported.en_US, "stock");
        const participantManager = wizard.Managers.getParticipantManager();
        this.stockManager = wizard.Managers.getStockManager(participantManager.getParticipantDSU());

        this.setModel({
            stock: []
        });

        this.model.addExpression('hasStock', () => {
            return typeof this.model.stock !== 'undefined' && this.model.stock.length > 0;
        }, 'stock');

        this.getStockAsync();
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