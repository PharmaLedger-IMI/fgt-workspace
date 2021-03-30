/**
 * @module Commands
 * @memberOf dt
 */

/**
 */
const Command = require('./Command');
const ReadFileCommand = require('./readFile');

/**
 * Creates a file with the provided content on the destination DSU
 * (similar to a touch command with added content)
 *
 * @class MountCommand
 */
class MountCommand extends Command{
    constructor(source) {
        super(source);
        if (!source)
            this._getFS = require('./utils');
    }

    /**
     * Lists all the mounts in the provided pattern, either via fs or source dsu
     * @param {string} arg
     * @param {function(err, string[])} callback
     * @private
     */
    _listMounts(arg, callback){
        let self = this;
        let basePath = arg.split("*");
        const listMethod = this.source ? this.source.listMountedDSUs : this._getFS().readdir;
        listMethod(basePath, (err, args) => err
            ? this._err(`Could not list mounts`, err, callback)
            : callback(undefined, self._transform_mount_arguments(arg, args)));
    }

    /**
     * handles the difference between the mount arguments in the 2 cases (with/without sourceDSU)
     * @param arg
     * @param args
     * @return {*}
     * @private
     */
    _transform_mount_arguments(arg, args){
        return this.source
            ? args.map(m => {
                return {
                    "seed_path": m.identifier,
                    "mount_point": m.path
                }
            })
            : args.map(n => {
                return {
                    "seed_path": arg.seed_path.replace("*", n),
                    "mount_point": arg.mount_point.replace("*", n)
                };
            });
    }

    /**
     * @param {string[]|string} command the command split into words
     * @param {string[]} next the following Commands
     * @param {function(err, string|string[]|object)} [callback] for async versatility
     * @protected
     */
    _parseCommand(command, next, callback){
        let arg = {
            "seed_path": command[0],
            "mount_point": command[1]
        };

        if (!arg.seed_path.match(/[\\/]\*[\\/]/))
            return callback(undefined, arg);   // single mount
        // multiple mount
        this._listMounts(arg.seed_path, callback);
    }

    /**
     * Copies a file, from disk or another DSU
     * @param {object} arg
     * <pre>
     *     {
     *         from: (...),
     *         to: (..)
     *     }
     * </pre>
     * @param {Archive} [bar]
     * @param {object} options
     * @param {function(err, Archive)} callback
     * @protected
     */
    _runCommand(arg, bar, options, callback) {
        let self = this;
        if (typeof options === 'function'){
            callback = options;
            options = undefined;
        }

        const doMount = function(seed, callback){
            console.log("Mounting " + arg.seed_path + " with seed " + seed + " to " + arg.mount_point);
            bar.mount(arg.mount_point, seed, err => err
                ? self._err(`Could not perform mount of ${seed} at ${arg.seed_path}`, err, callback)
                : callback(undefined, bar));
        };

        if (this.source)
            return doMount(arg.seed_path, callback);

        new ReadFileCommand(this.source).execute(arg.seed_path, (err, seed) => {
            if (err)
                return self._err(`Could not read seed from ${arg.seed_path}`, err, callback);
            seed = seed.toString();
            doMount(seed, callback);
        });
    }

    /**
     * @return the operation name
     */
    getName(){
        return "mount";
    }
}

module.exports = MountCommand;