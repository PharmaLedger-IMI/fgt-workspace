/**
 * @module pdm-dsu-toolkit.services
 */
'use strict';

const FileService = require("./FileService");

const DSU_SPECIFIC_FILES = ["dsu-metadata.log", "manifest"]

const OPTIONS = {
    anchoring: "default",
    publicSecretsKey: '-$Identity-',
    environmentKey: "-$Environment-",
    basePath: "",
    hosts: "",
    hint: undefined,
    vault: "vault",
    seedFileName: "seed",
    appsFolderName: "apps",
    appFolderName: "app",
    codeFolderName: "code",
    initFile: "init.file",
    environment: {},
    slots:{
        primary: "wallet-patch",
        secondary: "apps-patch"
    }
}

const envToOptions = function(env, opts){
    let options = Object.assign({}, OPTIONS, opts);
    options.environment = env;
    options.vault = env.vault;
    options.anchoring = env.domain;
    options.basePath = env.basePath;
    const opendsu = require('opendsu');
    options.hosts = opendsu.loadApi('system').getEnvironmentVariable(opendsu.constants.BDNS_ROOT_HOSTS);
    return options;
}

/**
 * @param {object} environment typically comes from an environment.js file is the ssapps. Overrides some options
 * @param {object} [opts] options object mimicking {@link OPTIONS}
 */
