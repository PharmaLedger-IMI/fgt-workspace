const Command = require('./Command');
const { _err, _getResolver, DSU_TYPE, KEY_TYPE } = require('./utils');
const genKey = require('./genKey');

/**
 * @param {DSU_TYPE} dsuType
 * @return {KEY_TYPE}
 * @function _getKeyType
 * @memberOf Commands
 * @private
 */
const _getKeyType = function(dsuType){
    switch (dsuType){
        case DSU_TYPE.CONST:
            return KEY_TYPE.ARRAY;
        case DSU_TYPE.WALLET:
            return KEY_TYPE.WALLET;
        case DSU_TYPE.SEED:
            return KEY_TYPE.SEED;
        default:
            throw new Error(`Unsupported DSU Type`);
    }
}


/**
 * Creates an Arrays SSI off a secret list
 *
 * Adds options.hint to hit if available
 * @param {string[]} arg
 * @param {function(err, KeySSI)} callback
 * @memberOf Commands
 * @private
 */
_createSSI = function(varStore, arg, callback){
    const argToArray = (arg) => {
        return `${arg.type} ${arg.domain} ${typeof arg.args === 'string' ? arg.args : JSON.stringify(arg.hint ? {
            hint: arg.hint,
            args: arg.args
        } : arg.args)}`.split(/\s+/);
    }
    new genKey(varStore).execute(argToArray(arg), callback);
}


/**
 * Creates a DSU of an ArraySSI
 * @param {string[]} arg
 * @param {object} opts DSU Creation Options
 * @param {function(err, Archive)} callback
 * @memberOf Commands
 * @private
 */
_createWalletDSU = function(varStore, arg, opts, callback){
    _createSSI(varStore, arg, (err, keySSI) => {
        _getResolver().createDSUForExistingSSI(keySSI, opts, (err, dsu) => {
            if (err)
                return _err(`Could not create wallet DSU`, err, callback);
            callback(undefined, dsu);
        });
    });
}

/**
 * Creates a DSU of an ArraySSI
 * @param {string[]} arg String for Seed SSI
 * @param {object} opts DSU Creation Options
 * @param {function(err, Archive)} callback
 * @memberOf Commands
 * @private
 */
_createDSU = function(varStore, arg, opts, callback){
    _createSSI(varStore, arg, (err, keySSI) => {
        _getResolver().createDSU(keySSI, opts, (err, dsu) => {
            if (err)
                return _err(`Could not create DSU`, err, callback);
            callback(undefined, dsu);
        });
    });
}

/**
 * Creates a DSU of an ArraySSI
 * @param {string[]} arg
 * @param {object} opts DSU Creation Options
 * @param {function(err, Archive)} callback
 * @memberOf Commands
 * @private
 */
_createConstDSU = function(varStore, arg,opts , callback){
    _createSSI(varStore, arg, (err, keySSI) => {
        _getResolver().createDSUForExistingSSI(keySSI, opts, (err, dsu) => {
            if (err)
                return _err(`Could not create const DSU`, err, callback);
            callback(undefined, dsu);
        });
    });
}

/**
 *
 * @param isConst
 * @param isWallet
 * @return {Commands._createWalletDSU|Commands._createConstDSU|Commands._createDSU}
 * @private
 * @memberOf Commands
 */
_getDSUFactory = function(isConst, isWallet){
    return isConst ? (isWallet ? _createWalletDSU : _createConstDSU) : _createDSU;
}

/**
 * creates a new DSU of the provided type and with the provided key gen arguments
 *
 * Analog to OpenDSU's Resolver createDSU method
 *
 * Command syntax:
 *
 * <pre>
 *     createdsu type domain args
 * </pre>
 *
 * args:
 *  - type: 'array' | 'seed'
 *  - domain: the anchoring domain
 *  - args: string|string[] stringified
 *
 *  * Source object:
 *  - any;
 *
 * @class CreateDSUCommand
 * @extends Command
 * @memberOf Commands
 */
class CreateDSUCommand extends Command{
    constructor(varStore, source) {
        super(varStore, source, false);
    }

    /**
     * @param {string[]|string} command the command split into words
     * @param {string[]} next discarded
     * @param {function(err, string|object)} [callback] discarded
     * @return {string|object} the command argument
     * <pre>
     *     {
     *         type: (...),
     *         domain: (..)
     *         args: {string[]|object},
     *     }
     * </pre>
     * @protected
     */
    _parseCommand(command, next, callback){
        if (!callback){
            callback = next;
            next = undefined;
        }
        try {
            let arg = {
                dsuType: command.shift(),
                domain: command.shift(),
                args: command.length === 1 ? command[0] : JSON.parse(command.join(' '))
            }
            arg.type = _getKeyType(arg.dsuType);
            if (typeof arg.args === 'object' && arg.args.args){
                arg.hint = arg.args.hint;
                arg.args = arg.args.args;
            }
            callback(undefined, arg)
        } catch (e){
            _err(`could not parse json ${command}`, e, callback);
        }
    }

    /**
     * Copies a file, from disk or another DSU
     * @param {object} arg
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
        if(!callback){
            callback = options;
            options = bar;
            bar = undefined;
        }
        if (typeof options === 'function'){
            callback = options;
            options = undefined;
        }
        const cb = function(err, dsu){
            if (err)
                return _err(`Could not create DSU with ${JSON.stringify(arg)}`, err, callback);
            console.log(`${arg.dsuType} DSU created`);
            callback(undefined, dsu);
        }

        switch (arg.dsuType){
            case DSU_TYPE.SEED:
                return _createDSU(this.varStore, arg, cb)
            case DSU_TYPE.CONST:
                return _createConstDSU(this.varStore, arg, cb);
            case DSU_TYPE.WALLET:
                return _createWalletDSU(this.varStore, arg, cb);
            default:
                callback(`Unsupported key type`);
        }
    }
}

module.exports = CreateDSUCommand;