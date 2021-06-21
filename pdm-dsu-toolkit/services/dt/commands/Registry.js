/**
 * List of all available commands to the Dossier Builder
 * Without being here, they can't be used
 * @module Commands
 * @memberOf dt
 */
const _availableCommands = {
    addfile: require('./addFile'),
    addfolder: require('./addFolder'),
    createdsu: require('./createDSU'),
    createfile: require('./createFile'),
    define: require('./define'),
    delete: require('./delete'),
    derive: require('./derive'),
    endwith: require('./endWith'),
    gendb: require('./gendb'),
    genkey: require('./genKey'),
    getidentifier: require('./getIndentifier'),
    mount: require('./mount'),
    objtoarray: require('./objToArray'),
    readfile: require('./readFile'),
    with: require('./with')
};

/**
 * return the Command class by its name
 * @param cmdName
 * @return {Command} the command calls to be instanced
 * @module Commands
 * @memberOf dt
 */
const _getByName = function(cmdName){
    if (cmdName in _availableCommands)
        return _availableCommands[cmdName];
    return undefined;
}

module.exports = _getByName;