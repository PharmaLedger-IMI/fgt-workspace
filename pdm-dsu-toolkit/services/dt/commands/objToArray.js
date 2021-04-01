/**
 * @module Commands
 * @memberOf dt
 */

/**
 */
const Command = require('./Command');
const { _err } = require('./utils');

/**
 * Util Command to convert objects to and array with their values
 * @class ObjToArrayCommand
 */
class ObjToArrayCommand extends Command{
    constructor(varStore, source) {
        super(varStore, source, false);
    }

    _parseCommand(command, next, callback){
        if (!callback){
            callback = next;
            next = undefined;
        }
        callback(undefined, typeof command === 'string' ? command : command.shift());
    }

    /**
     * Outputs all args to console
     * @param {object} arg
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
        try{
            const obj = JSON.parse(arg);
            if (typeof obj !== 'object')
                return callback(`Provided argument is not an object`);
            if (Array.isArray(obj)){
                console.log(`Object was already an array ${arg}`);
                callback(undefined, obj);
            }
            callback(undefined, JSON.stringify(Object.values(obj)));
        } catch (e) {
            _err(`Could not parse object. Was it a valid json?`, e, callback);
        }
    }
}

module.exports = ObjToArrayCommand;