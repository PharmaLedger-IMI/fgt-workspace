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
                return callback(`Could not create file at ${arg.path}: ${err}`);
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
               return callback(`Could not create dsu with keyssi ${keySSI}: ${err}`);

           const mountFunc = function(bar, key, callback){
               console.log(`DSU created with key ${key}`);
               bar.mount(path, key, (err) => {
                   if (err)
                       return callback(`Could not mount DSU: ${err}`);
                   callback(undefined, bar);
               });
           }

           if (args.commands && args.commands.length > 0){
               const dossierBuilder = new DossierBuilder();
               dossierBuilder.buildDossier(dsu, args.commands, (err, key) => {
                   if (err)
                       return callback(`Could not build Dossier: ${err}`)
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
                    return callback(`Could not write to ${arg.to}: ${err}`);
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
                    return callback(`Could not perform mount of ${seed} at ${arg.seed_path}: ${err}`);
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
                return callback(`Could not list mounts: ${err}`);
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
                return callback(`Could not read file at ${filePath}: ${err}`);
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