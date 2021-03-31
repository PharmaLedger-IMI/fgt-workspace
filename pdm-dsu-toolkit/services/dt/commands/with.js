/**
 * @module Commands
 * @memberOf dt
 */

/**
 */
const Command = require('./Command');
const { _err } = require('./utils');
const endCommand = 'endwith';

/**
 * Allows for more complex logic by allowing you to control the output/input for commands
 * while keeping the commands readable
 *
 * basically sets whatever the result of the with operation into the source portion until it finds the endwith command
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
        while(!this._isEndCommand((cmd = next.shift())))
            commandsToConsider.push(cmd);
        commandsToConsider.push(cmd);
        callback(undefined, commandsToConsider);
    }

    _isEndCommand(cmd){
        return cmd.indexOf(endCommand) === 0;
    }

    /**
     * @param {string[]} arg the command argument
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

        const parseCommand = function(arg, callback){
            const command = arg.shift();
            const cmd = command.split(/`\s+/);
            const cmdName = cmd.shift();
            const _getByName = require('./Registry');
            const actualCmd = _getByName(cmdName);
            if (!actualCmd)
                return callback(`Could not find command`);
            callback(undefined, cmdName, actualCmd, cmd);
        }

        const performWith = function(newSource, commands, callback){
            const cmd = commands.shift();
            if (!cmd)
                return callback(`No endWith command found. this should not be possible`);
            parseCommand(cmd, (err, cmdName, command, args) => {
                if (err)
                    return _err(`Could not parse the command`, err, callback);
                if (cmdName === endCommand)
                    return new command(newSource).execute(callback);
                new command(newSource).execute(args, bar, (err, result) => {
                    if (err)
                        return _err(`Could not execute command ${cmdName}`, err, callback);
                    console.log(`Command ${cmdName} executed with output ${JSON.stringify(result)}`);
                    performWith(newSource, commands, callback);
                });
            });
        }

        parseCommand(arg, (err, cmdName, command, args) => err
            ? _err(`Could not parse Command`, err, callback)
            : new command().execute(args, (err, newSource) => err
                ? _err(`Could not obtain new Source`, err, callback)
                : performWith(newSource, callback)));
    }
}

module.exports = WithCommand;