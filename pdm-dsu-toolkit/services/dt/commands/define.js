/**
 * @module Commands
 * @memberOf dt
 */

/**
 */
const Command = require('./Command');
const { _err, VAR, CMD} = require('./utils');

/**
 * Defines a variable that can later be used in the script
 *
 * @class DefineCommand
 */
class DefineCommand extends Command {
    constructor(varStore) {
        super(varStore);
    }

    /**
     * @param {string[]|string} command the command split into words
     * @param {string[]} next the following Commands
     * @param {function(err, string|object)} [callback] for async versatility
     * @return {string|object} the command argument
     * @protected
     */
    _parseCommand(command, next, callback) {
        if (!callback){
            callback = next;
            next = undefined;
        }

        callback(undefined, {
            varName: command.shift(),
            from: command.shift().replace('from',''),
            command: command
        });
    }

    /**
     * @param {string[]|object} arg the command argument
     * @param {Archive} bar
     * @param {object} options
     * @param {function(err, Archive)} callback
     * @protected
     */
    _runCommand(arg, bar, options, callback) {
        if (typeof options === 'function') {
            callback = options;
            options = undefined;
        }
        let self = this;

        if (arg.from === VAR){
            this.varStore.define(arg.varName, arg.command);
            console.log(`Define executed: ${arg.command}`);
            return callback(undefined, bar);
        }

        if (arg.from === CMD) {
            const parseCommand = function(command, callback){
                const cmdName = command.shift();
                const _getByName = require('./Registry');
                const actualCmd = _getByName(cmdName);
                if (!actualCmd)
                    return callback(`Could not find command`);
                callback(undefined, cmdName, actualCmd, command);
            }

            return parseCommand(arg.command, (err, cmdName, command, args) => err
                ? _err(`Could not parse Command`, err, callback)
                : new (command)(self.varStore, self.source).execute(args, bar, (err, result) => {
                    if (err)
                        return _err(`Could not obtain result`, err, callback);
                    this.varStore.define(arg.varName, result);
                    console.log(`Define executed: ${result}`);
                    callback(undefined, bar);
                }));
        }
        callback(`Could not recognize define statement`);
    }
}

module.exports = DefineCommand;