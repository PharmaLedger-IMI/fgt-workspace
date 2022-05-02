/**
 * Provides a bridge between the Managers Namespace and the resolving of const DSUs
 * @namespace Resolvers
 */

/**
 * Resolver classes substitute Managers when they're not available to be resolve a
 * Const DSU from its key in the DB and extract the updated Information when required
 *
 * Expects the injection of a service with the 2 following methods:
 *  - generateKey(...keyArgs): to generate the Array SSI:
 *  - get(KeySSI): that loads the DSU and loads the Object information
 *  @class Resolver
 *  @abstract
 *  @memberOf Resolvers
 */
class ApiResolver {
    storage;
    tableName;
    /**
     * @param {BaseManager} baseManager
     * @param {string} tableName service for the Const DSU
     * @constructor
     */
    constructor(baseManager, tableName){
        baseManager.cacheManager(this);
        this.storage = baseManager.getStorage();
        this.tableName = tableName;
    }

    /**
     * Resolves The keySSI and loads the DSI via the Service's get Method
     * @param {string} key the db primary key
     * @param {boolean} readDSU
     * @param {function(err, {})} callback
     */
    getOne(key, readDSU, callback){
        if (!callback){
            callback = readDSU;
            readDSU = true
        }
        const params = key.split('-');

        this.storage.getRecord(this.tableName, params, callback)
    }
}

module.exports = ApiResolver;

