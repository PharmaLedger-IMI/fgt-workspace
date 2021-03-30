/**
 * List of existing commands by their name
 * Without being here, they can't be used
 *
 * @type {string[]}
 */
const _registeredCommands = [
    'addFile',
    'addFolder',
    'createDSU',
    'createFile',
    'debug',
    'delete',
    'derive',
    'endWith',
    'genKey',
    'getIdentifier',
    'mount',
    'readFile',
    'with'
]


/**
 * List of all available commands to the Dossier Builder
 */
const _availableCommands = {};
_registeredCommands.forEach(cmdName => {
    _availableCommands[cmdName.toLowerCase()] = require(`./${cmdName}`);
});

/**
 * return the Command class by its name
 * @param cmdName
 * @return {Command} the command calls to be instanced
 */
const _getByName = function(cmdName){
    if (!cmdName in _availableCommands)
        return undefined;
    return _availableCommands[cmdName];
}

module.exports = _getByName;