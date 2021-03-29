/**
 * @module Commands
 * @memberOf dt
 */


/**
 * **Every Command must be registered under the index.js file in the commands folder**
 * @param {Archive} [sourceDSU]
 * @interface Command
 */
class Command {
    constructor(sourceDSU) {
       this.sourceDSU = sourceDSU;
    }


    /**
     * Executes the command
     * @param {Archive} bar
     * @param {string} command
     * @param {string[]} next
     * @param {object} [options]
     * @param {function(err)} callback
     */
    execute(bar, command, next, options, callback){
        const args = this._parseCommand(command, next);
        this._runCommand(bar, args, options, callback)
    }

    /**
     * @param {string} command the command without it's name
     * @param {string[]} next the following Commands
     * @private
     */
    _parseCommand(command, next){
        throw new Error("No parsing logic defined");
    }

    /**
     * @param {Archive} bar
     * @param {string} command the command without it's name
     * @param {string|object} arg the command argument
     * @param {object} options
     * @param {function(err)} callback
     * @private
     */
    _runCommand(bar, arg, options, callback){
        throw new Error("No parsing logic defined");
    }

    /**
     * @return the operation name
     */
    getOperationName(){
        throw new Error('No name defined');
    }
}

module.exports = Command;