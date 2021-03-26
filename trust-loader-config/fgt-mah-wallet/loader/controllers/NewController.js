import "./../loader-config.js";
import {Spinner, prepareView} from "./services/UIService.js";
import WalletService from "./services/WalletService.js";
import NavigatorUtils from "./services/NavigatorUtils.js";


function NewController() {

    let blockchainDomain;

    let wizard;
    let spinner;
    const walletService = new WalletService();

    if(LOADER_GLOBALS.environment.mode === "dev-secure"){
        if(!LOADER_GLOBALS.credentials.isValid){
            LOADER_GLOBALS.credentials.isValid = true;
            LOADER_GLOBALS.credentials.username = "devMAHuser"
            LOADER_GLOBALS.credentials.email = "dev@MAHuser.dev";
            LOADER_GLOBALS.credentials.company = "Marketing Authorization Holder Company Inc";
            LOADER_GLOBALS.credentials.password = "MAHUserSecurePassword1!";
            LOADER_GLOBALS.saveCredentials();
            console.log("Initializing credentials for development mode");
        }
    }


    this.hasInstallationUrl = function () {
        let windowUrl = new URL(window.location.href);
        return windowUrl.searchParams.get("appName") !== null;
    };

    this.init = function () {
        NavigatorUtils.hasRegisteredServiceWorkers((error, hasServiceWorker) => {
            if (hasServiceWorker) {
                NavigatorUtils.unregisterAllServiceWorkers(() => {
                    window.location.reload();
                });
            } else {
                spinner = new Spinner(document.getElementsByTagName("body")[0]);
                wizard = new Stepper(document.getElementById("psk-wizard"));
            }
        });
    };

    this.showErrorOnField = function (fieldId, fieldHelpId) {
        document.getElementById(fieldId).style.border = "2px solid red";
        document.getElementById(fieldHelpId).setAttribute('style', 'color:red !important; font-weight: bold;');
    }

    this.removeErrorFromField = function (fieldId, fieldHelpId) {
        document.getElementById(fieldId).style.border = "1px solid #ced4da";
        document.getElementById(fieldHelpId).setAttribute('style', '#6c757d !important');
    }

    this.passwordsAreValid = function () {
        let password = LOADER_GLOBALS.credentials.password = document.getElementById("password").value;
        let passwordConfirm = document.getElementById("confirm-password").value;

        let passwordIsValid = password.length >= LOADER_GLOBALS.PASSWORD_MIN_LENGTH
        let confirmPasswordIsValid = passwordConfirm.length >= LOADER_GLOBALS.PASSWORD_MIN_LENGTH

        if (typeof LOADER_GLOBALS.PASSWORD_REGEX !== "undefined") {
            passwordIsValid = passwordIsValid && LOADER_GLOBALS.PASSWORD_REGEX.test(password);
            confirmPasswordIsValid = confirmPasswordIsValid && LOADER_GLOBALS.PASSWORD_REGEX.test(passwordConfirm);
        }

        password.length > 0 && !passwordIsValid ? this.showErrorOnField('password', 'set-up-password-help') :
            this.removeErrorFromField('password', 'set-up-password-help');
        passwordConfirm.length > 0 && !confirmPasswordIsValid ? this.showErrorOnField('confirm-password', 'set-up-confirm-password-help')
            : this.removeErrorFromField('confirm-password', 'set-up-confirm-password-help');

        return passwordIsValid && confirmPasswordIsValid && password === passwordConfirm;
    };

    this.credentialsAreValid = function () {
        let username = LOADER_GLOBALS.credentials.username = document.getElementById("username").value;
        let email = LOADER_GLOBALS.credentials.email = document.getElementById("email").value;
        let company = LOADER_GLOBALS.credentials.company = document.getElementById("company").value;

        let usernameIsValid = username.length >= LOADER_GLOBALS.USERNAME_MIN_LENGTH && LOADER_GLOBALS.USERNAME_REGEX.test(username);
        let emailIsValid = email.length > 4 && LOADER_GLOBALS.EMAIL_REGEX.test(email);

        username.length > 0 && !usernameIsValid ? this.showErrorOnField('username', 'set-up-username-help')
            : this.removeErrorFromField('username', 'set-up-username-help');
        email.length > 0 && !emailIsValid ? this.showErrorOnField('email', 'set-up-email-help')
            : this.removeErrorFromField('email', 'set-up-email-help');

        return usernameIsValid && emailIsValid;
    };

    this.validateCredentials = function () {
        let btn = document.getElementById("register-btn");
        let credentialsAreValid = this.credentialsAreValid();
        let passwordsAreValid = this.passwordsAreValid();
        if (credentialsAreValid && passwordsAreValid) {
            btn.removeAttribute("disabled");
            return true;
        } else {
            btn.setAttribute("disabled", "disabled");
        }
        return false;
    };

    //TODO Refactore and restructure the whole bs...
    function getWalletSecretArrayKey(){
        let arr = [LOADER_GLOBALS.credentials.username, LOADER_GLOBALS.credentials.email, LOADER_GLOBALS.credentials.company, LOADER_GLOBALS.credentials.password];
        return arr;
    }

    function createWallet() {
        spinner.attachToView();
        try {
            console.log("Creating wallet...");
            LOADER_GLOBALS.saveCredentials();

            walletService.create(LOADER_GLOBALS.environment.domain, getWalletSecretArrayKey(), (err, wallet) => {
                if (err) {
                    document.getElementById("register-details-error").innerText = "An error occurred. Please try again.";
                    return console.error(err);
                }

                wallet.getKeySSIAsString((err, keySSI) => {
                    console.log(`Wallet created. Seed: ${keySSI}`);
                    //document.getElementById("seed").value = keySSI;
                    spinner.removeFromView();
                    wizard.next();
                });
            });
        } catch (e) {
            document.getElementById("register-details-error").innerText = "Seed is not valid.";
        }
    }

    this.previous = function (event) {
        event.preventDefault();
        //document.getElementById("seed").value = "";
        document.getElementById("restore-seed-btn").setAttribute("disabled", "disabled");
        wizard.previous();
    };

    this.submitPassword = function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (this.credentialsAreValid() && this.passwordsAreValid()) {
            createWallet();
        }
    };
    this.goToLandingPage = function () {
        window.location.replace("./");
    };
}

