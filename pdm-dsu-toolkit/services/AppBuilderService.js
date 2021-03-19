/**
 * @module pdm-dsu-toolkit.services
 */
'use strict';

const FileService = require("./FileService");

const DSU_SPECIFIC_FILES = ["dsu-metadata.log", "manifest"]

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

    const DossierBuilder = require("./DossierBuilder/DossierBuilder").DossierBuilder;
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
     * @param {function(err, files, mounts)} callback
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
                    callback(undefined, files.filter(f => {
                        return DSU_SPECIFIC_FILES.indexOf(f) === -1;
                    }), mounts, dsu);
                });
            });
        });
    }

    /**
     * Creates an Arrays SSI off a secret list
     *
     * Adds options.hint to hit if available
     * @param {string[]} secrets
     * @param {function(err, ArraySSI)} callback
     */
    const createArraySSI = function(secrets, callback){
        const key = keyssi.createArraySSI(options.anchoring, secrets, 'v0', options.hint ? JSON.stringify(options.hint) : undefined);
        callback(undefined, key);
    }

    /**
     * Creates an Arrays SSI off a secret list
     *
     * Adds options.hint to hit if available
     * @param {string} specificString
     * @param {function(err, TemplateSeedSSI)} callback
     */
    const createSSI = function(specificString, callback){
        const key = keyssi.buildTemplateSeedSSI(options.anchoring, specificString, undefined, 'v0', options.hint ? JSON.stringify(options.hint) : undefined);
        callback(undefined, key);
    }

    /**
     * Converts The contents of the dsuToClone to Commands, recognizable by OpenDSU's DossierBuilder,
     * and using those commands copies all contents into the destinationDSU
     * @param {Archive} dsuToClone
     * @param {Archive} destinationDSU
     * @param {string[]} files
     * @param {object[]} mounts
     * @param {object} [cfg] optional. if passed will be write to /cfg in DSU
     * @param {function(err, KeySSI)} callback
     */
    const doClone = function(dsuToClone, destinationDSU, files, mounts, cfg, callback){
        if (typeof cfg === 'function'){
            callback = cfg;
            cfg = undefined;
        }
        const commands = contentToCommands(files, mounts);
        if (cfg)
            commands.push("createfile cfg " + JSON.stringify(cfg));
        const dossierBuilder = new DossierBuilder(dsuToClone);
        dossierBuilder.buildDossier(destinationDSU, commands, callback);
    }

    /**
     * Creates a DSU of an ArraySSI
     * @param {string[]} secrets
     * @param {function(err, Archive)} callback
     */
    const createConstDSU = function(secrets, callback){
        createArraySSI(secrets, (err, keySSI) => {
            resolver.createDSUForExistingSSI(keySSI, (err, dsu) => {
                if (err)
                    return callback(`Could not create const DSU ${err}`);
                callback(undefined, dsu);
            });
        });
    }

    /**
     * Creates a DSU of an ArraySSI
     * @param {string} specific String for Seed SSI
     * @param {function(err, Archive)} callback
     */
    const createDSU = function(specific, callback){
        createSSI(specific, (err, keySSI) => {
            resolver.createDSUForExistingSSI(keySSI, (err, dsu) => {
                if (err)
                    return callback(`Could not create const DSU ${err}`);
                callback(undefined, dsu);
            });
        });
    }

    const getDSUFactory = function(isConst){
        return isConst ? createConstDSU : createDSU;
    }

    /**
     * Creates a new DSU (Const or not) and clones the content another DSU into it
     * @param {object|string} arg can be a secrets object or a string depending on if it's a const DSU or not. A secrets object is like:
     * <pre>
     *     {
     *         secretName: {
     *             secret: "...",
     *             public: (defaults to false. If true will be made available to the created DSU for use of initialization Scripts)
     *         },
     *         (...)
     *     }
     * </pre>
     * @param {KeySSI} keyForDSUToClone
     * @param {boolean} [isConst] decides if the Created DSU is Const or not. defaults to true
     * @param {function(err, KeySSI)} callback
     */
    this.clone = function (arg, keyForDSUToClone, isConst, callback) {
        if (typeof isConst === 'function'){
            callback = isConst;
            isConst = true;
        }

        getDSUContent(keyForDSUToClone, (err, files, mounts, dsuToClone) => {
            if (err)
                return callback(err);
            console.log(`Loaded Template DSU with key ${keyForDSUToClone}:\nmounts: ${mounts}`);

            let specificArg = arg;
            let publicSecrets = undefined;
            if (isConst){
                specificArg = [];
                publicSecrets = {};
                Object.entries(arg).forEach(e => {
                    if (e[1].public)
                        publicSecrets[e[0]] = e[1].secret;
                    specificArg.push(e[1].secret);
                });
            }

            getDSUFactory(isConst)(specificArg, (err, destinationDSU) => {
                if (err)
                    return callback(err);
                doClone(dsuToClone, destinationDSU, files, mounts,  publicSecrets,(err, keySSI) => {
                    if (err)
                        return callback(err);
                    console.log(`DSU ${keySSI} as a clone of ${keyForDSUToClone} was created`);
                    // if (publicSecrets)
                    //     return writeToCfg(destinationDSU, publicSecrets, err => callback(err, keySSI));
                    callback(undefined, keySSI);
                });
            });
        });
    }
}
module.exports = AppBuilderService;