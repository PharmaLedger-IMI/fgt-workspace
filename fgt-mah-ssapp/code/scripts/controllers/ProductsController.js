import { LocalizedController } from "../../assets/pdm-web-components/index.esm.js";
const Product = require('wizard').Model.Product;

export default class ProductsController extends LocalizedController {

    getModel = () => ({
        mah: {},
        products: []
    });

    constructor(element, history) {
        super(element, history);
        const wizard = require('wizard');
        const LocaleService = wizard.Services.WebcLocaleService;
        LocaleService.bindToLocale(this,"products");
        this.participantManager = wizard.Managers.getParticipantManager();
        this.productManager = wizard.Managers.getProductManager(this.participantManager);

        this.setModel(this.getModel());

        let self = this;
        // this.on('add-product', (event) => {
        //     event.stopImmediatePropagation();
        //     self._showProductModal();
        // });

        // this.on('perform-add-product', (event) => {
        //     event.stopImmediatePropagation();
        //     self._addProduct(event.detail, (err) => {
        //         if (err) {
        //             this.showError(err);
        //             return;
        //         }
        //         self.closeModal('product-modal');
        //         self.getProductsAsync();
        //     });
        // });
        //
        // this.on('manage-batches', (event) => {
        //     event.stopImmediatePropagation();
        //     const gtin = event.target.getAttribute("gtin");
        //     this.History.navigateToPageByUrl("/batches", {gtin: gtin});
        // });

        self.model.addExpression('hasProducts', () => {
            return typeof self.model.products !== 'undefined' && self.model.products.length > 0;
        }, 'products');

        this.on('refresh', (evt) => {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            this.getProductsAsync();
        }, {capture: true});
    }
    //
    // _showProductModal(){
    //     let self = this;
    //     self.participantManager.getParticipant((err, actor) => {
    //        if (err)
    //            throw err;
    //         self.showModal('product-modal', self.productManager.toModel(new Product({
    //             manufName: actor.name
    //         })), true);
    //     });
    // }

    /**
     *
     * @param product
     * @param callback
     * @private
     */
    _addProduct(product, callback){
        let self = this;
        self.productManager.create(product, (err, keySSI, path) => {
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
        this.model['products'] = products;
    }

    /**
     * Retrieves the products from the DSU and updates the model
     * by calling {@link ProductsController#updateProducts} after retrieval
     */
    getProductsAsync(){
        let self = this;
        self.productManager.getAll(true, (err, products) => {
            if (err)
                return self.showErrorToast(`Could not list products`, err);
            self.updateProducts(products);
        });
    }
}