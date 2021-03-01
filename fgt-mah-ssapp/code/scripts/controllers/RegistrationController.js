import ModalController from '../../../cardinal/controllers/base-controllers/ModalController.js';

export default class RegistrationController extends ContainerController {
    constructor(element) {
        super(element);
        this.model = this.setModel(this.getModel());

        this.on('openModal', _ => this.model.modal.opened = true);
        this.on('closeModal', _ => this.model.modal.opened = false);
    }
}