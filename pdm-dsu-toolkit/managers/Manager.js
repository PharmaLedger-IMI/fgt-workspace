const { INFO_PATH , DEFAULT_QUERY_OPTIONS } = require('../constants');

class Page {
    itemsPerPage = 10;
    currentPage = 1;
    totalPages = undefined;
    items = [];

    constructor(page) {
        if (typeof page !== undefined)
            for (let prop in page)
                if (page.hasOwnProperty(prop))
                    this[prop] = page[prop];
    }
}

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
 * @module managers
 * @class Manager
 * @abstract
 */
class Manager{
    constructor(baseManager, tableName, indexes, callback){
        let self = this;
        this.storage = baseManager.db;
        this.getStorage = () => {
            if (!self.storage)
                self.storage = baseManager.db;
            if (!self.storage)
                throw new Error(`DB is not initialized`);
            return self.storage;
        }
        this.tableName = tableName;
        this.indexes = indexes;
        this.getIdentity = baseManager.getIdentity.bind(baseManager);
        this._getResolver = baseManager._getResolver;
        this._getKeySSISpace = baseManager._getKeySSISpace;
        this._loadDSU = baseManager._loadDSU;
        this._err = baseManager._err;
        this._sendMessage = function(did, api, message, callback){
            if (!callback){
                callback = message;
                message = api;
                api = this.tableName;
            }
            return baseManager.sendMessage(did, api, message, callback);
        }
        this._registerMessageListener = function(listener){
            return baseManager.registerMessageListener(this.tableName, listener);
        }
        this._deleteMessage = function(message, callback){
            return baseManager.deleteMessage(message, callback);
        }
        this._getMessages = function(callback){
            return baseManager.getMessages(this.tableName, callback);
        }
        if (this.indexes && callback){
            this._indexTable(...this.indexes, (err) => {
                if (err)
                    return self._err(`Could not update Indexes`, err, callback);
                console.log(`Indexes for table ${self.tableName} updated`);
                callback(undefined, self);
            });
        }
    }

    /**
     * Should be called by child classes if then need to index the table.
     * (Can't be called during the constructor of the Manager class due to the need of virtual method
     * @param {string|function} props the last argument must be the callback. The properties passed
     * must match the ones provided in {@link Manager#_indexItem} for this to work properly.
     *
     * callback receives the newly created indexes as the second argument
     * @private
     */
    _indexTable(...props){
        if (!Array.isArray(props))
            throw new Error(`Invalid properties provided`);
        const callback = props.pop();
        props.push('__timestamp');
        const self = this;
        self.getStorage().getIndexedFields(self.tableName, (err, indexes) => {
            if (err)
                return self._err(`Could not retrieve indexes from table ${self.tableName}`, err, callback);
            const newIndexes = [];
            const indexIterator = function(propsClone, callback){
                const index = propsClone.shift();
                if (!index)
                    return callback(undefined, newIndexes);
                if (indexes.indexOf(index) !== -1)
                    return indexIterator(propsClone, callback);
                self.getStorage().addIndex(self.tableName, index, (err) => {
                    if (err)
                        return self._err(`Could not add index ${index} on table ${self.tableName}`, err, callback);
                    newIndexes.push(index);
                    indexIterator(propsClone, callback);
                });
            }

            indexIterator(props.slice(), (err, updatedIndexes) => err
                ? self._err(`Could not update indexes for table ${self.tableName}`, err, callback)
                : callback(undefined, updatedIndexes));
        });
    }

    /**
     * Send a message to the specified DID
     * @param {string|W3cDID} did
     * @param {string} [api] defaults to the tableName
     * @param {string} message
     * @param {function(err)} callback
     */
    sendMessage(did, api, message, callback){
        return this._sendMessage(did, api, message, callback);
    }

    /**
     * Send a message to the specified DID
     * @param {string|W3cDID} did
     * @param {string} [api] defaults to the tableName
     * @param {string} message
     * @param {function(err)} callback
     */
    _sendMessage(did, api, message, callback){}

    registerMessageListener(listener){
        return this._registerMessageListener(listener);
    }

    _registerMessageListener(listener){}


    /**
     * Proxy call to {@link MessageManager#deleteMessage()}.
     * 
     * jpsl: PS to Tiago - I don't agree with proxying calls
     * (without any explict reason). It would be better to get the messageManager
     * and call the method there directly.
     */
    deleteMessage(message, callback) {
        return this._deleteMessage(message, callback);
    }

    _deleteMessage(message, callback) {}

    /**
     * Proxy call to {@link MessageManager#getMessages()} using tableName as the api value.
     * 
     * jpsl: PS to Tiago - I don't agree with proxying calls
     * (without any explict reason). It would be better to get the messageManager
     * and call the method there directly.
     */
    getMessages(callback){
        return this._getMessages(callback);
    }

    _getMessages(callback){}

    /**
     * Stops the message service listener
     */
    shutdownMessenger(){
        this.messenger.shutdown();
    }

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
     * will be binded as the one from participant manager on initialization
     */
    _getResolver(){};

    /**
     * will be binded as the one from participant manager on initialization
     */
    _getKeySSISpace(){};

