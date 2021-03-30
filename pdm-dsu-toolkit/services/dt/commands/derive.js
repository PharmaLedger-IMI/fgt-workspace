/**
 * @module Commands
 * @memberOf dt
 */

/**
 */
const Command = require('./Command');
const { _getKeySSISpace } = require('./utils');

/**
 * Derives the provided keySSI
 *
 * @class AddFileCommand
 */
class DeriveCommand extends Command{
    constructor(source) {
        super(source, true);
    }

    /**
     * derives the provided keySSI
     * @param {object} arg the keySSI
     * <pre>
     *     {
     *         from: (...),
     *         to: (..)
     *     }
     * </pre>
     * @param {Archive} bar
     * @param {object} options
     * @param {function(err, Archive)} callback
     * @protected
     */
    _runCommand(arg, bar, options, callback) {
        if (!this.source || !this.source.derive)
            return callback(`No source or source object cannot be derived. It is a KeySSI?`);

        if (!callback) {
            callback = options;
            options = undefined;
        }
        if (!callback) {
            callback = bar;
            bar = undefined;
        }
        callback(undefined, this.source.derive());
    }
}

module.exports = AddFileCommand;