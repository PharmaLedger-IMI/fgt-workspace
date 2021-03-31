/**
 * @module controllers
 */

/**
 *
 */
import env from "../../environment.js"
import LocalizedController from './LocalizedController.js'
import LoaderService from "../services/LoaderService.js";

/**
 * @class HomeController
 */
export default class HomeController extends LocalizedController {
    getModel = () => ({
        participant: undefined
    });

    constructor(element, history) {
        super(element, history);
        super.bindLocale(this);
        this.setModel(this.getModel());

        let self = this;
        this.on('perform-registration', async (event) => {
            event.preventDefault();
            event.stopImmediatePropagation();
            await self.register(event.detail, (err) => {
                if (err)
                    self.showErrorToast(err);
            });
        }, true)

        this.loaderService = new LoaderService(env);
        this.on('perform-login', (event) => {
            event.preventDefault();
            event.stopImmediatePropagation();
            self.login(event.detail, (err) => {
                if (err)
                    self.showErrorToast(err);
                self.hideModal();
            });
        }, true)


        console.log("Home controller initialized");
        this._showLoginModal();
    }

    /**
     * Instantiates a new Spinner
     * @param {string} message
     * @param {number} duration
     * @return {ion-loading} a spinner
     * @private
     */
    _getLoader(message, duration){
        duration = duration || 0;
        const loading = document.createElement('ion-loading');
        loading.cssClass = 'ion-loading';
        loading.message = message;
        loading.translucent = true;
        loading.duration = duration;
        document.body.appendChild(loading);
        return loading;
    }

    /**
     * Creates the ID DSU and mounts it to the id_path
     * @param {object} credentials
     * @param {function} callback
     */
    async register(credentials, callback){
        let self = this;
        let loader = self._getLoader("Registering...");
        await loader.present();

        self.loaderService.create(credentials, async (err, keySSI) => {
            if (err)
                self.showErrorToast(err);
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
        let loader = this._getLoader("Logging in...");
        this.loaderService.load(credentials, loader, async (err, wallet) => {
           if (err){
               self.showErrorToast(err);
               return callback(err);
           }
           self.showToast(self.translate('success.login'));
           callback(undefined, wallet);
        });
    }

    _showLoginModal() {
        // this.showIonicModal("a-generic-configurable-modal", false, {page: "registration"});
        this.createWebcModal({
            template: "genericModal",
            controller: "FormController",
            disableBackdropClosing: true,
            disableFooter: true,
            disableHeader: true,
            disableExpanding: true,
            disableClosing: true,
            disableCancelButton: true,
            expanded: false,
            centered: true
        });
    }
}