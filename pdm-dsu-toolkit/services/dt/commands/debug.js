/**
 * @module Commands
 * @memberOf dt
 */

/**
 */
const Command = require('./Command');

/**
 * Outputs the source, and arguments its executed with.
 * For debugging purposes (it case the name wasn't enough of a tell =)
 *
 * supports sourceDSU, defaults to fs
 *
 * Can run iteratively
 *
 * @class DebugCommand
 */
class DebugCommand extends Command{
    constructor(source) {
        super(source, false);
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
        if (!callback){
            callback = bar;
            bar = undefined;
        }
        console.log(`DEBUG CMD:---------------------------\n${JSON.stringify({
            source: this.source,
            bar: bar,
            arguments: arg,
            options: options
        })}\nEND DEBUG:---------------------------`);
    }
}

module.exports = DebugCommand;