let controller = new NewController();

document.addEventListener("DOMContentLoaded", function () {
    let LABELS = LOADER_GLOBALS.LABELS_DICTIONARY;
    const page_labels = [
        {title: LABELS.APP_NAME},
        {"#step-register-details": LABELS.REGISTER_DETAILS},
        {"#step-complete": LABELS.COMPLETE},
        {"#set-up-username": LABELS.SET_UP_USERNAME},
        {"#set-up-username-help": LABELS.SET_UP_USERNAME_HELP},
        {"#username": LABELS.ENTER_USERNAME, attribute: "placeholder",},
        {"#set-up-email": LABELS.SET_UP_EMAIL},
        {"#set-up-email-help": LABELS.SET_UP_EMAIL_HELP},
        {"#email": LABELS.ENTER_EMAIL, attribute: "placeholder",},
        {"#set-up-company": LABELS.SET_UP_COMPANY},
        {"#set-up-company-help": LABELS.SET_UP_COMPANY_HELP},
        {"#company": LABELS.ENTER_COMPANY, attribute: "placeholder",},
        {"#set-up-password": LABELS.SET_UP_PASSWORD},
        {"#set-up-password-help": LABELS.SET_UP_PASSWORD_HELP},
        {"#password": LABELS.ENTER_PASSWORD, attribute: "placeholder",},
        {"#set-up-confirm-password": LABELS.SET_UP_CONFIRM_PASSWORD},
        {"#set-up-confirm-password-help": LABELS.SET_UP_CONFIRM_PASSWORD_HELP},
        {"#confirm-password": LABELS.ENTER_CONFIRM_PASSWORD, attribute: "placeholder",},
        {"#back-btn": LABELS.BACK_BUTTON_MESSAGE},
        {"#register-btn": LABELS.REGISTER_BUTTON_MESSAGE},
        {"#register-successfully": LABELS.REGISTER_SUCCESSFULLY},
        {"#seed_print": LABELS.SEED_PRINT},
        {"#open-wallet-btn": LABELS.OPEN_WALLET},
    ];
    if (controller.hasInstallationUrl()) {
        page_labels.push({"#more-information": LOADER_GLOBALS.NEW_WALLET_MORE_INFORMATION});
    } else {
        document.querySelector("#more-information").remove();
    }
    prepareView(page_labels);
    controller.init();


    document.getElementById("username").value = LOADER_GLOBALS.credentials.username;
    document.getElementById("email").value = LOADER_GLOBALS.credentials.email;
    document.getElementById("company").value = LOADER_GLOBALS.credentials.company;
    document.getElementById("password").value = LOADER_GLOBALS.credentials.password;
    document.getElementById("confirm-password").value = LOADER_GLOBALS.credentials.password;
    controller.validateCredentials();


});
window.controller = controller;
