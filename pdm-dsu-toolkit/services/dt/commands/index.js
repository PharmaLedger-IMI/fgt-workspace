/**
 * @module Commands
 * @memberOf dt
 */

/**
 *
 */
const registeredCommands = [
    'delete'
]


/**
 * List of all available commands to the Dossier Builder
 */
const availableCommands = {};
registeredCommands.forEach(c => {
    const name = c.getOperationName();
    availableCommands[name] = require(`./${name}`);
});


module.exports = availableCommands;