function AppBuilderService(environment, opts) {
    const options = envToOptions(environment, opts);
    let keyssi = require('opendsu').loadApi('keyssi')

    const dossierBuilder = new (require("./DossierBuilder").DossierBuilder);
    const resolver = require('opendsu').loadApi('resolver');

    const fileService = new FileService(options);

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
     * Creates a Wallet SSI off a secret list
     *
     * Adds options.hint to hit if available
     * @param {string[]} secrets
     * @param {function(err, ArraySSI)} callback
     */
    const createWalletSSI = function(secrets, callback){
        const key = keyssi.createTemplateWalletSSI(options.anchoring, secrets, 'v0', options.hint ? JSON.stringify(options.hint) : undefined);
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
        const key = keyssi.createTemplateSeedSSI(options.anchoring, specificString, undefined, 'v0', options.hint ? JSON.stringify(options.hint) : undefined);
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
     * @param {object} opts DSU Creation Options
     * @param {function(err, Archive)} callback
     */
    const createWalletDSU = function(secrets, opts, callback){
        createWalletSSI(secrets, (err, keySSI) => {
            resolver.createDSUForExistingSSI(keySSI, opts, (err, dsu) => {
                if (err)
                    return callback(`Could not create const DSU ${err}`);
                callback(undefined, dsu);
            });
        });
    }

    /**
     * Creates a DSU of an ArraySSI
     * @param {string} specific String for Seed SSI
     * @param {object} opts DSU Creation Options
     * @param {function(err, Archive)} callback
     */
    const createDSU = function(specific, opts, callback){
        createSSI(specific, (err, keySSI) => {
            resolver.createDSU(keySSI, opts, (err, dsu) => {
                if (err)
                    return callback(`Could not create const DSU ${err}`);
                callback(undefined, dsu);
            });
        });
    }

    /**
     * Creates a DSU of an ArraySSI
     * @param {string[]} secrets
     * @param {object} opts DSU Creation Options
     * @param {function(err, Archive)} callback
     */
    const createConstDSU = function(secrets,opts , callback){
        createArraySSI(secrets, (err, keySSI) => {
            resolver.createDSUForExistingSSI(keySSI, opts, (err, dsu) => {
                if (err)
                    return callback(`Could not create const DSU ${err}`);
                callback(undefined, dsu);
            });
        });
    }

    const getDSUFactory = function(isConst, isWallet){
        return isConst ? (isWallet ? createWalletDSU : createConstDSU) : createDSU;
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

    const _getPatchContent = function(appName, callback){
        fileService.getFolderContentAsJSON(appName, (err, content) => {
           if (err)
               return callback(err);
           try {
               content = JSON.parse(content);
           } catch (e) {
               return callback(`Could not parse content`);
           }
            content['/'][options.seedFileName] = undefined;
            delete content['/'][options.seedFileName];

           callback(undefined, content);
        });
    }

    const filesToCommands = (content) => {
        let commands = [];
        for (let directory in content){
            let directoryFiles = content[directory];
            for (let fileName in directoryFiles)
                commands.push(`createfile ${directory}/${fileName} ${directoryFiles[fileName]}`);

        }
        return commands;
    }

    /**
     * Copies the patch files from the path folder onto the DSU
     * @param {Archive} dsu
     * @param {string} slotPath should be '{@link OPTIONS.slots}[/appName]' when appName is required
     * @param {function(err, Archive, KeySSI)} callback
     */
    const patch = function(dsu, slotPath, callback) {
        // Copy any files found in the RESPECTIVE PATCH FOLDER on the local file system
        // into the app's folder
        _getPatchContent(slotPath, (err, files) => {
            if (err)
                return callback(err);
            let commands = filesToCommands(files);
            if (!commands || commands.length === 0){
                console.log(`Application ${slotPath} does not require patching`);
                return callback(undefined, dsu);
            }

            dossierBuilder.buildDossier(dsu, commands, (err, keySSI) => {
                if (err)
                    return callback(err);
                console.log(`Application ${slotPath} successfully patched`);
                callback(undefined, dsu, keySSI);
            });
        });
    }

    /**
     * Reads from {@link OPTIONS.initFile} and executes the commands founds there via {@link DossierBuilder#buildDossier}
     * @param {Archive} instance
     * @param {object} publicSecrets what elements of the registration elements should be passed onto the SSApp
     * @param {function(err, Archive)} callback
     */
    const initializeInstance = function(instance, publicSecrets, callback){
        instance.readFile(`${options.codeFolderName}/${options.initFile}`, (err, data) => {
            if (err) {
                console.log(`No init file found. Initialization complete`);
                return callback(undefined, instance);
            }

            let commands = data.toString().replace(options.environmentKey, JSON.stringify(options.environment));
            commands = (publicSecrets
                    ? commands.replace(options.publicSecretsKey, JSON.stringify(publicSecrets))
                    : commands)
                .split(/\r?\n/);
            dossierBuilder.buildDossier(instance, commands, (err, keySSI) => {
                if (err)
                   return callback(`Could not initialize SSApp instance: ${err}`);
                console.log(`Instance successfully initialized: ${keySSI}`);
                callback(undefined, instance);
            });
        });
    }

    /**
     * Parser the secrets object according to if its a wallet or not
     * @param {boolean} isWallet
     * @param {object|string} secrets can be a secrets object or a string depending on if it's a wallet or not. A secrets object is like:
     * <pre>
     *     {
     *         secretName: {
     *             secret: "...",
     *             public: (defaults to false. If true will be made available to the created DSU for use of initialization Scripts)
     *         },
     *         (...)
     *     }
     * </pre>
     * @param {function(err, string|string[], publicSecrets)} callback
     */
    const parseSecrets = function(isWallet, secrets, callback){
        let specificArg = secrets;
        let publicSecrets = undefined;
        if (isWallet && typeof secrets === 'object'){
            specificArg = [];
            publicSecrets = {};
            Object.entries(secrets).forEach(e => {
                if (e[1].public)
                    publicSecrets[e[0]] = e[1].secret;
                specificArg.push(e[1].secret);
            });
        }
        callback(undefined, specificArg, publicSecrets);
    }

    this.parseSecrets = parseSecrets;

    /**
     * Builds an SSApp
     * @param {boolean} isWallet
     * @param {object|string} secrets according to {@link parseSecrets}
     * @param {string} seed
     * @param {string} [name]
     * @param {function(err, KeySSI, Archive)} callback
     */
    const buildApp = function(isWallet, secrets, seed, name, callback){
        if (typeof name === 'function'){
            if (!isWallet)
                return callback(`No SSApp name provided`);
            callback = name;
            name = undefined;
        }

        const patchAndInitialize = function(instance, publicSecrets, callback){
            const patchPath = isWallet ? `${options.slots.primary}` : `${options.slots.secondary}/${name}`;
            patch(instance, patchPath, (err) => {
                if (err)
                    return callback(`Error patching SSApp ${name}: ${err}`);
                initializeInstance(instance, publicSecrets, (err) => {
                    if (err)
                        return callback(err);
                    instance.getKeySSIAsString((err, keySSI) => {
                        if (err)
                            return callback(err);
                        callback(undefined, keySSI);
                    });
                });
            });
        }

        parseSecrets(isWallet, secrets, (err, keyArgs, publicSecrets) => {
            if (err)
                return callback(err);
            getDSUFactory(isWallet, isWallet)(keyArgs, isWallet ? {dsuTypeSSI: seed} : undefined, (err, wallet) => {
                if (err)
                    return callback(`Could not create instance`);

                const instance = isWallet ? wallet.getWritableDSU() : wallet;

                if (isWallet)
                    return patchAndInitialize(instance, publicSecrets, (err, key) => callback(err, key, wallet));

                instance.mount(`${options.codeFolderName}`, seed, (err) => {
                    if (err)
                        return callback(`Could not mount Application code in instance: ${err}`);
                    patchAndInitialize(instance, publicSecrets, (err, key) => callback(err, key, wallet));
                });
            });
        });
    }

    /**
     * Retrieves the list of Applications to be installed
     * @param {function(err, object)} callback
     */
    const getListOfAppsForInstallation = (callback) => {
        fileService.getFolderContentAsJSON(options.slots.secondary, function (err, data) {
            if (err){
                console.log(`No Apps found`)
                return callback(undefined, {});
            }

            let apps;

            try {
                apps = JSON.parse(data);
            } catch (e) {
                return callback(`Could not parse App list`);
            }

            callback(undefined, apps);
        });
    };

    /**
     * Installs all aps in the apps folder in the wallet
     * @param {Archive} wallet
     * @param {function(err, object)} callback returns the apps details
     */
    const installApps = function(wallet, callback){
        const performInstallation = function(wallet, apps, appList, callback){
            if (!appList.length)
                return callback();
            let appName = appList.pop();
            const appInfo = apps[appName];

            if (appName[0] === '/')
                appName = appName.replace('/', '');

            const mountApp = (newAppSeed) => {
                wallet.mount(`/${options.appsFolderName}/${appName}`, newAppSeed, (err) => {
                    if (err)
                        return callback("Failed to mount in folder" + `/apps/${appName}: ${err}`);

                    performInstallation(wallet, apps, appList, callback);
                });
            };

            // If new instance is not demanded just mount (leftover code from privatesky.. when is it not a new instance?)
            if (appInfo.newInstance === false)
                return mountApp(appInfo.seed);

            buildApp(false, undefined, appInfo.seed, appName, (err, keySSI) => {
                if (err)
                    return callback(`Failed to build app ${appName}: ${err}`);
                mountApp(keySSI);
            });
        }

        getListOfAppsForInstallation((err, apps) => {
            if (err)
                return callback(err);
            apps = apps || {};
            let appList = Object.keys(apps).filter(n => n !== '/');
            if(!appList.length)
                return callback(undefined, appList);
            let tempList = [...appList]
            performInstallation(wallet, apps, tempList, (err) => {
                if (err)
                    return callback(`Could not complete installations: ${err}`);
                callback(undefined, appList);
            });
        });
    }

    /**
     * Builds a new SSApp from the provided secrets
     * @param {KeySSI} seed the SSApp's keySSI
     * @param {string} name the SSApp's name
     * @param {function(err, KeySSI, Archive)} callback
     */
    this.buildSSApp = function(seed, name, callback){
        return buildApp(false, seed, name, callback);
    }

    /**
     * Builds a new Wallet from the provided secrets
     * @param {object|string} secrets according to {@link parseSecrets}
     * @param {function(err, KeySSI, Archive)} callback
     */
    this.buildWallet = function(secrets, callback){
        fileService.getWalletSeed((err, seed) => {
            if (err)
                return callback(`Could not retrieve template wallet SSI: ${err}`);
            buildApp(true, secrets, seed, (err, keySSI, wallet) => {
                if (err)
                    return callback(`Could not build wallet: ${err}`);
                console.log(`Wallet built with SSI ${keySSI}`);
                installApps(wallet, (err, appList) => {
                    if (err)
                        return callback(err);
                    if (appList.length)
                        console.log(`Applications installed successfully`);
                    callback(undefined, keySSI, wallet);
                })
            });
        });
    }

    this.loadWallet = function(secrets, callback){
        parseSecrets(true, secrets, (err, keyGenArgs, publicSecrets) => {
            if (err)
                return callback(err);
            createWalletSSI(keyGenArgs, (err, keySSI) => {
                if (err)
                    return callback(err);
                console.log(`Loading wallet with ssi ${keySSI.getIdentifier()}`);
                resolver.loadDSU(keySSI, (err, wallet) => {
                    if (err)
                        return callback(`Could not load wallet DSU ${err}`);
                    wallet = wallet.getWritableDSU();
                    console.log(`wallet Loaded`);
                    wallet.getKeySSIAsString(callback);
                });
            });
        });
    }
}
module.exports = AppBuilderService;