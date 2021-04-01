/**
 * @module Commands
 * @memberOf dt
 */

/**
 */
const Command = require('./Command');
const { _err, _getKeySSISpace, KEY_TYPE } = require('./utils');

/**
 * Generates a KeySSI
 *
 * @class GenKeyCommand
 */
class GenKeyCommand extends Command {
    constructor(varStore) {
        super(varStore,undefined, false);
    }

    /**
     * @param {string[]|string} command the command split into words
     * @param {string[]} next the following Commands
     * @param {function(err, string|object)} [callback] for async versatility
     * @return {string|object} the command argument
     * @protected
     */
    _parseCommand(command, next, callback){
        if (!callback){
            callback = next;
            next = undefined;
        }

        const tryParseJson = function(text){
            try {
                let parsedArgs = JSON.parse(text);
                if (parsedArgs && typeof parsedArgs === 'object')
                    return parsedArgs;
                return text;
            } catch (e) {
                // The argument is just a string. leave it be
                return text;
            }
        }

        try {
            let arg = {
                type: command.shift(),
                domain: command.shift(),
                args: tryParseJson(command.shift())
            }

            if (typeof arg.args === 'object' && arg.args.args){
                arg.hint = arg.args.hint;
                arg.args = tryParseJson(arg.args.args);
            }
            callback(undefined, arg);
        } catch (e){
            _err(`could not parse json ${command}`, e, callback);
        }
    }

    /**
     * Creates an Arrays SSI off a secret list
     *
     * Adds options.hint to hit if available
     * @param {object} args
     * @param {function(err, ArraySSI)} callback
     * @private
     */
    _createArraySSI = function(args, callback){
        const key = _getKeySSISpace().createArraySSI(args.domain, args.args, 'v0', args.hint ? JSON.stringify(args.hint) : undefined);
        callback(undefined, key);
    }

    /**
     * Creates a Wallet SSI off a secret list
     *
     * Adds options.hint to hit if available
     * @param {object} args
     * @param {function(err, ArraySSI)} callback
     */
    _createWalletSSI = function(args, callback){
        const key = _getKeySSISpace().createTemplateWalletSSI(args.domain, args.args, 'v0', args.hint ? JSON.stringify(args.hint) : undefined);
        callback(undefined, key);
    }

    /**
     * Creates an Arrays SSI off a secret list
     *
     * Adds options.hint to hit if available
     * @param {object} args
     * @param {function(err, TemplateSeedSSI)} callback
     */
    _createSSI = function(args, callback){
        const key = _getKeySSISpace().createTemplateSeedSSI(args.domain, args.args, undefined, 'v0', args.hint ? JSON.stringify(args.hint) : undefined);
        callback(undefined, key);
    }

    /**
     * Copies a file, from disk or another DSU
     * @param {object} arg
     * <pre>
     *     {
     *         type: (...),
     *         domain: (..),
     *         args: []| {
     *                  hint: (..)
     *                  args: []
     *         }
     *     }
     * </pre>
     * @param {Archive} bar unused
     * @param {object} options unused
     * @param {function(err, KeySSI)} callback
     * @protected
     */
    _runCommand(arg, bar, options, callback) {
        if(!callback){
            callback = options;
            options = bar;
            bar = undefined;
        }
        if (typeof options === 'function'){
            callback = options;
            options = undefined;
        }
        const cb = function(err, keySSI){
            if (err)
                return _err(`Could not create keySSI with ${JSON.stringify(arg)}`, err, callback);
            console.log(`${arg.type} KeySSI created with SSI ${keySSI.getIdentifier()}`)
            callback(undefined, keySSI);
        }

        switch (arg.type){
            case KEY_TYPE.SEED:
                return this._createSSI(arg, cb)
            case KEY_TYPE.ARRAY:
                return this._createArraySSI(arg, cb);
            case KEY_TYPE.WALLET:
                return this._createWalletSSI(arg, cb);
            default:
                callback(`Unsupported key type`);
        }
    }
}

module.exports = GenKeyCommand;