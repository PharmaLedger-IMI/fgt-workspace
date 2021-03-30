/**
 * @module Commands
 * @memberOf dt
 */

/**
 */
const Command = require('./Command');
const getCommandByName = require('./Registry');
const endCommand = 'endwith';

/**
 * Allows for more complex logic by allowing you to control the output/input for commands
 * while keeping the commands readable
 *
 * @class WithCommand
 */
class WithCommand extends Command{
    constructor(sourceDSU) {
        super(sourceDSU);
        this._availableCommands = undefined;
    }

    /**
     * @param {string[]|string} command the command split into words
     * @param {string[]} next the following Commands
     * @param {function(err, string|object)} [callback] for async versatility
     * @return {string|object} the command argument
     * @protected
     */
    _parseCommand(command, next, callback){
        if (!next)
            throw new Error("No next defined");
        const commandsToConsider = [command];
        let cmd;
        while(!this._isEndCommand(cmd = next.shift()))
            commandsToConsider.push(cmd);
        commandsToConsider.push(cmd);
        callback(undefined, commandsToConsider);
    }

    _isEndCommand(cmd){
        return cmd.indexOf(endCommand) === 0;
    }

    /**
     * @param {string[]|object} arg the command argument
     * @param {Archive} bar
     * @param {object} options
     * @param {function(err, Archive)} callback
     * @protected
     */
    _runCommand(arg, bar, options, callback){
        if (typeof options === 'function') {
            callback = options;
            options = undefined;
        }
        if (!callback){
            callback = bar;
            bar = undefined;
        }

        //let toKeep =

    }

    /**
     * @return the operation name
     */
    getName(){
        return "with";
    }
}

module.exports = WithCommand;