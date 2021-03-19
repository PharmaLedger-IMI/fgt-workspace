import LocalizedController from "./LocalizedController.js";

customElements.define("a-generic-configurable-modal", class extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
<webc-container controller="FormController" disable-container>
    <webc-template template="genericModal" data-model="@" disable-container></webc-template>
</webc-container>`;
    }
});


const generateTranslation = function (){
    return {
        en:{
            "/": {
                "title": "Finished Goods Traceability - Wholesalers",
                "welcome": "Welcome back",
                "errors": {
                    "register": "Unable to register",
                    "try-again": "Try Again?"
                },
                "none": "You are not identified as a Marketing Authorization holder. Please register",
                "registration": {
                    "title": "Please register as a Wholesaler",
                    "name": {
                        "label": "Registered Wholesaler's name:",
                        "placeholder": "Please enter your name here...",
                        "value": "PDM the Wholesaler",
                        "required": true
                    },
                    "id": {
                        "label": "Registered Id:",
                        "placeholder": "Please enter your id here...",
                        "value": "#ThIsIsAwHoLeSaLeRiD=",
                        "required": true
                    },
                    "email": {
                        "label": "Registered Email:",
                        "placeholder": "Please enter your email here...",
                        "value": "wholesaler@pdmfc.com",
                        "required": true
                    },
                    "tin": {
                        "label": "Registered TIN (Tax Identification Number):",
                        "placeholder": "Enter your TIN (Tax Identification Number)...",
                        "value": 500000000,
                        "required": true
                    },
                    "address": {
                        "label": "Registered Address:",
                        "placeholder": "Enter your address...",
                        "required": true,
                        "value": "This in an Address"
                    },
                    "buttons": ["Register"]
                },
                "login": {
                    "title": "Please enter your credentials",
                    "name": {
                        "label": "Registered Wholesaler's name:",
                        "placeholder": "Please enter your name here...",
                        "value": "PDM the Wholesaler",
                        "required": true
                    },
                    "id": {
                        "label": "Registered Id:",
                        "placeholder": "Please enter your id here...",
                        "value": "#ThIsIsAwHoLeSaLeRiD=",
                        "required": true
                    },
                    "email": {
                        "label": "Registered Email:",
                        "placeholder": "Please enter your email here...",
                        "value": "wholesaler@pdmfc.com",
                        "required": true
                    },
                    "tin": {
                        "label": "Registered TIN (Tax Identification Number):",
                        "placeholder": "Enter your TIN (Tax Identification Number)...",
                        "value": 500000000,
                        "required": true
                    },
                    "address": {
                        "label": "Registered Address:",
                        "placeholder": "Enter your address...",
                        "required": true,
                        "value": "This in an Address"
                    },
                    "buttons": {
                        "login": "Login",
                        "register": "Register"
                    }
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
        this.on('perform-registration', (event) => {
            event.preventDefault();
            event.stopImmediatePropagation();
            self.register(event.detail, (err) => {
                if (err)
                    self.showErrorModal();
                self.hideModal();
                self._testParticipant();
            });
        }, true)

        this.on('perform-login', (event) => {
            event.preventDefault();
            event.stopImmediatePropagation();
            // self.login(event.detail, (err) => {
            //     if (err)
            //         self.showErrorModal();
            //     self.hideModal();
            //     self._testParticipant();
            // });
        }, true)


        console.log("Home controller initialized");
        this._showLoginModal();
    }

    /**
     * Creates the ID DSU and mounts it to the id_path
     * @param {object} credentials
     * @param {function} callback
     */
    register(credentials, callback){
        let self = this;
        self.participantManager.create(credentials, (err, keySSI) => {
            if (err)
                return callback(err);
            callback();
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

    _showRegistrationModal() {
        this.createWebcModal({
            modelTitle: "",
            modalName: 'registrationModal',
            showFooter: false,
            canClose: false,
            showCancelButton: false
        });
    }

    _testParticipant(){
        let self = this;
        this.participantManager.getParticipant((err, participant) => {
            if (err || !participant) {
                self._showRegistrationModal.call(this);
            } else {
                self.model.participant = participant;
                console.log(`Welcome ${self.model.participant.name}`);
            }
        });
    }
}