import ModalController from '../../../cardinal/controllers/base-controllers/ModalController.js';

export default class ModelController extends ModalController {
    getModel() {
        return {
            modal: {opened: false}
        }
    }

    constructor(element) {
        super(element);
        this.model = this.setModel(this.getModel());

        this.on('openModal', _ => this.model.modal.opened = true);
        this.on('closeModal', _ => this.model.modal.opened = false);
    }
}