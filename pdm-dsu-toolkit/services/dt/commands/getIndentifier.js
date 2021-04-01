/**
 * @module Commands
 * @memberOf dt
 */

/**
 */
const Command = require('./Command');
const { _err } = require('./utils');

/**
 * Returns the identifier for the current source object
 *
 * @class GetIdentifierCommand
 */
class GetIdentifierCommand extends Command{
    constructor(varStore) {
        super(varStore);
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
     * @param {Archive|KeySSI} bar
     * @param {object} options unused
     * @param {function(err, string|KeySSI)} callback
     * @protected
     */
    _runCommand(arg, bar, options, callback) {
        if (!callback) {
            callback = options;
            options = undefined;
        }
        if (!bar.getIdentifier && !bar.getKeySSIAsString)
            return callback(`The object cannot be derived. It is a KeySSI or a DSU?`);

        // if its a dsu
        if (bar.constructor && bar.constructor.name === 'Archive')
            return (arg ? bar.getKeySSIAsString : bar.getKeySSIAsObject)((err, identifier) => err
                ? _err(`Could not get identifier`, err, callback)
                : callback(undefined, identifier));

        // if its a KeySSI
        try{
            let identifier = arg ? bar.getIdentifier() : bar;
            if (!identifier)
                return callback(`Could not get identifier`);
            callback(undefined, identifier);
        } catch (e){
            _err(`Could not get identifier`, e, callback);
        }
    }
}

module.exports = GetIdentifierCommand;