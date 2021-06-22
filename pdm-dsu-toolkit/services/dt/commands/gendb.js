const Command = require('./Command');
const { _err, _getKeySSISpace, DB_TYPE } = require('./utils');
const GenKeyCommand = require('./genKey');

/**
 * Generates a DB and returns it's SSI after initialization
 *
 * Source object:
 *  - a DSU;
 *
 * @class GenDBCommand
 * @extends Command
 * @memberOf Commands
 */
class GenDBCommand extends Command {
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

        try {
            let arg = {
                name: command.shift(),
                type: command.shift(),
                domain: command.shift(),
                args: command.join(' ')
            }
            callback(undefined, arg);
        } catch (e){
            _err(`could not parse json ${command}`, e, callback);
        }
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
                return _err(`Could not create DB of type ${arg.type}`, err, callback);
            console.log(`${arg.type} DB created with SSI ${keySSI.getIdentifier()}`)
            callback(undefined, keySSI);
        }

        switch (arg.type){
            case DB_TYPE.WALLET:
                return this._createWalletDB(arg, cb)
            default:
                callback(`Unsupported DB type`);
        }
    }

    _createWalletDB(arg, callback){
        let self = this;
        (new GenKeyCommand(this.varStore).execute(['seed', arg.domain, arg.args], (err, keySSI) => {
            if (err)
                return self._err(`Could not generate key`, err, callback);
            const db = require('opendsu').loadApi('db').getWalletDB(keySSI, arg.name);
            let initialized = false;
            db.on('initialized', () => {
                console.log('Database Initialized');
                initialized = true;
                callback(undefined, db.getShareableSSI());
            });

            const doTimeout = function(){
                if (!initialized){
                    console.log(`db not initialized...`);
                    return setTimeout(doTimeout, 100);
                }
            }
            doTimeout();
        }));
    }
}

module.exports = GenDBCommand;