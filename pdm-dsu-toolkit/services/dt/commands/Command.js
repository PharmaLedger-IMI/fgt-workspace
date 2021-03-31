/**
 * @module Commands
 * @memberOf dt
 */

/**
 * recursively executes the provided command with the dossier and each of the provided args
 * @param {Archive} dossier The DSU instance
 * @param {Command} command function that accepts the dossier and one param as args
 * @param {[any]} args a list of args to be consumed by the command param
 * @param {string[]} next the remaining commands
 * @param {Archive} [source] the source DSU when applicable
 * @param {function} callback callback function. The first argument must be err
 */
const executeIteratively = function (dossier, command, args, next, source, callback) {
    let arg = args.pop();
    if (!arg)
        return callback();
    let options = typeof arg === 'object' && arg.options ? arg.options : undefined;
    new command(source).execute(dossier, arg, next,  options, (err, result) => {
        if (err)
            return callback(err);

        if (arguments.length !== 0) {
            executeIteratively(dossier, command, args, next, source, callback);
        } else {
            callback(undefined, result);
        }
    });
};

/**
 * **Every Command must be registered under the index.js file in the commands folder**
 * @param {Archive|fs} [source]
 * @param {boolean} [canRunIteratively] defines if the command can expect multiple arguments and run multiple times. defaults to false
 * @class Command
 * @abstract
 */
class Command {
    constructor(source, canRunIteratively) {
        if (typeof source === 'boolean'){
            canRunIteratively = source;
            source = undefined;
        }
       this.source = source;
       this.canRunIteratively = !!canRunIteratively;
    }

    /**
     * Parses the command text and executes the command onto the provided DSU
     * @param {string[]|string} args the arguments of the command split into words
     * @param {Archive|KeySSI} [bar] the destinationDSU or the keySSI
     * @param {string[]} [next] the remaining commands
     * @param {object} [options]
     * @param {function(err, Archive|KeySSI|string|boolean)} callback
     */
    execute(args,bar, next, options, callback){
        if (typeof options === 'function'){
            callback = options;
            options = undefined;
        }
        if (typeof next === 'function'){
            callback = next;
            options = undefined;
            next = undefined;
        }
        if (callback === undefined){
            callback = bar;
            bar = undefined;
        }
        let self = this;
        this._parseCommand(args, next, (err, parsedArgs) => err
            ? self._err(`Could not parse command ${args}`, err, callback)
            : this.canRunIteratively
                ? executeIteratively(bar, this.constructor.name, args, next, this.source, callback)
                : this._runCommand(parsedArgs, bar, options, callback));
    }

    /**
     * Should be overridden by child classes if any argument parsing is required
     *
     * @param {string[]|string|boolean} command the command split into words
     * @param {string[]} next the following Commands
     * @param {function(err, string|string[]|object)} callback
     * @protected
     */
    _parseCommand(command, next, callback){
        if (!callback){
            callback = next;
            next = undefined;
        }
        callback(undefined, command);
    }

    /**
     * @param {string|object} arg the command argument
     * @param {Archive} [bar]
     * @param {object} options
     * @param {function(err, Archive|KeySSI|string)} callback
     * @protected
     */
    _runCommand(arg, bar, options, callback){
        throw new Error("Child classes must implement this");
    }
}

module.exports = Command;