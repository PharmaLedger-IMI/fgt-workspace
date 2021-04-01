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
    constructor(varStore) {
        super(varStore);
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
        if (!callback) {
            callback = options;
            options = undefined;
        }
        if (!callback){
            callback = bar;
            bar = arg;
            arg = undefined;
        }

        // return whatever the object was
        if (!bar)
            return callback(`Nothing to return. should not be possible`);

        console.log(`Ending With command. Returning to ${JSON.stringify(bar)}`);
        callback(undefined, bar);
    }
}

module.exports = EndWithCommand;