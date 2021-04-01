/**
 * @module Commands
 * @memberOf dt
 */
const { _err } = require('./utils');

/**
 * **Every Command must be registered under the index.js file in the commands folder**
 * @param {VarStore} varStore
 * @param {Archive|fs} [source]
 * @param {boolean} [canRunIteratively] defines if the command can expect multiple arguments and run multiple times. defaults to false
 * @class Command
 * @abstract
 */
class Command {
    constructor(varStore, source, canRunIteratively) {
        if (typeof source === 'boolean'){
            canRunIteratively = source;
            source = undefined;
        }
        if (!varStore.checkVariables)
            throw new Error('Cant happen')

        this.varStore = varStore;
        this.source = source;
        this.canRunIteratively = !!canRunIteratively;
    }

    /**
     * Parses the command text and executes the command onto the provided DSU
     * @param {string[]|string} args the arguments of the command split into words
     * @param {Archive|KeySSI} [bar] the destinationDSU or the keySSI
     * @param {string[]} [next] the remaining commands
     * @param {object} [options]
     * @param {function(err, Archive|KeySSI|string|boolean)} callback
     */
    execute(args,bar, next, options, callback){
        if (typeof options === 'function'){
            callback = options;
            options = undefined;
        }
        if (typeof next === 'function'){
            callback = next;
            options = undefined;
            next = undefined;
        }
        if (callback === undefined){
            callback = bar;
            bar = undefined;
        }
        let self = this;
        this._parseCommand(args, next, (err, parsedArgs) => {
            if (err)
                return _err(`Could not parse command ${args}`, err, callback);

            // Tests against variables
            if (self.varStore)
                parsedArgs = self.varStore.checkVariables(parsedArgs);

            if (!self.canRunIteratively || !(parsedArgs instanceof Array))
                return self._runCommand(parsedArgs, bar, options, callback);

            const iterator = function(args, callback){
                let arg = parsedArgs.shift();
                if (!arg)
                    return callback(undefined, bar);
                return self._runCommand(arg, bar, options, (err, dsu) => err
                    ? _err(`Could iterate over Command ${self.constructor.name} with args ${JSON.stringify(arg)}`, err, callback)
                    : iterator(args, callback));
            }

            iterator(args, callback);
        });
    }

    /**
     * Should be overridden by child classes if any argument parsing is required
     *
     * @param {string[]|string|boolean} command the command split into words
     * @param {string[]} next the following Commands
     * @param {function(err, string|string[]|object)} callback
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
     * @param {string|object} arg the command argument
     * @param {Archive} [bar]
     * @param {object} options
     * @param {function(err, Archive|KeySSI|string)} callback
     * @protected
     */
    _runCommand(arg, bar, options, callback){
        throw new Error("Child classes must implement this");
    }
}

module.exports = Command;