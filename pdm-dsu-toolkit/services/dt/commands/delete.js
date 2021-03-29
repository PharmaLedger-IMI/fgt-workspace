/**
 * @module Commands
 * @memberOf dt
 */


/**
 */
const Command = require('./interface/Command');

/**
 * @class DeleteCommand
 */
class DeleteCommand extends Command {
    constructor() {
        super();
    }

    /**
     *
     * @param {string} command the command without it's name
     * @param {string[]} next the following Commands
     * @return {string|object}
     */
    _parseCommand(command, next){

    }



    /**
     * @return the operation name
     */
    getOperationName(){
        return 'delete';
    }
}