import ContainerController from "../../cardinal/controllers/base-controllers/ContainerController.js";
import {getProductManager} from "../managers/ProductManager.js"
const Product = require('wizard').Model.Product;

export default class ProductsController extends ContainerController {
    constructor(element, history) {
        super(element, history);
        this.productManager = getProductManager(this.DSUStorage);
        const wizard = require('wizard');
        this.idManager = wizard.Managers.getIdManager(this.DSUStorage, "traceability");
        const LocaleService = wizard.Services.LocaleService;
        LocaleService.bindToLocale(this, LocaleService.supported.en_US, "products");
        this.model = this.setModel({
            mah: {},
            hasProducts: false,
            products: {}
        });

        let self = this;
        element.addEventListener('add-product', (event) => {
            event.preventDefault();
            event.stopImmediatePropagation();
            self._showProductModal();
        });

        element.addEventListener('perform-add-product', (event) => {
            event.preventDefault();
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
            self.showModal('product-modal', self._productToModel(new Product({
                manufName: actor.name
            })), true);
        });
    }

    _productToModel(product){
        let model = {};
        Object.keys(product).forEach(k => {
                if (product.hasOwnProperty(k))
                    model[k] = {
                        value: product[k]
                    };
            });
        return model;
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
        self.productManager.listProducts((err, products) => {
            if (err)
                throw err;
            self.updateProducts(products);
        });
    }
}