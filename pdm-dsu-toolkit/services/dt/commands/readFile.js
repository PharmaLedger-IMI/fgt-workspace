/**
 * @module Commands
 * @memberOf dt
 */

/**
 */
const Command = require('./Command');
const { _getFS, _err } = require('./utils')

/**
 * Reads The contents of a file from disk or from a sourceDSU
 *
 * supports sourceDSU
 *
 * @class ReadFileCommand
 */
class ReadFileCommand extends Command{
    constructor(source) {
        super(source ? source : _getFS());
        this.dataToString = !source;
    }

    /**
     * @param {string[]|string} command the command split into words
     * @param {string[]} next the following Commands
     * @param {function(err, string|object)} [callback] for async versatility
     * @protected
     */
    _parseCommand(command, next, callback){
        if (!callback){
            callback = next;
            next = undefined;
        }
        callback(undefined, command[0]);
    }

    /**
     * @param {Archive} bar unused in this method
     * @param {string} arg the command argument
     * @param {object} options
     * @param {function(err, Archive)} callback
     * @protected
     */
    _runCommand(arg, bar, options, callback){
        if (typeof options === 'function'){
            callback = options;
            options = undefined;
        }
        if (!callback) {
            callback = bar;
            bar = undefined
        }

        this.source.readFile(arg, (err, data) => err
            ? _err(`Could not read file at ${arg}`, err, callback)
            : callback(undefined, this.dataToString ? data : data.toString()));
    }
}

module.exports = ReadFileCommand;