import ModalController from "../../cardinal/controllers/base-controllers/ModalController.js";
const Product = require('wizard').Model.Product;

export default class ProductController extends ModalController {
    constructor(element, history) {
        super(element, history);
        const LocaleService = require('wizard').Services.LocaleService;
        LocaleService.bindToLocale(this, LocaleService.supported.en_US, "product");

        let state = this.History.getState();

        this.on('showModalEvent', data => {
            console.log(data.details);
        });

        element.addEventListener('submit-product', this._handleSubmit.bind(this));
    }

    _modelToProduct(){
        const model = this.model;
        return new Product({
            gtin: model.gtin.value,
            name: model.name.value,
            description: model.description.value,
            manufName: model.manufName.value
        })
    }

    _handleSubmit(event){
        let product = this._modelToProduct();
        this.send('perform-add-product', product);
    }
}