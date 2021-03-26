import env from "../../environment.js"
import LocalizedController from './LocalizedController.js'
import LoaderService from "./services/LoaderService.js";

const generateTranslation = function (){
    return {
        en:{
            "/": {
                "anchoring": "traceability",
                "form": {
                    "title": "Please enter your credentials as a Wholesaler",
                    "name": {
                        "label": "Name:",
                        "type": "text",
                        "placeholder": "Please enter your name here...",
                        "value": "PDM the Wholesaler",
                        "public": true,
                        "required": true
                    },
                    "id": {
                        "label": "Registered Id:",
                        "type": "text",
                        "placeholder": "Please enter your id here...",
                        "value": "#ThIsIsAwHoLeSaLeRiD=",
                        "public": true,
                        "required": true
                    },
                    "email": {
                        "label": "Registered Email:",
                        "type": "email",
                        "placeholder": "Please enter your email here...",
                        "value": "wholesaler@pdmfc.com",
                        "public": true,
                        "required": true
                    },
                    "tin": {
                        "label": "Registered TIN (Tax Identification Number):",
                        "type": "number",
                        "placeholder": "Enter your TIN (Tax Identification Number)...",
                        "value": 500000000,
                        "public": true,
                        "required": true
                    },
                    "address": {
                        "label": "Registered Address:",
                        "type": "text",
                        "placeholder": "Enter your address...",
                        "required": true,
                        "value": "This in an Address"
                    },
                    "pass": {
                        "label": "Password:",
                        "type": "password",
                        "placeholder": "Enter your password...",
                        "required": true,
                        "value": "This1sSuchAS3curePassw0rd"
                    },
                    "passrepeat": {
                        "label": "Password:",
                        "type": "password",
                        "placeholder": "Repeat your password...",
                        "required": true,
                        "value": "This1sSuchAS3curePassw0rd"
                    },
                    "buttons": {
                        "login": "Login",
                        "register": "Register"
                    }
                },
                "errors": {
                    "title": "Error",
                    "register": "Unable to register. Are you sure this account doesn't exist?",
                    "login": "Could not Login. Maybe try registering?"
                },
                "success": {
                    "register": "Registration Successful. Please Login",
                    "login": "Login Successful. Please wait"
                }
            }
        }
    }
}


export default class HomeController extends LocalizedController {
    getModel = () => ({
        participant: undefined
    });

    constructor(element, history) {
        super(element, history);
        console.log(`The translation model in the Home controller is: ${WebCardinal.translations.en}`);
        if (!WebCardinal.translations.en){
            console.log("THE TRANSLATION MODEL IS NOT SET! - Hardcoding...");
            WebCardinal.translations = generateTranslation();
        }
        super.bindLocale(this, "");
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
                self.showToast(self.translate('home.success.register'));
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
           self.showToast(self.translate('home.success.login'));
           callback(undefined, wallet);
        });
    }

    _showLoginModal() {
        // this.showIonicModal("a-generic-configurable-modal", false, {page: "registration"});
        this.createWebcModal({
            modelTitle: "",
            modalName: 'genericModal',
            showFooter: false,
            canClose: false,
            showCancelButton: false
        });
    }
}