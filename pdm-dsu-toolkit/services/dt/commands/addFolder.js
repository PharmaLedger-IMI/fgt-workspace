/**
 * @module Commands
 * @memberOf dt
 */

/**
 */
const Command = require('./Command');
const { _err } = require('./utils');

/**
 * This command copies an entire folder from the filesystem onto the destination DSU
 * (as a single brick for efficiency if I'm not mistaken)
 *
 * Does not Support sourceDSU (yet)
 *
 * Can run iteratively
 *
 * @class AddFolderCommand
 */
class AddFolderCommand extends Command {
    constructor(varStore, source) {
        super(varStore, source, false);
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
        callback(undefined, command[0]);
    }

    /**
     * @param {string|object} arg the command argument
     * @param {Archive} bar
     * @param {object} [options]
     * @param {function(err, Archive)} callback
     * @protected
     */
    _runCommand(arg, bar, options, callback){
        if (this.source){
            console.log("The addFolder Method is not supported when reading from a sourceDSU");
            callback(undefined, bar);
        }
        if (!callback) {
            callback = options;
            options = undefined;
        }

        options = options || {batch: false, encrypt: false};
        console.log("Adding Folder " + '/' + arg)
        bar.addFolder(arg, '/', options, err => err
            ? _err(`Could not add folder at '${'/' + arg}'`, err, callback)
            : callback(undefined, bar));
    }
}

module.exports = AddFolderCommand;