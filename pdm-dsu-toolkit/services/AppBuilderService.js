/**
 * @module pdm-dsu-toolkit.services
 */
'use strict';

const FileService = require("./FileService");

const SLOTS = {
    PRIMARY: {
        getPath: function (appName) {
            return "wallet-patch";
        }
    },
    SECONDARY: {
        getPath: function (appName) {
            return `apps-patch/${appName}`
        }
    }
}

const OPTIONS = {
    vault: "vault",
    codeFolderName: "code",
    buildFolderName: "bin",
    slots:{
        primary: "wa"
    }
}

/**
 * @param {object} options:
 * <pre>
 *     {
 *         vault: "${vaultDomain}"
 *         codeFolder: "codeFolderName"
 *         buildFolder: "buildFolder"
 *     }
 * </pre>
 * @param {string} options.codeFolderName
 * @param {string} options.walletTemplateFolderName
 * @param {string} options.appFolderName
 * @param {string} options.appsFolderName
 */
function AppBuilderService(options) {
    options = options || {};
    if (!options.codeFolderName)
        throw new Error('Code folder name is required');
    if (!options.walletTemplateFolderName)
        throw new Error('The wallet template folder name is required');
    if (!options.appFolderName)
        throw new Error('The app folder name is required');
    if (!options.vault)
        throw new Error('The vault name is required');
    const CODE_FOLDER = options.codeFolderName;
    const WALLET_TEMPLATE_FOLDER = options.walletTemplateFolderName;
    const APP_FOLDER = options.appFolderName;
    const APPS_FOLDER = options.appsFolderName;
    const SSI_FILE_NAME = options.ssiFileName;
    const VAULT_DOMAIN = options.environmentDomain;

    this.walletTypeSeed = null;
    this.fileService = new FileService();
    let keyssi = require('opendsu').loadApi('keyssi')

    const dossierBuilder = require('opendsu').loadApi('dt').getDossierBuilder();
    const resolver = require('opendsu').loadApi('resolver');

    /**
     * Lists a DSUs content
     * @param {Archive} dsu
     * @param {function(err, content)}callback
     * @private
     */
    const _getDSUContent = function (dsu, callback) {
        dsu.listFiles("/", {recursive: true, ignoreMounts: false}, (err, content) => {
            if (err)
                return callback(`Could not retrieve DSU content: ${err}`);
            callback(undefined, content);
        })
    }

    /**
     * Loads a DSU and list its content
     * @param {KeySSI} keySSI
     * @param {function(err, content, Archive, commands)} callback
     * @private
     */
    const _keySSIToContent = function(keySSI, callback){
        resolver.loadDSU(keySSI, (err, template) => {
            if (err)
                return callback(err);
            console.log(`Loaded template DSU`);
            _getDSUContent(template, (err, templateContent) => {
                if (err)
                    return callback(err);
                console.log(`Template DSU content: ${templateContent}`);
                callback(undefined, templateContent, template);
            });
        });
    }


    /**
     * Reads the keySSI from the seed file the the app folder while in the workspace
     * @param {string} name the application name (the folder name under the workspace)
     * @param {string} domain the anchoring domain
     * @param {function(err, KeySSI)} callback
     */
    const getSSIFromAppName = function (name, domain, callback) {
        const seed = this.fileService.getFile(name, "seed", (err, file) => {
            if (err)
                return callback(err);
            let keySSI = keyssi.parse(file.toString());
            if (keySSI.getDLDomain() !== domain)
                return callback("Invalid Domain");
            callback(undefined, keySSI);
        });
    }

    /**
     * Clones contents of the DSU of the given keySSI to a new WalletDSU (const) generated with the
     * provided keyGenArray
     *
     * cfg:
     * <pre>
     *     {
     *        "seed": "./seed",
     *        "domain": "default",
     *        "bundles": "./../../privatesky/psknode/bundles",
     *        "config": "./bin/build.file"
     *     }
     * </pre>
     * @param {string[]} keyGenArray
     * @param {KeySSI} keySSI
     * @param {string} domain anchoring domain;
     * @param {function(err, KeySSI)}callback
     */
    const installAsWallet = function (keyGenArray, keySSI, domain, callback) {
        _keySSIToContent(keySSI, (err, content, templateDSU, commands) => {
            if (err)
                return callback(err);
            const walletsSSI = keyssi.createArraySSI(domain, keyGenArray, 'v0', undefined);
            const walletBuilder = dossierBuilder.getDSUFactory(true);
            walletBuilder({domain: domain}, );
        });

    }

    const instantiateWallet = function(keySSI, callback){

    }



    const deployToDSU = function () {

    }

    const getTemplateContent = function(keySSI, callback){
        let self = this;
        resolver.loadDSU(keySSI, (err, dsu) => {
            if (err)
                return callback(`Could not load DSU: ${err}`);
            _getDSUContent(dsu, (err, content) => {
                if (err)
                    return callback(err);
            });
        });
    }

    const cloneToConst = function (secretsArray, keyForDSUToClone, callback) {
        let self = this;
        _keySSIToContent(keyForDSUToClone, (err, content, dsu, commands) => {
            if (err)
                return callback(err);
            console.log(content);
            callback();
        });
    }



}

module.exports = AppBuilderService;