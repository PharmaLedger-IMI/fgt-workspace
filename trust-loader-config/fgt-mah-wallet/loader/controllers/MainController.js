import "./../loader-config.js";
import {Spinner, prepareView} from "./services/UIService.js";
import WalletService from "./services/WalletService.js";
import FileService from "./services/FileService.js";
import WalletRunner from "./services/WalletRunner.js";

function MainController() {

    let USER_DETAILS_FILE = "user-details.json";
    const DEVELOPMENT_EMAIL = "dev@autologin.dev";
    const DEVELOPMENT_USERNAME = "autologin";

    const walletService = new WalletService();
    const fileService = new FileService();
    let spinner;


    const self = this;

    /**
     * Return path to file relative to the `loader` folder
     *
     * @param {string} file
     * @return {string}
     */
    function getUrl(file) {
        let pathSegments = window.location.pathname.split("/");
        let loaderPath = pathSegments.pop();
        if (!loaderPath) {
            loaderPath = pathSegments.pop();
        }

        return `${loaderPath}/${file}`;
    }


    function hash(arr) {
        const crypto = require("opendsu").loadApi("crypto");
        let hsh = crypto.sha256(encodeURI(arr.join("/")));
        return hsh;
    }

       function generateRandom(charactersSet, length) {
        let result = '';
        const charactersLength = charactersSet.length;
        for (let i = 0; i < length; i++) {
            result += charactersSet.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    function getSecretLocalToken(development, mobile) {
        if (mobile) {
            return "PharmacyUserSecurePassword1!";
        }
        let storageKey = "secretToken";

        if(development) {
            return generateRandom(characters, 32); //new key each time
        }
        let secret = localStorage.getItem(storageKey);
        if (!secret) {
            secret = generateRandom(characters, 32);
            localStorage.setItem(storageKey, secret);
        }
        return secret;
    }

    function getWalletSecretArrayKey(){
        let arr = [LOADER_GLOBALS.credentials.username, LOADER_GLOBALS.credentials.email, LOADER_GLOBALS.credentials.company, LOADER_GLOBALS.credentials.password];
        return arr;
    }

    /**
     * Run the loader using credentials provided from external source
     * These credentials should be stored in the localStorage before
     */
    function runExternalAutologin() {
        spinner.attachToView();
        LOADER_GLOBALS.loadCredentials();
        const secretArrayKey = getWalletSecretArrayKey();
        const isArrayEmpty = secretArrayKey.filter(el => el && el.trim().length !== 0).length === 0;

        if(isArrayEmpty) {
            return console.warn("Array of secrets is not loaded yet...", secretArrayKey);
        }

        walletService.create(LOADER_GLOBALS.environment.domain, secretArrayKey, (err, wallet) => {
            if (err) {
                throw createOpenDSUErrorWrapper(`Failed to create wallet in domain ${LOADER_GLOBALS.environment.domain}`, err);
            }
            console.log("A new wallet got initialized...", wallet.getCreationSSI(true));
            return self.openWallet();
        });
    }

    /**
     * Run the loader in development mode
     *
     * Create a default wallet with a default password if none exists
     * and load it
     */
    function runInDevelopment() {
        runInAutologin(true);
    }

    /**
     * Run the loader in autologing mode
     *
     * Create a default wallet with a default password if none exists
     * and load it
     */
    function runInAutologin(development, mobile) {
        spinner.attachToView();
        if(!LOADER_GLOBALS.credentials.isValid) {
            let credentials = {};
            if (!development) {
                credentials.email = "wallet@invisible";
                credentials.password = getSecretLocalToken(development, mobile);
                credentials.username = "private";
                credentials.company = "OpenDSU Development INC.";
            } else {
                credentials.email = DEVELOPMENT_EMAIL;
                credentials.password = getSecretLocalToken(development, mobile);
                credentials.username = DEVELOPMENT_USERNAME;
                credentials.company = "OpenDSU Development INC.";
            }
            LOADER_GLOBALS.credentials = credentials;
            LOADER_GLOBALS.credentials.isValid = true;

            if(!development){
                LOADER_GLOBALS.saveCredentials();
            }
        }

        walletService.create(LOADER_GLOBALS.environment.domain, getWalletSecretArrayKey(), (err, wallet) => {
            if (err) {
                throw createOpenDSUErrorWrapper(`Failed to create wallet in domain ${LOADER_GLOBALS.environment.domain}`, err);
            }
            console.log("A new wallet got initialized...", wallet.getCreationSSI(true));
            return self.openWallet();
        });
    }

    function runInMobileAutologin(){
        return runInAutologin(false, true);
    }

    this.init = function () {
        spinner = new Spinner(document.getElementsByTagName("body")[0]);

        if (LOADER_GLOBALS.environment.mode === "external-autologin") {
            return runExternalAutologin();
        }

        if (LOADER_GLOBALS.environment.mode === "dev-autologin") {
            return runInDevelopment();
        }

        if (LOADER_GLOBALS.environment.mode === "mobile-autologin") {
            return runInMobileAutologin();
        }

        if (LOADER_GLOBALS.environment.mode === "autologin") {
            return runInAutologin();
        }

        if (! (LOADER_GLOBALS.environment.mode === "secure" || LOADER_GLOBALS.environment.mode === "dev-secure")) {
            return OpenDSUSafeCallback(callback)(createOpenDSUErrorWrapper("Unknown mode in environment.js"));
        }

        if(LOADER_GLOBALS.environment.mode === "dev-secure" && !LOADER_GLOBALS.credentials.username){
            LOADER_GLOBALS.credentials.username = "devMAHuser"
            LOADER_GLOBALS.credentials.email = "dev@MAHuser.dev";
            LOADER_GLOBALS.credentials.company = "Marketing Authorization Holder Company Inc";
            LOADER_GLOBALS.credentials.password = "MAHUserSecurePassword1!";
        }

        let windowUrl = new URL(window.location.href);
        if (windowUrl.searchParams.get("login") !== null) {
            return this.displayContainer(LOADER_GLOBALS.PASSWORD_CONTAINER_ID);
        }
        this.displayContainer(LOADER_GLOBALS.NEW_OR_RESTORE_CONTAINER_ID)
    };

    this.displayContainer = function (containerId) {
        document.getElementById(containerId).style.display = "block";
    };


    this.showErrorOnField = function (fieldId) {
        document.getElementById(fieldId).style.border = "2px solid red";
    }

    this.removeErrorFromField = function (fieldId) {
        document.getElementById(fieldId).style.border = "1px solid #ced4da";
    }

    this.passwordsAreValid = function () {
        let password = LOADER_GLOBALS.credentials.password = document.getElementById("password").value;
        let passwordIsValid = password.length > 0;
        //let passwordIsValid = password.length >= LOADER_GLOBALS.PASSWORD_MIN_LENGTH
        /*if (typeof LOADER_GLOBALS.PASSWORD_REGEX !== "undefined") {
            passwordIsValid = passwordIsValid && LOADER_GLOBALS.PASSWORD_REGEX.test(password);
        }*/
        if(passwordIsValid){
            this.removeErrorFromField('password')
        } else {
            this.showErrorOnField('password')
        }
        return passwordIsValid;
    };


     this.credentialsAreValid = function () {
        let username = LOADER_GLOBALS.credentials.username = document.getElementById("username").value;
        let email =  LOADER_GLOBALS.credentials.email = document.getElementById("email").value;
        let company =  LOADER_GLOBALS.credentials.company = document.getElementById("company").value;

        let usernameIsValid = username.length >= LOADER_GLOBALS.USERNAME_MIN_LENGTH && LOADER_GLOBALS.USERNAME_REGEX.test(username);
        let emailIsValid = email.length > 4 && LOADER_GLOBALS.EMAIL_REGEX.test(email);
        username.length > 0 && !usernameIsValid ? this.showErrorOnField('username') : this.removeErrorFromField('username');
        email.length > 0 && !emailIsValid ? this.showErrorOnField('email') : this.removeErrorFromField('email');

        return usernameIsValid && emailIsValid;
    };

    this.validateCredentials = function () {
        let btn = document.getElementById("open-wallet-btn");
        let credentialsAreValid = this.credentialsAreValid();
        let passwordsAreValid = this.passwordsAreValid();
        if (credentialsAreValid && passwordsAreValid) {
            btn.removeAttribute("disabled");
        } else {
            btn.setAttribute("disabled", "disabled");
        }
    };

    this.writeUserDetailsToFile = function (wallet, callback) {
        let objectToWrite = {
            username: LOADER_GLOBALS.credentials.username,
            email: LOADER_GLOBALS.credentials.email,
            company: LOADER_GLOBALS.credentials.company
        }
        wallet.writeFile(USER_DETAILS_FILE, JSON.stringify(objectToWrite), callback);
    }

    this.getUserDetailsFromFile = function (wallet, callback) {
        wallet.readFile(USER_DETAILS_FILE, (err, data) => {
            if (err) {
                return callback(err);
            }
            const dataSerialization = data.toString();
            callback(undefined, JSON.parse(dataSerialization))
        });
    }

    this.openWallet = function (event) {
        if (event) {
            event.preventDefault();
        }
        spinner.attachToView();
        spinner.setStatusText("Opening wallet...");

        walletService.load(LOADER_GLOBALS.environment.domain, getWalletSecretArrayKey(), (err, wallet) => {
            if (err) {
                spinner.removeFromView();
                console.error("Failed to load the wallet in domain:", LOADER_GLOBALS.environment.domain, getWalletSecretArrayKey(), err);
                return (document.getElementById("register-details-error").innerText = "Invalid credentials");
            }

            let writableWallet = wallet;

            writableWallet.getKeySSIAsString((err, keySSI) => {
                if (err) {
                    console.error(err);
                    return console.error("Operation failed. Try again");
                }

                this.writeUserDetailsToFile(writableWallet, (err, data) => {
                    if (err) {
                        return console.log(err);
                    }

                    this.getUserDetailsFromFile(writableWallet, (err, data) => {
                        if (err) {
                            return console.log(err);
                        }
                        console.log("Logged user", data);
                    })

                });

                console.log(`Loading wallet ${keySSI}`);

                new WalletRunner({
                    seed: keySSI,
                    spinner
                }).run();
            });
        });
    };
}

const controller = new MainController();

document.addEventListener("DOMContentLoaded", function () {
    let LABELS = LOADER_GLOBALS.LABELS_DICTIONARY;
    const page_labels = [
        {title: LABELS.APP_NAME},
        {"#loader-title": LABELS.APP_NAME},
        {"#loader-caption": LABELS.APP_DESCRIPTION},
        {"#new-wallet": LABELS.NEW_WALLET},
        {"#access-wallet": LABELS.ACCESS_WALLET},
        {"#wallet-authorization": LABELS.WALLET_AUTHORIZATION},
        {"#enter-credentials": LABELS.ENTER_CREDENTIALS},
        {"#username": LABELS.ENTER_USERNAME, attribute: "placeholder"},
        {"#company": LABELS.ENTER_COMPANY, attribute: "placeholder"},
        {"#email": LABELS.ENTER_EMAIL, attribute: "placeholder"},
        {"#password": LABELS.ENTER_PASSWORD, attribute: "placeholder"},
        {"#open-wallet-btn": LABELS.OPEN_WALLET},
    ];
    prepareView(page_labels);
    controller.init();

    if(LOADER_GLOBALS.credentials.username){
        document.getElementById("username").value = LOADER_GLOBALS.credentials.username;
    }

    if(LOADER_GLOBALS.credentials.email){
        document.getElementById("email").value = LOADER_GLOBALS.credentials.email;
    }

    if(LOADER_GLOBALS.credentials.company){
        document.getElementById("company").value = LOADER_GLOBALS.credentials.company;
    }

    if(LOADER_GLOBALS.credentials.password){
        document.getElementById("password").value = LOADER_GLOBALS.credentials.password;
    }
    //document.getElementById("company").value = LOADER_GLOBALS.credentials.company;

    controller.validateCredentials();
});

window.controller = controller;
