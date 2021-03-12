import LocalizedController from "./LocalizedController.js";

export default class IndexController extends LocalizedController {

    getModel = () => ({});

    constructor(element, history) {
        super(element, history);
        super.bindLocale(this, "index");
        this.setModel(this.getModel());
        console.log("Index controller initialized. redirecting now");
        this.navigateToPageTag('participant');
    }
}