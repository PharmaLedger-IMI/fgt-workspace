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
    constructor(varStore, source) {
        super(varStore, source, false);
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
        if (!callback){
            callback = arg;
            arg = undefined;
        }
        console.log(`DEBUG CMD:---------------------------\n${JSON.stringify({
            source: JSON.stringify(this.source),
            bar: JSON.stringify(bar),
            arguments: JSON.stringify(arg),
            options: JSON.stringify(options)
        })}\nEND DEBUG:---------------------------`);
        callback(undefined, bar);
    }
}

module.exports = DebugCommand;