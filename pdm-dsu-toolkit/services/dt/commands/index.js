/**
 * @module Commands
 * @memberOf dt
 */

module.exports = {
    AddFileCommand: require('./addFile'),
    AddFolderCommand: require('./addFolder'),
    CreateDSUCommand: require('./createDSU'),
    CreateFileCommand: require('./createFile'),
    DeleteCommand: require('./delete'),
    DeriveCommand: require('./derive'),
    EndWithCommand: require('./endWith'),
    GenKeyCommand: require('./genKey'),
    GetIdentifierCommand: require('./getIndentifier'),
    Mount: require('./mount'),
    ReadFile: require('./readFile'),
    With: require('./with'),
    _getByName: require('./Registry')
}