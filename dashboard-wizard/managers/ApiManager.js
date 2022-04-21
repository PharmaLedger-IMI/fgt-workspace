const { INFO_PATH , DEFAULT_QUERY_OPTIONS } = require('../constants');

const {functionCallIterator} = require('../services/utils');

const {Page} = require('./Page');

const SORT_OPTIONS = {ASC: "asc", DSC: 'dsc'}

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
 * #### _Manager SPECIFIC DataBase Access API (CRUD)_
 *
 * Methods:
 *  - {@link create} - Must be overwritten by child classes
 *  - {@link getOne}
 *  - {@link remove}
 *  - {@link update} - Should be overwritten by child classes
 *  - {@link getAll} - with querying capabilities via {@link DEFAULT_QUERY_OPTIONS} type configuration
 *  - {@link getPage} - paging and querying capabilities
 *
 * <strong>Assumes only reads/writes to {@link INFO_PATH} with JSON parsing to object</strong>
 * Otherwise the methods need to be overwritten by child classes.
 *
 * #### _Manager INDEPENDENT DataBase Access API_
 *
 * Methods:
 *  - {@link insertRecord}
 *  - {@link getRecord}
 *  - {@link deleteRecord}
 *  - {@link updateRecord}
 *  - {@link query} - with querying capabilities via {@link DEFAULT_QUERY_OPTIONS} type configuration
 *
 * @param {BaseManager} baseManager the base manager to have access to the identity api
 * @param {string} tableName the default table name for this manager eg: MessageManager will write to the messages table
 * @param {string[]} [indexes] a list of indexes to add to the table in the db upon initialization. requires a callback!
 * @param {function(err, Manager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * Not used in this class. Child classes must implement if this functionality is required like:
 * <pre>
 *              if (this.indexes && callback){
 *                  super._indexTable(...this.indexes, (err) => {
 *                      if (err)
 *                          return self._err(`Could not update Indexes`, err, callback);
 *                      console.log(`Indexes for table ${self.tableName} updated`);
 *                      callback(undefined, self);
 *                  });
 *              }
 * </pre>
 * @memberOf Managers
 * @class Manager
 * @abstract
 */
class ApiManager{
    /**
     * @param {ApiBaseManager} baseManager
     * @param {string} tableName the name of the table this manager handles
     * @param {string[]} indexes the indexes to be added to the table
     * @param {function(err, Manager)} [callback] optional callback for better application flow control
     * @constructor
     */
    constructor(baseManager, tableName, indexes, callback){
        let self = this;
        this.tableName = tableName;
        this.indexes = indexes;
        this.controllers = undefined;
        this.getIdentity = baseManager.getIdentity.bind(baseManager);
        this.getEnvironment = baseManager.getEnvironment.bind(baseManager);
        this.getStorage = baseManager.getStorage.bind(baseManager);

        this._err = baseManager._err;

        baseManager.cacheManager(this);

        this._getManager = baseManager.getManager.bind(baseManager);

       if (callback)
            callback(undefined, self);

    }

    /**
     * Util method to give optional access to the controller for event sending purposes
     * and UI operations when required eg: refresh the view.
     *
     * Accepts multiple calls (with keep the reference to all controllers)
     * @param {LocalizedController} controller
     */
    bindController(controller){
        this.controllers = this.controllers || [];
        this.controllers.push(controller);
    }

    /**
     * Util method to give optional access to the controller to be able to refresh the view
     * (will call the refresh method on all binded controllers via {@link Manager#bindController})
     * @param {{}} [props] option props to pass to the controllers refresh method
     */
    refreshController(props){
        if (this.controllers)
            this.controllers.forEach(c => c.refresh(props));
    }

    getEnvironment(callback){};

    /**
     * Lazy loads the db
     * Is created in the constructor
     */
    getStorage(){};

    /**
     * @param {object} object the business model object
     * @param model the Controller's model object
     * @returns {{}}
     */
    toModel(object, model){
        model = model || {};
        for (let prop in object) {
            prop = typeof prop === 'number' ? '' + prop : prop;
            if (object.hasOwnProperty(prop)) {
                if (!model[prop])
                    model[prop] = {};
                model[prop].value = object[prop];
            }
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
    getIdentity(callback){};

    /**
     * Wrapper around OpenDSU's error wrapper
     * @param {string} message
     * @param {err} err
     * @param {function(err, ...args)} callback
     * @protected
     * @see _err
     */
    _err(message, err, callback){};

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
     * Creates a new item
     *
     * Child classes should override this so they can be called without the key param in Web Components
     * (and also to actually create the DSUs)
     *
     * @param {string} [key] key is optional so child classes can override them
     * @param {object} item
     * @param {function(err, object, Archive)} callback
     */
    create(key, item, callback) {
        this.getStorage().insertRecord(this.tableName, item, callback);
    }

    /**
     * Creates several new items
     *
     * @param {string[]} keys key is optional so child classes can override them
     * @param {object[]} items
     * @param {function(err, object[]?, Archive[]?)} callback
     */
    createAll(keys, items, callback){
        let self = this;

        functionCallIterator(this.create.bind(this), keys, items, (err, results) => {
            if (err)
                return self._err(`Could not update all records`, err, callback);
            callback(undefined, ...results);
        });
    }


    mapRecordToKey(record){
        return record.key;
    }

    /**
     * reads ssi for that gtin in the db. loads is and reads the info at '/info'
     * @param {string} key
     * @param {boolean} [readDSU] defaults to true. decides if the manager loads and reads from the dsu or not
     * @param {function(err, object|KeySSI, Archive)} callback returns the Product if readDSU and the dsu, the keySSI otherwise
     */
    getOne(key, readDSU,  callback) {
        if (!callback){
            callback = readDSU;
            readDSU = true;
        }
        let self = this;
        self.getRecord(key, (err, record) => {
            if (err)
                return self._err(`Could not load record with key ${key} on table ${self._getTableName()}`, err, callback);
            if (!readDSU)
                return this.mapRecordToKey(record);
            callback(undefined, record);
        });
    }

    /**
     * reads ssi for that gtin in the db. loads is and reads the info at '/info'
     * @param {string} key
     * @param {function(err, object
     * |KeySSI, Archive?)} callback returns the Product if readDSU and the dsu, the keySSI otherwise
     */
    getOneStripped(key,  callback) {
        return this.getOne(key, true, callback);
    }

    /**
     * Removes a product from the list (does not delete/invalidate DSU, simply 'forgets' the reference)
     * @param {string|number} key
     * @param {function(err)} callback
     */
    remove(key, callback) {
        let self = this;
        self.deleteRecord(key, callback);
    }

    /**
     * updates an item
     *
     * @param {string} [key] key is optional so child classes can override them
     * @param {object} newItem
     * @param {function(err, object, Archive)} callback
     */
    update(key, newItem, callback){
        if (!callback){
            callback = newItem;
            newItem = key;
            key = undefined;
            return callback(`No key Provided...`);
        }
        callback('Child classes must implement this');
    }

    /**
     * updates a bunch of items
     *
     * @param {string[]} [keys] key is optional so child classes can override them
     * @param {object[]} newItems
     * @param {function(err, object[], Archive[])} callback
     */
    updateAll(keys, newItems, callback){
        if (!callback){
            callback = newItems;
            newItems = keys;
            keys = undefined;
            return callback(`No key Provided...`);
        }

        let self = this;

        functionCallIterator(this.update.bind(this), keys, newItems, (err, results) => {
            if (err)
               return self._err(`Could not update all records`, err, callback);

            callback(undefined, ...results);
        });
    }

    /**
     * Lists all registered items according to query options provided
     * @param {boolean} [readDSU] defaults to true. decides if the manager loads and reads from the dsu's {@link INFO_PATH} or not
     * @param {object} [options] query options. defaults to {@link DEFAULT_QUERY_OPTIONS}
     * @param {function(err, object[])} callback
     */
    getAll(readDSU, options, callback) {
        if (!callback){
            if (!options){
                callback = readDSU;
                options = DEFAULT_QUERY_OPTIONS;
                readDSU = true;
            }
            if (typeof readDSU === 'boolean'){
                callback = options;
                options = DEFAULT_QUERY_OPTIONS;
            }
            if (typeof readDSU === 'object'){
                callback = options;
                options = readDSU;
                readDSU = true;
            }
        }

        options = options || DEFAULT_QUERY_OPTIONS;

        let self = this;
        self.query(options.query, options.sort, options.limit, (err, records) => {
            if (err)
                return self._err(`Could not perform query`, err, callback);
            callback(undefined, records);
        });
    }

    /**
     * Converts the text typed in a general text box into the query for the db
     * Subclasses should override this
     * @param {string} keyword
     * @param queryConditions
     * @return {string[]} query
     * @protected
     */
    _keywordToQuery(keyword, queryConditions){
        if (!keyword)
            return [[...queryConditions, '__timestamp > 0']]
        return this.indexes.map((index) => {
            return [...queryConditions, `${index} like /${keyword}/g`, '__timestamp > 0']
        })
    }

    /**
     * Returns a page object from provided dsuQuery or a keyword
     * @param {number} itemsPerPage
     * @param {number} page
     * @param {string[]} dsuQuery: force a fixed CONDITION in all keyword query or for a simple query paginated.
     * @param {string} keyword:  keyword to search on all indexes
     * @param {string} sort
     * @param {boolean} readDSU
     * @param {function(err, Page)}callback
     */
    getPage(itemsPerPage, page, dsuQuery, keyword, sort, readDSU, callback){
        console.log("IMPLEMENT GET PAGE")
        callback(undefined, new Page())
    }

    /**
     * Wrapper around the storage's insertRecord where the tableName defaults to the manager's
     * @param {string} [tableName] defaults to the manager's table name
     * @param {string} key
     * @param {object} record
     * @param {function(err)} callback
     */
    insertRecord(tableName, key, record, callback){
        if (!callback){
            callback = record;
            record = key;
            key = tableName;
            tableName = this._getTableName();
        }
        const self = this;
        console.log("insertRecord tableName="+tableName, "key", key, "record", record);


        this.getStorage().insertRecord(tableName, key, record, (err, ...results) => {
            if (err)
               return self._err(`Could not insert record with key ${key} in table ${tableName}`, err, callback);
            callback(undefined, ...results);
        });
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

        console.log("update Record tableName="+tableName, "key", key, "record", newRecord);
        const self = this;

        this.getStorage().updateRecord(tableName, key, newRecord, (err, ...results) => {
            if (err)
               return self._err(`Could not update record with key ${key} in table ${tableName}`, err, callback);
            callback(undefined, ...results);
        });
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
        this.getStorage().getRecord(tableName, key, callback);
    }

    /**
     * Wrapper around the storage's deleteRecord where the tableName defaults to the manager's
     * @param {string} [tableName] defaults to the manager's table name
     * @param {string} key
     * @param {function(err, record)} callback
     */
    deleteRecord(tableName, key, callback) {
        if (!callback) {
            callback = key;
            key = tableName;
            tableName = this._getTableName();
        }
        this.getStorage().deleteRecord(tableName, key, (err, oldRecord) => {
            console.log("Deleted key", key, "old record", err, oldRecord);
            callback(err, oldRecord);
        });
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
        console.log("query tableName="+tableName+" query=\""+query+"\" sort="+sort+" limit="+limit);
        this.getStorage().query(tableName, query, sort, limit, callback);
    }
}

module.exports = ApiManager;