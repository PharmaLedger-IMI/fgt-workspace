/**
 * @module Controllers
 */

import {LocalizedController, EVENT_ACTION, BUTTON_ROLES} from "../../assets/pdm-web-components/index.esm.js";

/**
 * Basic controller with just enough functionality to register and login
 * @class HomeController
 * @namespace Controllers
 */
export default class HomeController extends LocalizedController {
    initializeModel = () => ({
        participant: undefined
    });

    constructor(element, history) {
        super(element, history);
        super.bindLocale(this);
        this.model = this.initializeModel();

        let self = this;

        this.on(EVENT_ACTION,async (evt) => {
            evt.preventDefault();
            evt.stopImmediatePropagation();

            const {action, credentials} = evt.detail;

            let method = action === 'login' ? self.login : self.register;

            await method(credentials, (err, result) => {
                if (err)
                    return console.log(`${action} action failed`);
                console.log(`${action} action successful. output: ${result}`)
            });
        })

        console.log("Home controller initialized");
    }

    /**
     * Creates the ID DSU and mounts it to the id_path
     * @param {object} credentials
     * @param {function} callback
     */
    async register(credentials, callback){
        let self = this;
        let loader = self._getLoader(self.translate('loading.register'));
        await loader.present();

        self.loaderService.create(credentials, async (err, keySSI) => {
            if (err)
                self.showErrorToast(self.translate('errors.register'));
            else
                self.showToast(self.translate('success.register'));
            await loader.dismiss();
            callback(undefined, keySSI);
        })
    }

    /**
     * Loads the SSApp
     * @param {object} credentials
     * @param {function} callback
     */
    async login(credentials, callback){
        let self = this;
        let loader = this._getLoader(self.translate('loading.login'));
        await loader.present();

        this.loaderService.load(credentials, loader, async (err, wallet) => {
           if (err){
               self.showErrorToast(self.translate('errors.loading'));
               return callback(err);
           }
           self.showToast(self.translate(self.translate('success.login'));
           await loader.dismiss();
           callback(undefined, wallet);
        });
    }
}