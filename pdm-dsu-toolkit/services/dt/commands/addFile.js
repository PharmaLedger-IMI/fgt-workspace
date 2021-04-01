/**
 * @module Commands
 * @memberOf dt
 */

/**
 */
const Command = require('./Command');
const { _err } = require('./utils');

/**
 * Copies a File from disk or from a source DSU when provided
 *
 * supports sourceDSU, defaults to fs
 *
 * Can run iteratively
 *
 * @class AddFileCommand
 */
class AddFileCommand extends Command{
    constructor(varStore, source) {
        super(varStore, source, true);
    }

    /**
     * @param {string[]|string} command the command split into words
     * @param {string[]} next discarded
     * @param {function(err, string|object)} [callback] discarded
     * @return {string|object} the command argument
     * <pre>
     *     {
     *         from: (...),
     *         to: (..)
     *     }
     * </pre>
     * @protected
     */
    _parseCommand(command, next, callback){
        if (!callback){
            callback = next;
            next = undefined;
        }
        callback(undefined, {
            "from": command[0],
            "to": command[1]
        });
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
     * @param {Archive} bar
     * @param {object} options
     * @param {function(err, Archive)} callback
     * @protected
     */
    _runCommand(arg, bar, options, callback) {
        if (!callback) {
            callback = options;
            options = undefined;
        }

        options = options || {encrypt: true, ignoreMounts: false}
        console.log("Copying file " + arg.from + (this.source ? " from sourceDSU" : "") + " to " + arg.to);

        if (!this.source)
            return bar.addFile(arg.from, arg.to, options, err => err
                ? _err(`Could not read from ${arg.from}`, err, callback)
                : callback(undefined, bar));

        this.source.readFile(arg.from, (err, data) => {
            if (err)
                return _err(`Could not read from ${arg.from}`, err, callback);
            bar.writeFile(arg.to, data, err => err
                ? _err(`Could not write to ${arg.to}`, err, callback)
                : callback(undefined, bar));
        });
    }
}

module.exports = AddFileCommand;