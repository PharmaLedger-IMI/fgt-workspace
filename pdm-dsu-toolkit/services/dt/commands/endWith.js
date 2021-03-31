/**
 * @module Commands
 * @memberOf dt
 */

/**
 */
const Command = require('./Command');

/**
 * Allows for more complex logic by allowing you to control the output/input for commands
 * while keeping the commands readable
 *
 * basically sets whatever the result of the with operation into the source portion until it finds the endwith command
 *
 * @class EndWithCommand
 */
class EndWithCommand extends Command{
    constructor(source) {
        super(source);
        this._availableCommands = undefined;
    }

    /**
     * Returns the source object
     * @param {string[]|object} arg unused
     * @param {Archive} bar unused
     * @param {object} options unused
     * @param {function(err, Archive|KeySSI)} callback
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

        // return whatever the source was
        if (!this.source)
            return callback(`No Source to return. should not be possible`);
        callback(undefined, this.source);
    }
}

module.exports = EndWithCommand;