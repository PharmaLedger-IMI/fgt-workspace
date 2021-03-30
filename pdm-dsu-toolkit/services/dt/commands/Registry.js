/**
 * List of existing commands by their name
 * Without being here, they can't be used
 *
 * @type {string[]}
 */
const registeredCommands = [
    'addFile',
    'addFolder',
    'createFile',
    'delete',
    'readFile'
]


/**
 * List of all available commands to the Dossier Builder
 */
const availableCommands = {};
registeredCommands.forEach(cmdName => {
    availableCommands[cmdName.toLowerCase()] = require(`./${cmdName}`);
});

const getByName = function(cmdName){
    if (!cmdName in availableCommands)
        return undefined;
    return availableCommands[cmdName];
}

module.exports = getByName;