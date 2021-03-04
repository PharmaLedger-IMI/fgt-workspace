import ContainerController from "../../cardinal/controllers/base-controllers/ContainerController.js";
import {getProductManager} from "../managers/ProductManager.js"


export default class ProductsController extends ContainerController {
    constructor(element, history) {
        super(element, history);
        this.manager = getProductManager(this.DSUStorage);
        const LocaleService = require('wizard').Services.LocaleService;
        LocaleService.bindToLocale(this, LocaleService.supported.en_US, "products");
        this.model = this.setModel({
            mah: {},
            hasProducts: false,
            products: {}
        });

        element.addEventListener('add-product', (event) => {
            event.preventDefault();
            event.stopImmediatePropagation();
            this.showModal('product-modal', {});
        });

        element.addEventListener('perform-add-product', (event) => {
            event.preventDefault();
            event.stopImmediatePropagation();
            console.log(event);
        });

        this.getProductsAsync();
    }

    /**
     * Adds a product
     * @param product
     * @param callback
     * @private
     */
    _addProduct(product, callback){
        this.manager.createProduct(product, (err, keySSI, path) => {

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
        this.model.products = products;
        this.model.hasContent = products.length > 0;
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