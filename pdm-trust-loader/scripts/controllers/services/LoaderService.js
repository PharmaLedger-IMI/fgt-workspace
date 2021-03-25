"use strict";

import getNavigatorUtils from "./NavigatorUtils.js";
import WalletRunner from "./WalletRunner.js";

function LoaderService(env) {
    const AppBuilderService = require('toolkit').Services.dt.AppBuilderService
    const navigatorUtils = getNavigatorUtils(env);

    /**
     * Loads an existing wallet
     * @param {object|string|undefined} keyGenArgs {@link AppBuilderService#buildWallet}
     * @param {ion-loading} spinner
     * @param {Function} callback
     */
    this.load = function (keyGenArgs, spinner, callback) {
        if (typeof spinner === 'function'){
            callback = spinner;
            spinner = undefined;
        }

        console.log("Loading the wallet");
        navigatorUtils.unregisterAllServiceWorkers(() => {
            let resolver = require("opendsu").loadApi("resolver");
            let keyssi = require("opendsu").loadApi("keyssi");

            let walletSSI =  keyssi.createTemplateWalletSSI(env.domain, keyGenArgs, env.vault);

            resolver.loadDSU(walletSSI, (err, wallet) =>{
                if(err)
                    return callback(`Failed to load wallet ${err}`);

                wallet = wallet.getWritableDSU();
                wallet.getKeySSIAsString((err, keySSI) => {
                    if (err)
                        return callback("Operation failed. Try again");

                    console.log(`Loading wallet ${keySSI}`);

                    new WalletRunner({
                        seed: keySSI,
                        spinner: spinner,
                        env: env
                    }).run();
                    callback(undefined, wallet);
                });
            });
        });
    };

    /**
     * Create a new wallet
     * @param {object|string|undefined} keyGenArgs {@link AppBuilderService#buildWallet}
     * @param {Function} callback
     */
    this.create = function (keyGenArgs, callback) {
        console.log("Creating the wallet");
        //NavigatorUtils.unregisterAllServiceWorkers(() => {
            const appBuilder = new AppBuilderService(env);

            appBuilder.buildWallet(keyGenArgs,(err, wallet) => {
                if (err) {
                    return OpenDSUSafeCallback(callback)(createOpenDSUErrorWrapper("Failed to create Wallet", err));
                }
                callback(undefined, wallet);
            });
       // });
    };

    /**
     * Rebuild an existing wallet
     * @param {array|undefined} key
     * @param {callback} callback
     */
    this.rebuild = function (domain, key, callback) {
        this.load(domain, key, (err, wallet) => {
            if (err) {
                return OpenDSUSafeCallback(callback)(createOpenDSUErrorWrapper("Failed to load wallet in rebuild", err));
            }

            const walletBuilder = new WalletBuilderService(wallet, {
                codeFolderName: "code",
                walletTemplateFolderName: "wallet-patch",
                appFolderName: CONSTANTS.APP_FOLDER,
                appsFolderName: "apps-patch",
                dossierLoader: function (keySSI, callback) {
                    resolver.loadDSU(keySSI, callback);
                },
            });

            walletBuilder.rebuild(domain,(err) => {
                if (err) {
                    return OpenDSUSafeCallback(callback)(createOpenDSUErrorWrapper("Failed to rebuild wallet", err));
                }
                callback(undefined, wallet);
            });
        });
    };
}

export default LoaderService;
