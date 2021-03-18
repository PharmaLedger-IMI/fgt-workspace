/**
 * @module pdm-dsu-toolkit.services
 */
'use strict';

const FileService = require("./FileService");

const OPTIONS = {
    anchoring: "default",
    hint: undefined,
    vault: "vault",
    codeFolderName: "code",
    buildFolderName: "bin",
    slots:{
        primary: "wallet-patch",
        secondary: "apps-patch"
    }
}

/**
 * @param {object} options:
 * <pre>
 *     {
 *         anchoring: "${anchoringDomain}
 *         hint: the hint portion og the key
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
    options = Object.assign({}, OPTIONS, options);
    let keyssi = require('opendsu').loadApi('keyssi')

    const DossierBuilder = require("./DossierBuilder/DossierBuilder2").DossierBuilder;
    const resolver = require('opendsu').loadApi('resolver');

    const contentToCommands = function(files, mounts){
        let commands = [];
        files.forEach(f => {
            commands.push(`addfile ${f} ${f}`);
        });
        mounts.forEach(m => {
            commands.push(`mount ${m.identifier} ${m.path}`);
        });
        return commands;
    }

    /**
     * Lists a DSUs content
     * @param {Archive} dsu
     * @param {function(err, files, mounts)}callback
     * @private
     */
    const getDSUContent = function (keySSI, callback) {
        resolver.loadDSU(keySSI, (err, dsu) => {
            dsu.listFiles("/", {ignoreMounts: true}, (err, files) => {
                if (err)
                    return callback(`Could not retrieve DSU content: ${err}`);
                dsu.listMountedDSUs("/", (err, mounts) => {
                    if (err)
                        return callback(`Could not retrieve DSU mounts: ${err}`);
                    callback(undefined, files, mounts, dsu);
                });
            });
        });
    }

    const createArraySSI = function(secrets, callback){
        const key = keyssi.createArraySSI(options.anchoring, secrets, 'v0', options.hint ? JSON.stringify(options.hint) : undefined);
        callback(undefined, key);
    }

    const doClone = function(dsuToClone, destinationDSU, files, mounts, callback){
        const commands = contentToCommands(files, mounts);
        const dossierBuilder = new DossierBuilder(dsuToClone);
        dossierBuilder.buildDossier(destinationDSU, commands, callback);
    }

    this.cloneToConst = function (secretsArray, keyForDSUToClone, callback) {
        getDSUContent(keyForDSUToClone, (err, files, mounts, dsuToClone) => {
            if (err)
                return callback(err);
            console.log(`Loaded Template DSU with key ${keyForDSUToClone}:\nmounts: ${mounts}`);
            createArraySSI(secretsArray, (err, keySSI) => {
                resolver.createDSUForExistingSSI(keySSI, (err, destinationDSU) => {
                    if (err)
                        return callback(err);
                    doClone(dsuToClone, destinationDSU, files, mounts,  (err, keySSI) => {
                        if (err)
                            return callback(err);
                        console.log(`DSU ${keySSI} as a clone of ${keyForDSUToClone} was created`);
                    });
                });
            });
        });
    }
}
module.exports = AppBuilderService;