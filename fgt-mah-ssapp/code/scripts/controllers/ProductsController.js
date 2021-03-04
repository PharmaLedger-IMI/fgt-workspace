import ContainerController from "../../cardinal/controllers/base-controllers/ContainerController.js";
import {getProductManager} from "../managers/ProductManager.js"

const wizard = require('wizard');
const LocaleService = wizard.Services.LocaleService;

export default class ProductsController extends ContainerController {
    constructor(element, history) {
        super(element, history);
        this.manager = getProductManager(this.DSUStorage);
        LocaleService.bindToLocale(this, LocaleService.supported.en_US, "products");
        this.model = this.setModel({
            mah: {},
            products: {}
        });

        element.addEventListener('new-product', (event) => {
            event.preventDefault();
            event.stopImmediatePropagation();
            this.showModal('product-modal', {});
        });
    }

    /**
     * Updates the products model
     * @param {object[]} products where the properties must be:
     * <ul>
     *     <li>*gtin:* {@link Product#gtin}</li>
     *     <li>*product:* {@link Product}</li>
     *     <li>*index:* not implemented. for sorting/filtering purposes</li>
     * </ul>
     */
    updateProducts(products){
        this.model.products = this.setModel(products);
    }

    /**
     * Util method to transform List into updatable objects
     * @param {Product[]} products
     * @private
     */
    _toUpdatableModel(products){
        let result = [];
        products.forEach((product, i) => {
            result.push({
                gtin: product.gtin,
                product: product,
                index: i
            });
        });
        return result;
    }

    /**
     * Retrieves the products from the DSU and updates the model
     * by calling {@link ProductsController#updateProducts} after retrieval
     */
    getProductsAsync(){
        let self = this;
        self.manager.listProducts((err, products) => {
            if (err)
                throw err;
            self.updateProducts(products);
        });
    }
}