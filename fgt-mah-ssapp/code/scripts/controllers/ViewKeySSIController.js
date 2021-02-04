import ModalController from '../../cardinal/controllers/base-controllers/ModalController.js';

export default class ViewKeySSIController extends ModalController {
    constructor(element, history) {
        super(element, history);

        this.closeButtonOnClick();
    }

    closeButtonOnClick() {
        this.on('close-button-on-click', (event) => {
            this._finishProcess(event);
        });
    }

    _finishProcess(event) {
        event.stopImmediatePropagation();
        this.responseCallback();
    };
}
