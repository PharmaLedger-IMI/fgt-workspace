/**
 * @module Commands
 */

/**
 * cache of node's fs object
 */

let  _fileSystem = undefined;

/**
 * Caches and returns node's fs object if the environment is right
 * @return {fs}
 */
const _getFS = function(){
    if ($$.environmentType !== 'nodejs')
        throw new Error("Wrong environment for this function. Please make sure you know what you are doing...");
    if (!_fileSystem)
        _fileSystem = require('fs');
    return _fileSystem;
}

module.exports = _getFS;