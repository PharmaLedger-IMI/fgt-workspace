import env from "../../environment.js";
import {LocalizedController, EVENT_ACTION} from "../../assets/pdm-web-components/index.esm.js";
import LoaderService from "../services/LoaderService.js";

/**
 * Basic controller with just enough functionality to register and login
 * @class HomeController
 * @namespace Controllers
 * @module Trust-Loader
 */
export default class HomeController extends LocalizedController {
    initializeModel = () => ({
        formJSON: '{}'
    });

    constructor(...args) {
        super(undefined, ...args);
        super.bindLocale(this, '');
        this.model = this.initializeModel();

        this.model.formJSON = JSON.stringify(this.model.form)

        this.loaderService = new LoaderService(env);
        let self = this;

        this.on(EVENT_ACTION,async (evt) => {
            evt.preventDefault();
            evt.stopImmediatePropagation();

            const {action, form} = evt.detail;
            const method = action === 'login' ? self.login: self.register;

            const credentials = Object.keys(form).reduce((accum, name) => {
                const isPublic = self.model.form.fields.find(f => f.name === name).public;
                accum[name] = {secret: form[name], public: isPublic}
                return accum;
            }, {});

            await method.call(self, credentials, async (err, result) => {
                if (err)
                    return console.log(`${action} action failed`);
                console.log(`${action} action successful. output: ${result}`)

                if (action === 'login')
                    await self._getLoader(self.translate("success.loading"), {cssClass: 'long-width-loader'}).present();
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
           self.showToast(self.translate('success.login'));
           await loader.dismiss();
           callback(undefined, wallet);
        });
    }
}