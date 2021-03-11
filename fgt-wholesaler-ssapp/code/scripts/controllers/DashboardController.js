const {WebcController} = WebCardinal.controllers;

export default class DashboardController extends WebcController {
    constructor(element, history) {
        super(element, history);
        const LocaleService = require('wizard').Services.LocaleService;
        LocaleService.bindToLocale(this, LocaleService.supported.en_US, "dashboard");
    }
}