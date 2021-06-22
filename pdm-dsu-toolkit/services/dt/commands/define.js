const Command = require('./Command');
const { _err } = require('./utils');

/**
 * Defines a variable that can later be used in the script
 *
 *
 * Command syntax:
 *
 * <pre>
 *     defined var_name [value|command|
 * </pre>
 *
 * args:
 *  - var_name: string : this variable with be replaced in every subsequent command
 *  - value|command: string: a value, or a command that will be executed and its result stored as the variable
 *
 *  * Source object:
 *  - any;
 *
 * @class DefineCommand
 * @extends Command
 * @memberOf Commands
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
        const _getByName = require('./Registry');

        if (!_getByName(arg.command[0])){
            this.varStore.define(arg.varName, arg.command);
            console.log(`Define executed: ${arg.command}`);
            return callback(undefined, bar);
        }

        const parseCommand = function(command, callback){
            const cmdName = command.shift();
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
}

module.exports = DefineCommand;