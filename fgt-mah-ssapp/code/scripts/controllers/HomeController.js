import ContainerController from "../../cardinal/controllers/base-controllers/ContainerController.js";
console.log(ContainerController);
//const Actor = require('../model').Actor;

export default class HomeController extends ContainerController {
    constructor(element, history) {
        super(element, history);
        this.model = this.setModel({});
        // this.__updateUserInfo(this.model);
        console.log("Index controller initialized");
        // let state = this.History.getState();
        //
        // this.securityContext = require('opnedsu').loadApi('sc');
    }
}