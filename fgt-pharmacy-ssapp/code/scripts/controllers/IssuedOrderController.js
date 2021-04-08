import LocalizedController from "./LocalizedController.js";
export default class IssuedOrderController extends LocalizedController {

    getModel = () => ({}); // initial empty model

    constructor(element, history) {
        super(element, history);
        let self = this;
        super.bindLocale(self, `issuedOrder`, true);

        self.setModel(self.getModel());
        console.log("IssuedOrderController initialized");
        Object.entries(self.getModel().buttons).forEach(b => {
            self.onTagClick(`try${b[0]}`, self._handleTry(`${b[0]}`).bind(self));
        });

        self.on('input-has-changed', self._handleErrorElement.bind(self));
        self._createModalForm(this.getModel());
    }

    _createModalForm(model){
    }


}