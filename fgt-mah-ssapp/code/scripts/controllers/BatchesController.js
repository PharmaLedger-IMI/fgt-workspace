import ContainerController from "../../cardinal/controllers/base-controllers/ContainerController.js";
import {getProductManager} from "../managers/ProductManager.js";
const Product = require('wizard').Model.Product;

export default class BatchesController extends ContainerController {
    constructor(element, history) {
        super(element, history);
        const wizard = require('wizard');
        const LocaleService = wizard.Services.LocaleService;
        LocaleService.bindToLocale(this, LocaleService.supported.en_US, "batches");
        this.productManager = getProductManager(this.DSUStorage);
        console.log(this.model);


    }
}