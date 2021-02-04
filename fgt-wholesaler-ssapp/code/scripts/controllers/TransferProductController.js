import ModalController from '../../cardinal/controllers/base-controllers/ModalController.js';

export default class TransferProductController extends ModalController {
    constructor(element, history) {
        super(element, history);

        this.acceptButtonOnClick();
        this.denyButtonOnClick();
    }

    denyButtonOnClick() {
        this.on('deny-button-on-click', (event) => {
            this._finishProcess(event, undefined)
        });
    }

    acceptButtonOnClick() {
        this.on('accept-button-on-click', (event) => {
            this._finishProcess(event, this.model.mah)
        });
    }

    _finishProcess(event, response) {
        event.stopImmediatePropagation();
        this.responseCallback(undefined, response);
    };
}
