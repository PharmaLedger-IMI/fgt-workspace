const Command = require('./Command');
const {_getFS, _err} = require('./utils');

/**
 * Creates a file with the provided content on the destination DSU
 * (similar to a touch command with added content)
 *
 * Analog to OpenDSU's Archive writeFile method
 *
 * fs compatible
 *
 * Command syntax:
 *
 * <pre>
 *     createfile path content
 * </pre>
 *
 * args:
 *  - content: string
 *
 *  * Source object:
 *  - a DSU;
 *
 * @class CreateFileCommand
 * @extends Command
 * @memberOf Commands
 */
class CreateFileCommand extends Command{
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
    _parseCommand(command, next, callback){
        command = typeof command === 'string' ? command.split(' ') : command;
        callback(undefined,  {
            path: command.shift(),
            content: command.join(' ')
        });
    }

    /**
     * Writes a file
     * @param {object} arg the command argument
     * <pre>
     *     {
     *         path: (...),
     *         content: (..)
     *     }
     * </pre>
     * @param {Archive|fs} bar
     * @param {object} options
     * @param {function(err, string)} callback
     * @protected
     */
    _runCommand(arg, bar, options, callback){
        if (typeof options === 'function') {
            callback = options;
            options = undefined;
        }
        if (!bar)
            bar = _getFS();
        options = options || {encrypt: true, ignoreMounts: false};
        bar.writeFile(arg.path, arg.content, options, (err) => err
            ? _err(`Could not create file at ${arg.path}`, err, callback)
            : callback(undefined, bar));
    }
}

module.exports = CreateFileCommand;