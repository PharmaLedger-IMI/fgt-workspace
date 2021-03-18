import LocalizedController from "./LocalizedController.js";

export default class IndexController extends LocalizedController {

    getModel = () => ({});

    constructor(element, history) {
        super(element, history);
        console.log(`The index model in the registration controller is: ${WebCardinal.translations}`);
        super.bindLocale(this, "");
        this.setModel(this.getModel());
        console.log("Index controller initialized. redirecting now");
        this.navigateToPageTag('home');
    }
}