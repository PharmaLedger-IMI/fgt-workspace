import ContainerController from "../../cardinal/controllers/base-controllers/ContainerController.js";

export default class TodoListController extends ContainerController {
    constructor(element, history) {
        super(element, history);
        this.model = this.setModel({});

        let state = this.History.getState();
    }
}