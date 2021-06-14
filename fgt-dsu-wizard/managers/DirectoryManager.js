const { DB } = require('../constants');
const Manager = require("../../pdm-dsu-toolkit/managers/Manager");
const {DirectoryEntry, ROLE } = require('../model/DirectoryEntry');

/**
 * Stores references to some entities for quicker lookup on the front end (eg, products, suppliers, etc)
 *
 * @param {ParticipantManager} participantManager the top-level manager for this participant, which knows other managers.
 * @param {string} tableName the default table name for this manager eg: MessageManager will write to the messages table
 * @module managers
 * @class DirectoryManager
 */
class DirectoryManager extends Manager {
    constructor(participantManager, callback) {
        super(participantManager, DB.directory, ['role', 'id'], callback);
    }

    _testRoles(role){
        return Object.values(ROLE).indexOf(role) !== -1;
    }

    saveEntry(role, id, callback){
        if (!this._testRoles(role))
            return callback(`invalid role provided`);
        const entry = new DirectoryEntry({
            id: id,
            role: role
        });
        return this.create(entry, callback)
    }

    /**
     * generates the db's key for the Directory entry
     * @param {string|number} role
     * @param {string|number} id
     * @return {string}
     * @protected
     */
    _genCompostKey(role, id){
        return `${role}-${id}`;
    }

    /**
     * Creates a {@link DirectoryEntry}
     * @param {string} key the readSSI to the order that generates the shipment
     * @param {string|number} [key] the table key
     * @param {DirectoryEntry} entry
     * @param {function(err, sReadSSI, dbPath)} callback where the dbPath follows a "tableName/shipmentId" template.
     * @override
     */
    create(key, entry, callback) {
        let self = this;
        if (!callback){
            callback = entry;
            entry = key;
            key = self._genCompostKey(entry.role, entry.id);
        }

        const matchEntries = function(fromDb){
            try{
                return entry.role === fromDb.role && entry.id === fromDb.id;
            } catch(e){
                return false;
            }
        }

        self.getOne(key, (err, existing) => {
            if (!err && !!existing){
                if (matchEntries(existing))
                    return console.log(`Entry already exists in directory. skipping`);
                else
                    return callback(`Provided directory entry does not match existing.`);
            }

            self.insertRecord(key, entry, (err) => {
                if (err)
                    return self._err(`Could not insert directory entry ${entry.id} on table ${self.tableName}`, err, callback);
                const path = `${self.tableName}/${key}`;
                console.log(`Directory entry for ${entry.id} as a ${entry.role} created stored at DB '${path}'`);
                callback(undefined, entry, path);
            });
        });
    }

    /**
     * Loads the Directory entry for the provided key
     * @param {string} key
     * @param {boolean} [readDSU] does nothing in this manager
     * @param {function(err, DirectoryEntry)} callback returns the Entry
     * @override
     */
    getOne(key, readDSU,  callback) {
        if (!callback){
            callback = readDSU;
            readDSU = true;
        }
        let self = this;
        self.getRecord(key, (err, entry) => {
            if (err)
                return self._err(`Could not load record with key ${key} on table ${self._getTableName()}`, err, callback);
            callback(undefined, entry);
        });
    }

    _keywordToQuery(keyword) {
        keyword = keyword || '.*';
        return [`role like /${keyword}/g`];
    }

    /**
     * Lists all registered items according to query options provided
     * @param {boolean} [readDSU] defaults to true. decides if the manager loads and reads from the dsu's {@link INFO_PATH} or not
     * @param {object} [options] query options. defaults to {@link DEFAULT_QUERY_OPTIONS}
     * @param {function(err, object[])} callback
     * @override
     */
    getAll(readDSU, options, callback){
        const defaultOptions = () => Object.assign({}, DEFAULT_QUERY_OPTIONS, {
            query: ['role like /.*/g']
        });

        if (!callback){
            if (!options){
                callback = readDSU;
                options = defaultOptions();
                readDSU = true;
            }
            if (typeof readDSU === 'boolean'){
                callback = options;
                options = defaultOptions();
            }
            if (typeof readDSU === 'object'){
                callback = options;
                options = readDSU;
                readDSU = true;
            }
        }

        options = options || defaultOptions();

        let self = this;
        self.query(options.query, options.sort, options.limit, (err, records) => {
            if (err)
                return self._err(`Could not perform query`, err, callback);
            if (!readDSU)
                return callback(undefined, records.map(r => r.id));
            callback(undefined, records);
        });
    }

}

/**
 * @param {ParticipantManager} [participantManager] only required the first time, if not forced
 * @param {function(err, Manager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @returns {DirectoryManager}
 */
const getDirectoryManager = function (participantManager, callback) {
    let manager;
    try {
        manager = participantManager.getManager(DirectoryManager);
        if (callback)
            return callback(undefined, manager);
    } catch (e){
        manager = new DirectoryManager(participantManager, callback);
    }

    return manager;
}

module.exports = getDirectoryManager;