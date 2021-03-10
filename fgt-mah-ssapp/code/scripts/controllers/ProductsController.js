import ContainerController from "../../cardinal/controllers/base-controllers/ContainerController.js";
const Product = require('wizard').Model.Product;

export default class ProductsController extends ContainerController {
    constructor(element, history) {
        super(element, history);
        const wizard = require('wizard');
        const LocaleService = wizard.Services.LocaleService;
        LocaleService.bindToLocale(this, LocaleService.supported.en_US, "products");
        this.participantManager = wizard.Managers.getParticipantManager();
        this.productManager = wizard.Managers.getProductManager(this.participantManager.getParticipantDSU());

        this.model = this.setModel({
            mah: {},
            products: [],
            hasProducts: false
        });

        let self = this;
        this.on('add-product', (event) => {
            event.stopImmediatePropagation();
            self._showProductModal();
        });

        this.on('perform-add-product', (event) => {
            event.stopImmediatePropagation();
            self._addProduct(event.detail, (err) => {
                if (err) {
                    this.showError(err);
                    return;
                }
                self.closeModal('product-modal');
                self.getProductsAsync();
            });
        });

        this.on('manage-batches', (event) => {
            event.stopImmediatePropagation();
            const gtin = event.target.getAttribute("gtin");
            this.History.navigateToPageByUrl("/batches", {gtin: gtin});
        });

        this.getProductsAsync();
    }

    _showProductModal(){
        let self = this;
        self.participantManager.getParticipant((err, actor) => {
           if (err)
               throw err;
            self.showModal('product-modal', self.productManager.toModel(new Product({
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
        this.model['hasProducts'] = products.length > 0;
    }

    /**
     * Retrieves the products from the DSU and updates the model
     * by calling {@link ProductsController#updateProducts} after retrieval
     */
    getProductsAsync(){
        let self = this;
        self.productManager.getAll((err, products) => {
            if (err)
                throw err;
            self.updateProducts(products);
        });
    }
}