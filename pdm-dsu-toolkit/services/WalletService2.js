/**
 * @module pdm-dsu-toolkit.services
 */
'use strict';

/**
 * @param {object} options
 * @param {string} options.codeFolderName
 * @param {string} options.walletTemplateFolderName
 * @param {string} options.appFolderName
 * @param {string} options.appsFolderName
 */
function WalletBuilderService(options){
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

    const dossierBuilder = require('opendsu').loadApi('dt').getDossierBuilder();
    const resolver = require('opendsu').loadApi('resolver');

    const _getDSUContent = function(dsu, callback){
        dsu.listFiles("/", {recursive: true, ignoreMounts: false}, (err, content) => {
            if (err)
                return callback(`Could not retrieve DSU content: ${err}`);
            callback(undefined, content);
        });
    }

    /**
     * Reads the keySSI from the seed file the the app folder while in the workspace
     * @param name
     * @param callback
     */
    const getSSIFromAppName = function(name, callback){
        require('fs')
    }

    const clone = function(keySSI, callback){
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


}