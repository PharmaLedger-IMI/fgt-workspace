/**
 * @module Commands
 * @memberOf dt
 */

/**
 */
const Command = require('./Command');
const { _err, VAR, CMD } = require('./utils');
const endCommand = 'endwith';
const startCommand = 'with';



/**
 * Allows for more complex logic by allowing you to control the output/input for commands
 * while keeping the commands readable
 *
 * basically sets whatever the result of the with operation into the source portion until it finds the endwith command
 *
 * @class WithCommand
 */
class WithCommand extends Command {
    constructor(varStore, source) {
        super(varStore, source);
    }

    /**
     * @param {string[]|string} command the command split into words
     * @param {string[]} next the following Commands
     * @param {function(err, string|object)} [callback] for async versatility
     * @return {string|object} the command argument
     * @protected
     */
    _parseCommand(command, next, callback) {
        if (!next)
            throw new Error("No next defined");
        const commandsToConsider = [command.shift(), command];
        let cmd;
        let count = 0;
        while (!this._isEndCommand((cmd = next.shift())) && count === 0){
            let c = cmd.split(/\s+/);
            commandsToConsider.push(c);
            if (this._isStartCommand(c[0]))
                count++;
            if (this._isEndCommand(c[0]))
                count--;
        }

        commandsToConsider.push(cmd.split(/\s+/));
        callback(undefined, commandsToConsider);
    }

    _isStartCommand(cmd){
        return cmd.indexOf(startCommand) === 0;
    }

    _isEndCommand(cmd) {
        return cmd.indexOf(endCommand) === 0;
    }

    /**
     * @param {string[]} arg the command argument
     * @param {Archive} bar
     * @param {object} options
     * @param {function(err, Archive)} callback
     * @protected
     */
    _runCommand(arg, bar, options, callback) {
        let self = this;
        if (typeof options === 'function') {
            callback = options;
            options = undefined;
        }
        if (!callback){
            callback = bar;
            bar = undefined;
        }

        const parseCommand = function(command, callback){
            const cmdName = command.shift();
            const _getByName = require('./Registry');
            const actualCmd = _getByName(cmdName);
            if (!actualCmd)
                return callback(`Could not find command`);
            callback(undefined, cmdName, actualCmd, command);
        }

        const performWith = function(newSource, commands, callback){
            const cmd = commands.shift();
            if (!cmd)
                return callback(`No endWith command found. this should not be possible`);
            parseCommand(cmd, (err, cmdName, command, args) => {
                if (err)
                    return _err(`Could not parse the command ${cmd}`, err, callback);
                if (cmdName === endCommand)
                    return new command(self.varStore, self.source).execute(undefined, bar, callback);
                new command(self.varStore, self.source).execute(args, newSource, (err, result) => {
                    if (err)
                        return _err(`Could not execute command ${cmdName}`, err, callback);
                    console.log(`Command ${cmdName} executed with output ${JSON.stringify(result)}`);
                    performWith(newSource, commands, callback);
                });
            });
        }

        const withType = arg.shift();

        if (withType === VAR){
            console.log(`With ${withType} executed: ${arg[0]}`);
            return performWith(arg.shift().shift(), arg, callback);
        }

        if (withType === CMD)
            return parseCommand(arg.shift(), (err, cmdName, command, args) => err
                ? _err(`Could not parse Command`, err, callback)
                : new (command)(self.varStore, self.source).execute(args, (err, result) => {
                    if (err)
                        return _err(`Could not obtain result`, err, callback);
                    console.log(`With ${withType} executed: ${JSON.stringify(result)}`);
                    performWith(result, arg, callback);
                }));

        return callback(`Invalid WITH type. Should be var or cmd`);
    }
}

module.exports = WithCommand;