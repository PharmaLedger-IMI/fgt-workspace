import ModalController from "../../cardinal/controllers/base-controllers/ModalController.js";
const Product = require('wizard').Model.Product;

export default class ProductController extends ModalController {
    constructor(element, history) {
        super(element, history);
        const LocaleService = require('wizard').Services.LocaleService;
        LocaleService.bindToLocale(this, LocaleService.supported.en_US, "product");
        this.model = this.setModel({});

        let state = this.History.getState();

        element.addEventListener('submit-product', this._handleSubmit.bind(this), true);
    }

    _handleSubmit(event){
        let product = new Product(this.model);
        this.send('perform-add-product', product, true);
    }
}