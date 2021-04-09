const { INFO_PATH } = require('../constants');
/**
 * Manager Classes in this context should do the bridge between the controllers
 * and the services exposing only the necessary api to the controllers while encapsulating <strong>all</strong> business logic.
 *
 * All Manager Classes should be singletons.
 *
 * This complete separation of concerns is very beneficial for 2 reasons:
 * <ul>
 *     <li>Allows for testing since there's no browser dependent code (i think) since the DSUStorage can be 'mocked'</li>
 *     <li>Allows for different controllers access different business logic when necessary (while benefiting from the singleton behaviour)</li>
 * </ul>
 *
 * @param {BaseManager} baseManager the base manager to have access to the identity api
 * @param {string} tableName the default table name for this manager eg: MessageManager will write to the messages table
 * @module managers
 * @class Manager
 */
class Manager{
    constructor(baseManager, tableName){
        this.storage = baseManager.db;
        this.tableName = tableName;
        this.getIdentity = baseManager.getIdentity;
        this._getResolver = baseManager._getResolver;
        this._getKeySSISpace = baseManager._getKeySSISpace;
        this._loadDSU = baseManager._loadDSU;
        this._err = baseManager._err;
    }

    /**
     * @param {object} object the business model object
     * @param model the Controller's model object
     * @returns {{}}
     */
    toModel(object, model){
        model = model || {};
        for (let prop in object)
            if (object.hasOwnProperty(prop)){
                if (!model[prop])
                    model[prop] = {};
                model[prop].value = object[prop];
            }
        return model;
    }

    /**
     * Should translate the Controller Model into the Business Model
     * @param model the Controller's Model
     * @returns {object} the Business Model object ready to feed to the constructor
     */
    fromModel(model){
        let result = {};
        Object.keys(model).forEach(key => {
            if (model.hasOwnProperty(key) && model[key].value)
                result[key] = model[key].value;
        });
        return result
    }

    /**
     * will be binded as the one from participant manager on initialization
     * @param {function(err, identity)} callback
     */
    getIdentity(callback);

    /**
     * will be binded as the one from participant manager on initialization
     */
    _getResolver();

    /**
     * will be binded as the one from participant manager on initialization
     */
    _getKeySSISpace();

    /**
     * will be binded as the one from participant manager on initialization
     * @param {string|KeySSI} keySSI
     */
    _loadDSU(keySSI);
    /**
     * Wrapper around OpenDSU's error wrapper
     * @param {string} message
     * @param {err} err
     * @param {function(err, ..*)} callback
     * @protected
     * @see _err
     */
    _err(message, err, callback);

    /**
     * @return {string} the tableName passed in the constructor
     * @throws {Error} if the manager has no tableName
     * @protected
     */
    _getTableName(){
        if (!this.tableName)
            throw new Error('No table name specified');
        return this.tableName;
    }

    /**
     * Util function that loads a dsu and reads and JSON parses from the dsu's {@link INFO_PATH}
     * @param {string|KeySSI} keySSI
     * @param {function(err, object)} callback
     * @protected
     */
    _getDSUInfo(keySSI, callback){
        let self = this;
        self._loadDSU(keySSI, (err, dsu) => {
            if (err)
                return self._err(`Could not load record DSU: ${keySSI}`, err, callback);
            dsu.readFile(INFO_PATH, (err, data) => {
                if (err)
                    return self._err(`Could not read file at ${INFO_PATH}`, err, callback);
                try{
                    data = JSON.parse(data);
                } catch (e) {
                    return self._err(`Could not parse dsu data ${data.toString()}`, err, callback);
                }
                callback(undefined, data);
            });
        });
    }

    /**
     * Util iterator function
     * @param {string[]} records
     * @param {function(string, function(err, result))} getter
     * @param {result[]} [accumulator] defaults to []
     * @param {function(err, result[])} callback
     * @protected
     */
    _iterator(records, getter, accumulator, callback){
        if (!callback) {
            callback = accumulator;
            accumulator = [];
        }
        let self = this;
        const record = records.shift();
        if (!record) {
            console.log(`Found ${accumulator.length} items from records ${records}`);
            return callback(undefined, accumulator);
        }
        getter(record, (err, product) => {
            if (err)
                return self._err(`Could not get product`, err, callback);
            accumulator.push(product);
            iterator(records, getter, accumulator, callback);
        });
    }

    /**
     * Wrapper around the storage's insertRecord where the tableName defaults to the manager's
     * @param {string} [tableName] defaults to the manager's table name
     * @param {string} key
     * @param {*|string} record
     * @param {function(err)} callback
     */
    insertRecord(tableName, key, record, callback){
        if (!callback){
            callback = record;
            record = key;
            key = tableName;
            tableName = this._getTableName();
        }
        this.storage.insertRecord(tableName, key, record, callback);
    }

    /**
     * Wrapper around the storage's updateRecord where the tableName defaults to the manager's
     * @param {string} [tableName] defaults to the manager's table name
     * @param {string} key
     * @param {*|string} newRecord
     * @param {function(err)} callback
     */
    updateRecord(tableName, key, newRecord, callback){
        if (!callback){
            callback = newRecord;
            newRecord = key;
            key = tableName;
            tableName = this._getTableName();
        }
        this.storage.updateRecord(tableName, key, newRecord, callback);
    }

    /**
     * Wrapper around the storage's getRecord where the tableName defaults to the manager's
     * @param {string} [tableName] defaults to the manager's table name
     * @param {string} key
     * @param {function(err)} callback
     */
    getRecord(tableName, key, callback){
        if (!callback){
            callback = key;
            key = tableName;
            tableName = this._getTableName();
        }
        this.storage.getRecord(tableName, key, callback);
    }

    /**
     * Wrapper around the storage's deleteRecord where the tableName defaults to the manager's
     * @param {string} [tableName] defaults to the manager's table name
     * @param {string} key
     * @param {function(err)} callback
     */
    deleteRecord(tableName, key, callback){
        if (!callback){
            callback = key;
            key = tableName;
            tableName = this._getTableName();
        }
        this.storage.deleteRecord(tableName, key, callback);
    }

    /**
     * Wrapper around the storage's query where the tableName defaults to the manager's
     * @param {string} [tableName] defaults to the manager's table name
     * @param {function(record)} query
     * @param {string} sort
     * @param {number} limit
     * @param {function(err, record[])} callback
     */
    query(tableName, query, sort, limit, callback) {
        if (!callback){
            callback = limit;
            limit = sort;
            sort = query;
            query = tableName;
            tableName = this._getTableName();
        }
        this.storage.query(tableName, query, sort, limit, callback);
    }
}

module.exports = Manager;