    /**
     * will be binded as the one from participant manager on initialization
     * @param {string|KeySSI} keySSI
     */
    _loadDSU(keySSI){};
    /**
     * Wrapper around OpenDSU's error wrapper
     * @param {string} message
     * @param {err} err
     * @param {function(err, ..*)} callback
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
     * Util function that loads a dsu and reads and JSON parses from the dsu's {@link INFO_PATH}
     * @param {string|KeySSI} keySSI
     * @param {function(err, object, Archive)} callback. object is the /info parsed as JSON.
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
                callback(undefined, data, dsu);
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
            return self._iterator(records, getter, accumulator, callback);
        });
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
        throw new Error (`Child classes must implement this`);
    }

    /**
     * Must wrap the entry in an object like:
     * <pre>
     *     {
     *         index1: ...
     *         index2: ...
     *         value: item
     *     }
     * </pre>
     * so the DB can be queried by each of the indexes and still allow for lazy loading
     * @param {string} key
     * @param {object|string} [item]
     * @param {string|object} record
     * @return {object} the indexed object to be stored in the db
     * @protected
     */
    _indexItem(key, item, record){
        if (!record){
            record = item;
            item = undefined
        }
        return {
            key: key,
            value: record
        }
    };

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
        self.getRecord(key, (err, itemSSI) => {
            if (err)
                return self._err(`Could not load record with key ${key} on table ${self._getTableName()}`, err, callback);
            if (!readDSU)
                return callback(undefined, itemSSI);
            self._getDSUInfo(itemSSI.value || itemSSI, callback);
        });
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
        if (!callback)
            return callback(`No key Provided...`);

        let self = this;
        self.getRecord(key, (err, record) => {
            if (err)
                return self._err(`Unable to retrieve record with key ${key} from table ${self._getTableName()}`, err, callback);
            self._getDSUInfo(record, (err, item, dsu) => {
                if (err)
                    return self._err(`Key: ${key}: unable to read From DSU from SSI ${record}`, err, callback);
                dsu.writeFile(INFO_PATH, JSON.stringify(newItem), (err) => {
                    if (err)
                        return self._err(`Could not update item ${key} with ${JSON.stringify(newItem)}`, err, callback);
                    console.log(`Item ${key} in table ${self._getTableName()} updated`);
                    callback(undefined, newItem, dsu)
                });
            });
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
            records = records.map(r => r.value);
            if (!readDSU)
                return callback(undefined, records);
            self._iterator(records.slice(), self._getDSUInfo.bind(self), (err, result) => {
                if (err)
                    return self._err(`Could not parse ${self._getTableName()}s ${JSON.stringify(records)}`, err, callback);
                console.log(`Parsed ${result.length} ${self._getTableName()}s`);
                callback(undefined, result);
            });
        });
    }

    /**
     * Converts the text typed in a general text box into the query for the db
     * Subclasses should override this
     * @param {string} keyword
     * @return {string[]} query
     * @protected
     */
    _keywordToQuery(keyword){
        keyword = keyword || '.*';
        return [`key like /${keyword}/g`];
    }

    /**
     * Returns a page object
     * @param {number} itemsPerPage
     * @param {number} page
     * @param {string} keyword
     * @param {string} sort
     * @param {boolean} readDSU
     * @param {function(err, Page)}callback
     */
    getPage(itemsPerPage, page, keyword, sort, readDSU, callback){
        const self = this;
        page = page || 1;

        const options = {
            query: keyword ? self._keywordToQuery(keyword) : ['__timestamp > 0'],
            sort: sort || "dsc",
            limit: undefined
        }

        const toPage = function(currentPage, totalPages, items){
            return new Page({
                itemsPerPage: itemsPerPage,
                currentPage: currentPage,
                totalPages: totalPages,
                items: items || []
            });
        }

        const paginate = function(items){
            const totalPages = Math.floor(items.length / itemsPerPage) + (items.length % itemsPerPage === 0 ? 0 : 1);
            let startIndex = (page - 1) * itemsPerPage;
            startIndex = startIndex === 0 ? startIndex : startIndex - 1;
            const endIndex = startIndex + itemsPerPage >= items.length ? undefined: startIndex + itemsPerPage;
            const sliced = items.slice(startIndex, endIndex);
            return toPage(page, totalPages, sliced);
        }

        self.getAll(readDSU, options, (err, records) => {
           if (err)
               return self._err(`Could not retrieve records to page`, err, callback);
            if (records.length === 0)
                return callback(undefined, toPage(0, 0, records));
           if (records.length <= itemsPerPage)
               return callback(undefined, toPage(1, 1, records));
           const page = paginate(records);
           callback(undefined, page);
        });
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
        this.getStorage().insertRecord(tableName, key, record, (err) => {
            if (err)
                return self._err(`Could not insert record with key ${key} in table ${tableName}`, err, callback);
            if (!self.indexes)
                return callback(undefined);
            self._indexTable(...self.indexes, (err, updated) => {
                if (err)
                    return self._err(`Could not update table ${tableName}'s indexes`, err, callback);
                if (updated)
                    updated.forEach(index => console.log(`Index ${index} created on table ${tableName}`));
                callback(undefined);
            });
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
        this.getStorage().updateRecord(tableName, key, newRecord, callback);
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

module.exports = Manager;