import ContainerController from "../../cardinal/controllers/base-controllers/ContainerController.js";
import {getProductManager} from "../managers/ProductManager.js"
const Product = require('wizard').Model.Product;

export default class ProductsController extends ContainerController {
    constructor(element, history) {
        super(element, history);
        const wizard = require('wizard');
        const LocaleService = wizard.Services.LocaleService;
        LocaleService.bindToLocale(this, LocaleService.supported.en_US, "products");
        this.productManager = getProductManager(this.DSUStorage);
        this.idManager = wizard.Managers.getIdManager(this.DSUStorage, "traceability");

        this.model = this.setModel({
            mah: {},
            products: {}
        });

        this.model.addExpression('hasProducts', () => {
           return typeof this.model.products !== undefined && this.model.products.length > 0;
        });

        let self = this;
        this.on('add-product', (event) => {
            event.stopImmediatePropagation();
            self._showProductModal();
        });

        this.on('perform-add-product', (event) => {
            event.stopImmediatePropagation();
            self._addProductAsync(event.detail, (err) => {
                if (err)
                    throw err;
                self.closeModal('product-modal');
                self.getProductsAsync();
            });
        });

        this.getProductsAsync();
    }

    _showProductModal(){
        let self = this;
        self.idManager.getId((err, actor) => {
           if (err)
               throw err;
            self.showModal('product-modal', this.productManager.productToModel(new Product({
                manufName: actor.name
            })), true);
        });
    }

    /**
     *
     * @param product
     * @param callback
     * @private
     */
    _addProductAsync(product, callback){
        let self = this;
        self.productManager.createProduct(product, (err, keySSI, path) => {
            if (err)
                return callback(err);
            callback();
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
        this.model = this.setModel({
            products: products,
            hasContent: products.length > 0
        });
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
        self.productManager.listProducts((err, products) => {
            if (err)
                throw err;
            self.updateProducts(products);
        });
    }
}