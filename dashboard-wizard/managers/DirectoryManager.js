const { DB, DEFAULT_QUERY_OPTIONS } = require('../constants');
const Manager = require("../../pdm-dsu-toolkit/managers/Manager");
const {DirectoryEntry, ROLE } = require('../model/DirectoryEntry');

/**
 * Stores references to some entities for quicker lookup on the front end (eg, products, suppliers, etc)
 *
 * @param {ParticipantManager} participantManager the top-level manager for this participant, which knows other managers.
 * @param {string} tableName the default table name for this manager eg: MessageManager will write to the messages table
 * @module managers
 * @class DirectoryManager
 * @extends Manager
 * @memberOf Managers
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
        super.create(key, entry, callback);
    }

    /**
     * Loads the Directory entry for the provided key
     * @param {string} key
     * @param {boolean} [readDSU] does nothing in this manager
     * @param {function(err, DirectoryEntry)} callback returns the Entry
     * @override
     */
    getOne(key, readDSU,  callback) {
        super.getOne(key, readDSU, callback);
    }

    /**
     * @protected
     * @override
     */
    _keywordToQuery(keyword) {
        keyword = keyword || '.*';
        return [[`role like /${keyword}/g`]];
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

        super.getAll(readDSU, options, callback);
    }

}

/**
 * @param {ParticipantManager} participantManager
 * @param {function(err, Manager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @returns {DirectoryManager}
 * @memberOf Managers
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