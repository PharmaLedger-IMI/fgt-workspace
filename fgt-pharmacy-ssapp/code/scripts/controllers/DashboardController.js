const {WebcController} = WebCardinal.controllers;

export default class DashboardController extends WebcController {

    getModel = (_) => ({
        title: "This is a Dashboard",
        none: "There are no pending orders"
    });

    constructor(element, history) {
        super(element, history);
        this.setModel(this.getModel())
        //const LocaleService = require('wizard').Services.LocaleService;
        //LocaleService.bindToLocale(this, LocaleService.supported.en_US, "dashboard");


    }
}