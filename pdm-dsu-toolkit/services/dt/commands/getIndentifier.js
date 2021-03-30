/**
 * @module Commands
 * @memberOf dt
 */

/**
 */
const Command = require('./Command');
const { _err } = require('./utils');

/**
 * Derives the provided keySSI
 *
 * @class AddFileCommand
 */
class GetIdentifierCommand extends Command{
    constructor(source) {
        super(source, false);
    }

    /**
     * @param {string[]|string} command the command split into words
     * @param {string[]} next discarded
     * @param {function(err, boolean)} callback
     * @protected
     */
    _parseCommand(command, next, callback){
        if (!callback){
            callback = next;
            next = undefined;
        }
        callback(undefined, command
            ? (command === 'true' || command[0] === 'true')
            : false);
    }

    /**
     * derives the provided keySSI
     * @param {boolean} arg identifier as string (defaults to false)
     * @param {Archive} bar
     * @param {object} options
     * @param {function(err, Archive)} callback
     * @protected
     */
    _runCommand(arg, bar, options, callback) {
        if (!this.source || (!this.source.getIdentifier && !this.source.getKeySSIAsString))
            return callback(`No source or source object cannot be derived. It is a KeySSI or a DSU?`);
        if (!callback) {
            callback = options;
            options = undefined;
        }
        if (!callback) {
            callback = bar;
            bar = undefined;
        }
        // if its a dsu
        if (arg.constructor && arg.constructor.name === 'Archive')
            return (arg ? this.source.getKeySSIAsString : this.source.getKeySSIAsObject)((err, identifier) => err
                ? _err(`Could not get identifier`, err, callback)
                : callback(undefined, identifier));

        // if its a KeySSI
        try{
            let identifier = arg ? this.source.getIdentifier() : this.source;
            if (!identifier)
                return callback(`Could not get identifier`);
            callback(undefined, identifier);
        } catch (e){
            _err(`Could not get identifier`, e, callback);
        }
    }
}

module.exports = GetIdentifierCommand;