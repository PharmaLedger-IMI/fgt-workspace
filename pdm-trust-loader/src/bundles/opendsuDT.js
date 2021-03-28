opendsuDTRequire=(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({"../../../pdm-dsu-toolkit/services/dt":[function(require,module,exports){
/**
 * @module dt
 */

/**
 * Provides a Environment Independent and Versatile Dossier Building API.
 *
 * Meant to be integrated into OpenDSU
 */

/**
 * Returns a DossierBuilder Instance
 * @param {Archive} [sourceDSU]
 * @return {DossierBuilder}
 */
const getDossierBuilder = (sourceDSU) => {
    return new (require("./DossierBuilder").DossierBuilder)(sourceDSU)
}

module.exports = {
    getDossierBuilder,
    Operations: require("./DossierBuilder").OPERATIONS,
    AppBuilderService: require('./AppBuilderService')
}

},{"./AppBuilderService":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/services/dt/AppBuilderService.js","./DossierBuilder":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/services/dt/DossierBuilder.js"}],"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/builds/tmp/opendsuDT_intermediar.js":[function(require,module,exports){
(function (global){(function (){
global.opendsuDTLoadModules = function(){ 

	if(typeof $$.__runtimeModules["opendsuDT"] === "undefined"){
		$$.__runtimeModules["opendsuDT"] = require("../../../pdm-dsu-toolkit/services/dt");
	}
};
if (true) {
	opendsuDTLoadModules();
}
global.opendsuDTRequire = require;
if (typeof $$ !== "undefined") {
	$$.requireBundle("opendsuDT");
}

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../../pdm-dsu-toolkit/services/dt":"../../../pdm-dsu-toolkit/services/dt"}],"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/services/dt/AppBuilderService.js":[function(require,module,exports){
/**
 * @module dt
 */

/**
 *
 */
const FileService = require("./FileService");

const DSU_SPECIFIC_FILES = ["dsu-metadata.log", "manifest"]

/**
 * Default Options set for the {@link AppBuilderService}
 */
const OPTIONS = {
    anchoring: "default",
    publicSecretsKey: '-$Identity-',
    environmentKey: "-$Environment-",
    basePath: "",
    walletPath: "",
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

/**
 * Convert the Environment object into the Options object
 */
const envToOptions = function(env, opts){
    let options = Object.assign({}, OPTIONS, opts);
    options.environment = env;
    options.vault = env.vault;
    options.anchoring = env.domain;
    options.basePath = env.basePath;
    options.walletPath = env.basePath.split('/').reduce((sum, s) => sum === '' && s !== '/' ? s : sum, '');
    const opendsu = require('opendsu');
    options.hosts = $$.environmentType === 'browser'
        ? `${opendsu.loadApi('system').getEnvironmentVariable(opendsu.constants.BDNS_ROOT_HOSTS)}`
        : `localhost:8080`;
    return options;
}

/**
 *
 * @param {object} environment typically comes from an environment.js file is the ssapps. Overrides some options
 * @param {object} [opts] options object mimicking {@link OPTIONS}
 */
function AppBuilderService(environment, opts) {
    const options = envToOptions(environment, opts);
    let keyssi = require('opendsu').loadApi('keyssi')

    const dossierBuilder = new (require("./DossierBuilder").DossierBuilder);
    const resolver = require('opendsu').loadApi('resolver');

    const fileService = new FileService(options);

    /**
     * Converts the list of files and mounts in a DSU to createFile and Mount commands for DSU Cloning purposes
     * @param {object} files
     * @param {object} mounts
     * @return {string[]}
     * @private
     */
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
     * @param {KeySSI} keySSI
     * @param {function(err, files, mounts)} callback
     * @private
     */
    const getDSUContent = function (keySSI, callback) {
        resolver.loadDSU(keySSI, (err, dsu) => {
            if (err)
                return OpenDSUSafeCallback(callback)(createOpenDSUErrorWrapper(`Could not load DSU with SSI ${keySSI}`, err));
            dsu.listFiles("/", {ignoreMounts: true}, (err, files) => {
                if (err)
                    return OpenDSUSafeCallback(callback)(createOpenDSUErrorWrapper(`Could not retrieve DSU content`, err));
                dsu.listMountedDSUs("/", (err, mounts) => {
                    if (err)
                        return OpenDSUSafeCallback(callback)(createOpenDSUErrorWrapper(`Could not retrieve DSU mounts`, err));
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
     * @private
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
        parseSecrets(true, arg, (err, keyGenArgs, publicSecrets) => {
            if (err)
                return callback(err);
            getDSUContent(keyForDSUToClone, (err, files, mounts, dsuToClone) => {
                if (err)
                    return callback(err);
                console.log(`Loaded Template DSU with key ${keyForDSUToClone}:\nmounts: ${mounts}`);
                getDSUFactory(isConst)(keyGenArgs, (err, destinationDSU) => {
                    if (err)
                        return OpenDSUSafeCallback(callback)(createOpenDSUErrorWrapper( err));
                    doClone(dsuToClone, destinationDSU, files, mounts,  publicSecrets,(err, keySSI) => {
                        if (err)
                            return OpenDSUSafeCallback(callback)(createOpenDSUErrorWrapper( err));
                        console.log(`DSU ${keySSI} as a clone of ${keyForDSUToClone} was created`);
                        // if (publicSecrets)
                        //     return writeToCfg(destinationDSU, publicSecrets, err => callback(err, keySSI));
                        callback(undefined, keySSI);
                    });
                });
            });
        });
    }

    const _getPatchContent = function(appName, callback){
        fileService.getFolderContentAsJSON(appName, (err, content) => {
           if (err)
               return OpenDSUSafeCallback(callback)(createOpenDSUErrorWrapper(`Could not retrieve patch content for ${appName}`, err));
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
                return OpenDSUSafeCallback(callback)(createOpenDSUErrorWrapper( err));
            let commands = filesToCommands(files);
            if (!commands || commands.length === 0){
                console.log(`Application ${slotPath} does not require patching`);
                return callback(undefined, dsu);
            }

            dossierBuilder.buildDossier(dsu, commands, (err, keySSI) => {
                if (err)
                    return OpenDSUSafeCallback(callback)(createOpenDSUErrorWrapper( err));
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
                   return OpenDSUSafeCallback(callback)(createOpenDSUErrorWrapper(`Could not initialize SSApp instance`, err));
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
                    return OpenDSUSafeCallback(callback)(createOpenDSUErrorWrapper(`Error patching SSApp ${name}`, err));
                initializeInstance(instance, publicSecrets, (err) => {
                    if (err)
                        return OpenDSUSafeCallback(callback)(createOpenDSUErrorWrapper( err));
                    instance.getKeySSIAsString((err, keySSI) => {
                        if (err)
                            return OpenDSUSafeCallback(callback)(createOpenDSUErrorWrapper( err));
                        callback(undefined, keySSI);
                    });
                });
            });
        }

        parseSecrets(isWallet, secrets, (err, keyArgs, publicSecrets) => {
            if (err)
                return OpenDSUSafeCallback(callback)(createOpenDSUErrorWrapper( err));
            getDSUFactory(isWallet, isWallet)(keyArgs, isWallet ? {dsuTypeSSI: seed} : undefined, (err, wallet) => {
                if (err)
                    return callback(`Could not create instance`);

                const instance = isWallet ? wallet.getWritableDSU() : wallet;

                if (isWallet)
                    return patchAndInitialize(instance, publicSecrets, (err, key) => callback(err, key, wallet));

                instance.mount(`${options.codeFolderName}`, seed, (err) => {
                    if (err)
                        return OpenDSUSafeCallback(callback)(createOpenDSUErrorWrapper(`Could not mount Application code in instance`, err));
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
                    return OpenDSUSafeCallback(callback)(createOpenDSUErrorWrapper(`Failed to build app ${appName}`, err));
                mountApp(keySSI);
            });
        }

        getListOfAppsForInstallation((err, apps) => {
            if (err)
                return OpenDSUSafeCallback(callback)(createOpenDSUErrorWrapper( err));
            apps = apps || {};
            let appList = Object.keys(apps).filter(n => n !== '/');
            if(!appList.length)
                return callback(undefined, appList);
            let tempList = [...appList]
            performInstallation(wallet, apps, tempList, (err) => {
                if (err)
                    return OpenDSUSafeCallback(callback)(createOpenDSUErrorWrapper(`Could not complete installations`, err));
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
                return OpenDSUSafeCallback(callback)(createOpenDSUErrorWrapper("Could not retrieve template wallet SSI.", err));
            buildApp(true, secrets, seed, (err, keySSI, wallet) => {
                if (err)
                    return OpenDSUSafeCallback(callback)(createOpenDSUErrorWrapper(`Could not build wallet`, err));
                console.log(`Wallet built with SSI ${keySSI}`);
                installApps(wallet, (err, appList) => {
                    if (err)
                        return OpenDSUSafeCallback(callback)(createOpenDSUErrorWrapper(`Could not Install Applications ${JSON.stringify(appList)}`, err));
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
                    return OpenDSUSafeCallback(callback)(createOpenDSUErrorWrapper(`Could not create wallet with ssi ${{keySSI}}`, err));
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
},{"./DossierBuilder":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/services/dt/DossierBuilder.js","./FileService":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/services/dt/FileService.js","opendsu":false}],"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/services/dt/DossierBuilder.js":[function(require,module,exports){
/**
 * @module dt
 */

/**
 * Enum of Accepted Operations
 */
const OPERATIONS = {
    DELETE: "delete",
    ADD_FOLDER: "addfolder",
    ADD_FILE: "addfile",
    CREATE_FILE: "createfile",
    MOUNT: "mount",
    CREATE_AND_MOUNT: "createandmount"
}

/**
 * Enum of Accepted Key Types
 */
const KEY_TYPE = {
    CONST: "const",
    SEED: "seed"
}

/**
 * Automates the Dossier Building process
 * Call via
 * <pre>
 *     builder.buildDossier(config, commands, callback)
 * </pre>
 * where the config is as follows (this config is generated by the buildDossier script in octopus given the proper commands):
 * <pre>
 *     {
 *          "seed": "./seed",
 *          "domain": "default",
 *     }
 * </pre>
 *
 * For a Simple SSApp (with only mounting of cardinal/themes and creation of code folder) the commands would be like:
 * <pre>
 *     delete /
 *     addfolder code
 *     mount ../cardinal/seed /cardinal
 *     mount ../themes/'*'/seed /themes/'*'
 * </pre>
 * @param {Archive} [sourceDSU] if provided will perform all OPERATIONS from the sourceDSU as source and not the fs
 */
const DossierBuilder = function(sourceDSU){
    let fs;

    const getFS = function(){
        if (!fs)
            fs = require('fs');
        return fs;
    }

    const openDSU = require("opendsu");
    const keyssi = openDSU.loadApi("keyssi");
    const resolver = openDSU.loadApi("resolver");

    /**
     * recursively executes the provided func with the dossier and each of the provided arguments
     * @param {Archive} dossier: The DSU instance
     * @param {function} func: function that accepts the dossier and one param as arguments
     * @param {any} arguments: a list of arguments to be consumed by the func param
     * @param {function} callback: callback function. The first argument must be err
     */
    let execute = function (dossier, func, arguments, callback) {
        let arg = arguments.pop();
        if (! arg)
            return callback();
        let options = typeof arg === 'object' && arg.options ? arg.options : undefined;
        func(dossier, arg, options, (err, result) => {
            if (err)
                return callback(err);

            if (arguments.length !== 0) {
                execute(dossier, func, arguments, callback);
            } else {
                callback(undefined, result);
            }
        });
    };

    let del = function (bar, path, options, callback) {
        if (typeof options === 'function'){
            callback = options;
            options = {}
        }
        options = options || {ignoreMounts: false};
        console.log("Deleting " + path);
        bar.delete(path, options, err => callback(err, bar));
    };

    let addFolder = function (folder_root = "/") {
        return function (bar, arg, options, callback){
            if (sourceDSU){
                console.log("The addFolder Method is not supported when cloning from a DSU");
                callback();
            }

            if (typeof options === 'function'){
                callback = options;
                options = {}
            }
            options = options || {batch: false, encrypt: false};
            console.log("Adding Folder " + folder_root + arg)
            bar.addFolder(arg, folder_root, options, err => callback(err, bar));
        };
    };

    /**
     * Creates a file with
     * @param bar
     * @param {object} arg:
     * <pre>
     *     {
     *         path: (...),
     *         content: (..)
     *     }
     * </pre>
     * @param options
     * @param callback
     */
    let createFile = function(bar, arg, options, callback){
        if (typeof options === 'function'){
            callback = options;
            options = {}
        }
        options = options || {encrypt: true, ignoreMounts: false};
        bar.writeFile(arg.path, arg.content, options, (err) => {
            if (err)
                return OpenDSUSafeCallback(callback)(createOpenDSUErrorWrapper(`Could not create file at ${arg.path}`, err));
            callback(undefined, bar);
        })
    }

    /**
     * Creates a dsu (const or not) and mounts it to the specified path
     * @param bar
     * @param {KEY_TYPE} type
     * @param {string} domain
     * @param {string} path
     * @param {object} args:
     * <pre>
     *     {
     *         forKey: (key gen args)
     *         commands: [
     *             (commands to run on created dsu)
     *         ]
     *     }
     * </pre>
     * @param {function(err, keySSI)} callback
     */
    let createAndMount = function(bar, type, domain, path, args, callback){
        let keyGenFunc, dsuFactory;
        switch(type){
            case KEY_TYPE.CONST:
                keyGenFunc = keyssi.createArraySSI;
                dsuFactory = resolver.createDSUForExistingSSI;
                break;
            case KEY_TYPE.SEED:
                keyGenFunc = keyssi.buildTemplateSeedSSI;
                dsuFactory = resolver.createDSU;
                break;
            default:
                throw new Error("Invalid type");
        }

        let keySSI = keyGenFunc(domain, args.forKey);
        dsuFactory(keySSI, (err, dsu) => {
           if (err)
               return OpenDSUSafeCallback(callback)(createOpenDSUErrorWrapper(`Could not create dsu with keyssi ${keySSI}`, err));

           const mountFunc = function(bar, key, callback){
               console.log(`DSU created with key ${key}`);
               bar.mount(path, key, (err) => {
                   if (err)
                       return OpenDSUSafeCallback(callback)(createOpenDSUErrorWrapper(`Could not mount DSU`, err));
                   callback(undefined, bar);
               });
           }

           if (args.commands && args.commands.length > 0){
               const dossierBuilder = new DossierBuilder();
               dossierBuilder.buildDossier(dsu, args.commands, (err, key) => {
                   if (err)
                       return OpenDSUSafeCallback(callback)(createOpenDSUErrorWrapper(`Could not build Dossier`, err));
                   mountFunc(bar, key, callback);
               })
           } else {
               dsu.getKeySSIAsString((err, key) => {
                   if (err)
                       return callback(err);
                   mountFunc(bar, key, callback);
               });
           }
        });
    }

    /**
     * Copies a file, from disk or another DSU
     * @param bar
     * @param arg
     * @param options
     * @param callback
     * @return {*}
     */
    let addFile = function (bar, arg, options, callback) {
        if (typeof options === 'function'){
            callback = options;
            options = {}
        }
        options = options || {encrypt: true, ignoreMounts: false}
        console.log("Copying file " + arg.from + (sourceDSU ? " from sourceDSU" : "") + " to " + arg.to);

        if (!sourceDSU)
            return bar.addFile(arg.from, arg.to, options, err => callback(err, bar));

        sourceDSU.readFile(arg.from, (err, data) => {
            if (err)
                return callback(err);
            bar.writeFile(arg.to, data, err =>{
                if (err)
                    return OpenDSUSafeCallback(callback)(createOpenDSUErrorWrapper(`Could not write to ${arg.to}`, err));
                callback(undefined, bar);
            });
        });
    };

    let mount = function (bar, arg, options, callback) {
        if (typeof options === 'function'){
            callback = options;
            options = undefined
        }

        const doMount = function(seed, callback){
            console.log("Mounting " + arg.seed_path + " with seed " + seed + " to " + arg.mount_point);
            bar.mount(arg.mount_point, seed, err => {
                if (err)
                    return OpenDSUSafeCallback(callback)(createOpenDSUErrorWrapper(`Could not perform mount of ${seed} at ${arg.seed_path}`, err));
                callback(undefined, bar)
            });
        };

        if (sourceDSU)
            return doMount(arg.seed_path, callback);

        readFile(arg.seed_path, (err, data) => {
            if (err)
                return callback(err);
            let seed = data.toString();
            doMount(seed, callback);
        });
    };

    /**
     * handles the difference between the mount arguments in the 2 cases (with/without sourceDSU)
     * @param arg
     * @param arguments
     * @return {*}
     * @private
     */
    let _transform_mount_arguments = function(arg, arguments){
        return sourceDSU
            ? arguments.map(m => {
                return {
                    "seed_path": m.identifier,
                    "mount_point": m.path
                }
            })
            : arguments.map(n => {
                return {
                    "seed_path": arg.seed_path.replace("*", n),
                    "mount_point": arg.mount_point.replace("*", n)
                };
            });
    }

    /**
     * Calls mount recursively
     * @param bar
     * @param arg
     * @param callback
     */
    let mount_folders = function (bar, arg, callback) {
        let base_path = arg.seed_path.split("*");
        const listFunc = sourceDSU ? sourceDSU.listMountedDSUs : getFS().readdir;
        listFunc(base_path[0], (err, arguments) => {
            if (err)
                return OpenDSUSafeCallback(callback)(createOpenDSUErrorWrapper(`Could not list mounts`, err));
            arguments = _transform_mount_arguments(arg, arguments);
            execute(bar, mount, arguments, callback);
        });
    };

    /**
     * Looks for the '*' pattern
     * @param bar
     * @param cmd
     * @param callback
     */
    let evaluate_mount = function(bar, cmd, callback){
        let arguments = {
            "seed_path": cmd[0],
            "mount_point": cmd[1]
        };

        if (!arguments.seed_path.match(/[\\/]\*[\\/]/))
            mount(bar, arguments, callback);             // single mount
        else
            mount_folders(bar, arguments, callback);     // folder mount
    };

    let createDossier = function (conf, commands, callback) {
        console.log("creating a new dossier...")
        resolver.createDSU(keyssi.createTemplateSeedSSI(conf.domain), (err, bar) => {
            if (err)
                return callback(err);
            updateDossier(bar, conf, commands, callback);
        });
    };

    /**
     * Reads from fs or dsu depending on the existence of a sourceDSU
     * @param {string} filePath
     * @param callback
     */
    let readFile = function (filePath, callback) {
        const readMethod = sourceDSU ? sourceDSU.readFile : getFS().readFile;
        readMethod(filePath, (err, data) => {
            if (err)
                return OpenDSUSafeCallback(callback)(createOpenDSUErrorWrapper(`Could not read file at ${filePath}`, err));
            return callback(undefined, sourceDSU ? data : data.toString());
        });
    };

    /**
     * Writes to a file on the filesystem
     * @param filePath
     * @param data
     * @param callback
     */
    let writeFile = function (filePath, data, callback) {
        if (sourceDSU)
            throw new Error("This method is not meant to be used here");

        getFS().writeFile(filePath, data, (err) => {
            if (err)
                return callback(err);
            callback(undefined, data.toString());
        });
    };

    /**
     * Stores the keySSI to the SEED file when no sourceDSU is provided
     * @param {string} seed_path the path to store in
     * @param {string} keySSI
     * @param {function(err, KeySSI)} callback
     */
    let storeKeySSI = function (seed_path, keySSI, callback) {
        writeFile(seed_path, keySSI, callback);
    };

    /**
     * Runs an operation
     * @param {Archive} bar
     * @param {string} command
     * @param {function(err, keySSI)} callback
     */
    let runCommand = function(bar, command, callback){
        let cmd = command.split(/\s+/);
        switch (cmd.shift().toLowerCase()){
            case OPERATIONS.DELETE:
                return execute(bar, del, cmd, callback);
            case OPERATIONS.ADD_FOLDER:
                return execute(bar, addFolder(), cmd, callback);
            case OPERATIONS.ADD_FILE:
                let arg = {
                    "from": cmd[0],
                    "to": cmd[1]
                }
                return addFile(bar, arg, callback);
            case OPERATIONS.MOUNT:
                return evaluate_mount(bar, cmd, callback);
            case OPERATIONS.CREATE_FILE:
                let cArg = {
                    path: cmd.shift(),
                    content: cmd.join(' ')
                }
                return createFile(bar, cArg, callback);
            case OPERATIONS.CREATE_AND_MOUNT:
                let type = cmd.shift();
                let domain = cmd.shift();
                let path = cmd.shift();
                let args = JSON.parse(cmd.join(' '));
                return createAndMount(bar, type, domain, path, args, callback);
            default:
                return callback(new Error("Invalid operation requested: " + command));
        }
    };

    /**
     * Retrieves the KeysSSi after save (when applicable)
     * @param {Archive} bar
     * @param {object} cfg is no sourceDSU is provided must contain a seed field
     * @param {function(err, KeySSI)} callback
     */
    let saveDSU = function(bar, cfg, callback){
        bar.getKeySSIAsString((err, barKeySSI) => {
            if (err)
                return callback(err);
            if(sourceDSU || cfg.skipFsWrite)
                return callback(undefined, barKeySSI);
            storeKeySSI(cfg.seed, barKeySSI, callback);
        });
    };

    /**
     * Run a sequence of {@link OPERATIONS} on the DSU
     * @param {Archive} bar
     * @param {object} cfg
     * @param {string[]} commands
     * @param {function(err, KeySSI)} callback
     */
    let updateDossier = function(bar, cfg, commands, callback) {
        if (commands.length === 0)
            return saveDSU(bar, cfg, callback);
        let cmd = commands.shift();
        runCommand(bar, cmd, (err, updated_bar) => {
            if (err)
                return callback(err);
            updateDossier(updated_bar, cfg, commands, callback);
        });
    };

    /**
     * Builds s DSU according to it's building instructions
     * @param {object|Archive} configOrDSU: can be a config file form octopus or the destination DSU when cloning.
     *
     *
     * Example of config file:
     * <pre>
     *     {
     *         seed: path to SEED file in fs
     *     }
     * </pre>
     * @param {string[]|object[]} [commands]
     * @param {function(err, KeySSI)} callback
     */
    this.buildDossier = function(configOrDSU, commands, callback){
        if (typeof commands === 'function'){
            callback = commands;
            commands = [];
        }

        let builder = function(keySSI){
            try {
                keySSI = keyssi.parse(keySSI);
            } catch (err) {
                console.log("Invalid keySSI");
                return createDossier(configOrDSU, commands, callback);
            }

            if (keySSI.getDLDomain() !== configOrDSU.domain) {
                console.log("Domain change detected.");
                return createDossier(configOrDSU, commands, callback);
            }

            resolver.loadDSU(keySSI, (err, bar) => {
                if (err){
                    console.log("DSU not available. Creating a new DSU for", keySSI);
                    return resolver.createDSU(keySII, {useSSIAsIdentifier: true}, (err, bar)=>{
                        if(err)
                            return callback(err);
                        updateDossier(bar, configOrDSU, commands, callback);
                    });
                }
                console.log("Dossier updating...");
                updateDossier(bar, configOrDSU, commands, callback);
            });
        }

        if (configOrDSU.constructor && configOrDSU.constructor.name === 'Archive')
            return updateDossier(configOrDSU, {skipFsWrite: true}, commands, callback);

        readFile(configOrDSU.seed, (err, content) => {
            if (err || content.length === 0)
                return createDossier(configOrDSU, commands, callback);
            builder(content.toString());
        });
    };
};

module.exports = {
    DossierBuilder,
    OPERATIONS
};

},{"fs":false,"opendsu":false}],"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/services/dt/FileService.js":[function(require,module,exports){
/**
 * @module dt
 */

/**
 * Provides an environment independent file service to the {@link AppBuilderService}
 */
function FileService(options) {
    const isBrowser = $$.environmentType === 'browser';

    function constructUrlBase(prefix){
        let url, protocol, host;
        prefix = prefix || "";
        let appName = '';
        if (isBrowser){
            let location = window.location;
            const paths = location.pathname.split("/");
            while (paths.length > 0) {
                if (paths[0] === "") {
                    paths.shift();
                } else {
                    break;
                }
            }
            appName = paths[0];
            protocol = location.protocol;
            host = location.host;
            url = `${protocol}//${host}/${prefix}${appName}`;
            return url;
        } else {
            return `http://${options.hosts}/${prefix ? prefix : ''}${options.walletPath}${prefix ? '' : '/'}`;
        }
    }

    this.getWalletSeed = function(callback){
        this.getAppSeed(options.slots.primary, callback);
    }

    this.getAppSeed = function(appName, callback){
        this.getFile(appName, options.seedFileName, (err, data) => {
            if (err)
                return OpenDSUSafeCallback(callback)(createOpenDSUErrorWrapper(err));
           Utf8ArrayToStr(data, callback);
        });
    }

    function doGet(url, options, callback){
        if (typeof options === "function") {
            callback = options;
            options = {};
        }

        const http = require("opendsu").loadApi("http");
        http.fetch(url, {
            method: 'GET'
        }).then((response) => {
            return response.arrayBuffer().then((data) => {
                if (!response.ok){
                    console.log("array buffer not ok");
                    return callback("array data failed")
                }
                callback(undefined, data);
            }).catch(e => {
                return callback(e);
            });
        }).catch(err => {
            return callback(err);
        });
    }

    /**
     * Returns the content of a file as a uintArray
     * @param {string} appName
     * @param {string} fileName
     * @param {function(err, UintArray)} callback
     */
    this.getFile = function(appName, fileName, callback){
        let url = constructUrlBase() + `${appName}/${fileName}`;
        doGet(url, callback);
    };


    /**
     *
     * @param innerFolder
     * @param callback
     */
    this.getFolderContentAsJSON = function(innerFolder, callback){
        if (typeof innerFolder === 'function'){
            callback = innerFolder;
            innerFolder = undefined;
        }
        let url = constructUrlBase("directory-summary/") + (innerFolder ? `/${innerFolder}` : '') ;
        doGet(url, (err, data) => {
            if (err)
                return OpenDSUSafeCallback(callback)(createOpenDSUErrorWrapper(err));
            Utf8ArrayToStr(data, callback);
        });
    }

    /**
     * Util method to convert Utf8Arrays to Strings in the browser
     * (simpler methods fail for big content jsons)
     * @param {Utf8Array} array
     * @param {function(err, string)} callback
     */
    function Utf8ArrayToStr(array, callback) {
        if (!isBrowser)
            return callback(undefined, array.toString());
        var bb = new Blob([array]);
        var f = new FileReader();
        f.onload = function(e) {
            callback(undefined, e.target.result);
        };
        f.readAsText(bb);
    }
}

module.exports = FileService;
},{"opendsu":false}]},{},["/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/builds/tmp/opendsuDT_intermediar.js"])
                    ;(function(global) {
                        global.bundlePaths = {"toolkit":"build/bundles/toolkit.js","opendsuDT":"build/bundles/opendsuDT.js"};
                    })(typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
                