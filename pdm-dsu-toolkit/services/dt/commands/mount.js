/**
 * @module Commands
 * @memberOf dt
 */

/**
 */
const Command = require('./Command');
const ReadFileCommand = require('./readFile');
const { _err, _getFS, _getKeySSISpace } = require('./utils');

/**
 * Mounts a DSU onto the provided path
 *
 * @class MountCommand
 */
class MountCommand extends Command{
    constructor(varStore, source) {
        super(varStore, source, true);
        if (!source)
            this._getFS = require('./utils');
    }

    /**
     * Lists all the mounts in the provided pattern, either via fs or source dsu
     * @param {object} arg
     * @param {function(err, string[])} callback
     * @private
     */
    _listMounts(arg, callback){
        let self = this;
        let basePath = arg.seed_path.split("*");
        const listMethod = this.source ? this.source.listMountedDSUs : _getFS().readdir;
        listMethod(basePath[0], (err, args) => err
            ? _err(`Could not list mounts`, err, callback)
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
     * @param {function(err, string|string[]|object)} callback
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
        this._listMounts(arg, callback);
    }

    /**
     * Mounts a DSu onto a path
     * @param {object} arg
     * <pre>
     *     {
     *         seed_path: (...),
     *         mount_point: (..)
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
            console.log("Mounting seed " + seed + " to " + arg.mount_point);
            bar.mount(arg.mount_point, seed, err => err
                ? _err(`Could not perform mount of ${seed} at ${arg.seed_path}`, err, callback)
                : callback(undefined, bar));
        };
        try {
            if (_getKeySSISpace().parse(arg.seed_path))
                return doMount(arg.seed_path, callback);
        } catch (e){
            new ReadFileCommand(this.varStore, this.source).execute(arg.seed_path, (err, seed) => {
                if (err)
                    return _err(`Could not read seed from ${arg.seed_path}`, err, callback);
                seed = seed.toString();
                doMount(seed, callback);
            });
        }
    }
}

module.exports = MountCommand;