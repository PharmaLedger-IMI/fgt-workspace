
/**
 * cache of node's fs object
 * @module Commands
 * @memberOf dt
 */
let  _fileSystem = undefined;

/**
 * Caches and returns node's fs object if the environment is right
 * @return {fs}
 * @module Commands
 * @memberOf dt
 */
const _getFS = function(){
    if ($$.environmentType !== 'nodejs')
        throw new Error("Wrong environment for this function. Please make sure you know what you are doing...");
    if (!_fileSystem)
        _fileSystem = require('fs');
    return _fileSystem;
}

/**
 * Provides Util functions and Methods as well as caching for the open DSU resolver and {@Link DSUBuilder}
 */

let resolver, keyssi;

/**
 * Wrapper around
 * <pre>
 *     OpenDSUSafeCallback(callback)(createOpenDSUErrorWrapper(msg, err));
 * </pre>
 * @param msg
 * @param err
 * @param callback
 * @protected
 * @module Commands
 * @memberOf dt
 */
const _err = function(msg, err, callback){
    return OpenDSUSafeCallback(callback)(createOpenDSUErrorWrapper(msg, err));
}

/**
 * for singleton use
 * @returns {function} resolver api
 * @module Commands
 * @memberOf dt
 */
const _getResolver = function(){
    if (!resolver)
        resolver = require('opendsu').loadApi('resolver');
    return resolver;
}

/**
 * for singleton use
 * @returns {function} keyssi api
 * @module Commands
 * @memberOf dt
 */
const _getKeySSISpace = function(){
    if (!keyssi)
        keyssi = require('opendsu').loadApi('keyssi');
    return keyssi;
}

/**
 *
 * @type {{ARRAY: string, WALLET: string, SEED: string}}
 * @module Commands
 * @memberOf dt
 */
const KEY_TYPE = {
    ARRAY: "array",
    SEED: "seed",
    WALLET: 'wallet'
}
/**
 *
 * @type {{WALLET: string, CONST: string, SEED: string}}
 * @module Commands
 * @memberOf dt
 */
const DSU_TYPE = {
    CONST: "const",
    WALLET: "wallet",
    SEED: "seed"
}
/**
 *
 * @type {{WALLET: string}}
 * @module Commands
 * @memberOf dt
 */
const DB_TYPE = {
    WALLET: "wallet"
}

module.exports = {
    _getFS,
    _getResolver,
    _getKeySSISpace,
    _err,
    KEY_TYPE,
    DSU_TYPE,
    DB_TYPE
};