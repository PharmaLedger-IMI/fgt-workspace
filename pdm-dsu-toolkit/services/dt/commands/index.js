/**
 * @module Commands
 * @memberOf dt
 */

module.exports = {
    AddFileCommand: require('./addFile'),
    AddFolderCommand: require('./addFolder'),
    CreateDSUCommand: require('./createDSU'),
    CreateFileCommand: require('./createFile'),
    DefineCommand: require('./define'),
    DeleteCommand: require('./delete'),
    DeriveCommand: require('./derive'),
    EndWithCommand: require('./endWith'),
    GenKeyCommand: require('./genKey'),
    GetIdentifierCommand: require('./getIndentifier'),
    MountCommand: require('./mount'),
    ObjToArrayCommand: require('./objToArray'),
    ReadFileCommand: require('./readFile'),
    WithCommand: require('./with'),
    _getByName: require('./Registry')
}