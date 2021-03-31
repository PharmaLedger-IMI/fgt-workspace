/**
 * @module Commands
 * @memberOf dt
 */

/**
 */
const Command = require('./Command');

/**
 * Derives the provided keySSI
 *
 * @class DeriveCommand
 */
class DeriveCommand extends Command{
    constructor(source) {
        super(source, true);
    }

    /**
     * derives the provided keySSI (in the source object)
     * @param {object} arg unused
     * @param {Archive} bar unused
     * @param {object} options unsused
     * @param {function(err, KeySSI)} callback
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
        try {
            callback(undefined, this.source.derive());
        } catch (e) {
            _err(`Could not derive Key ${JSON.stringify(this.source)}`, e, callback)
        }
    }
}

module.exports = DeriveCommand;