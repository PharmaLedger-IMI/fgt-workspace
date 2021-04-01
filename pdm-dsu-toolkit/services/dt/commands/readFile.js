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
    constructor(varStore, source) {
        super(varStore, source ? source : _getFS());
        this.dataToString = !source;
    }

    _parseCommand(command, next, callback){
        if (!callback){
            callback = next;
            next = undefined;
        }
        callback(undefined, typeof command === 'string' ? command : command[0]);
    }

    /**
     * @param {string[]|string} command the command split into words
     * @param {string[]} next the following Commands
     * @param {function(err, string)} callback
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