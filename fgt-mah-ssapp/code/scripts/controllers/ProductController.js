import ModalController from "../../cardinal/controllers/base-controllers/ModalController.js";
import {getProductManager} from "../managers/ProductManager.js"
const Product = require('wizard').Model.Product;

export default class ProductController extends ModalController {
    constructor(element, history) {
        super(element, history);
        const LocaleService = require('wizard').Services.LocaleService;
        LocaleService.bindToLocale(this, LocaleService.supported.en_US, "product");
        this.productManager = getProductManager(this.DSUStorage);

        let state = this.History.getState();

        this.on('showModalEvent', data => {
            console.log(data.details);
        });

        element.addEventListener('submit-product', this._handleSubmit.bind(this));
    }

    _handleSubmit(event){
        let product = this.productManager.fromModel(this.model);
        this.send('perform-add-product', product);
    }
}