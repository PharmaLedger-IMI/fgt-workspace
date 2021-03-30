/**
 * @module Commands
 * @memberOf dt
 */

/**
 */
const Command = require('./Command');

/**
 * Generates a KeySSI
 *
 * @class GenKeyCommand
 */
class GenKeyCommand extends Command {
    constructor() {
        super(undefined, false);
    }

    /**
     * @param {string[]|string} command the command split into words
     * @param {string[]} next the following Commands
     * @param {function(err, string|object)} [callback] for async versatility
     * @return {string|object} the command argument
     * @protected
     */
    _parseCommand(command, next, callback){
        try {
            callback(undefined, {
                type: command.shift(),
                domain: command.shift(),
                args: JSON.parse(command.join(' '))
            });
        } catch (e){
            this._err(`could not parse json ${command}`, e, callback);
        }
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
    _runCommand( arg, bar, options, callback) {
        if (typeof options === 'function'){
            callback = options;
            options = {}
        }
        options = options || {encrypt: true, ignoreMounts: false}
        console.log("Copying file " + arg.from + (this.sourceDSU ? " from sourceDSU" : "") + " to " + arg.to);

        if (!this.source)
            return bar.addFile(arg.from, arg.to, options, err => err
                ? this._err(`Could not read from ${arg.from}`, err, callback)
                : callback(undefined, bar));

        this.source.readFile(arg.from, (err, data) => {
            if (err)
                return this._err(`Could not read from ${arg.from}`, err, callback);
            bar.writeFile(arg.to, data, err =>{
                if (err)
                    return this._err(`Could not write to ${arg.to}`, err, callback);
                callback(undefined, bar);
            });
        });
    }

    /**
     * @return the command name
     */
    getName(){
        return "genkey";
    }
}

module.exports = GenKeyCommand;