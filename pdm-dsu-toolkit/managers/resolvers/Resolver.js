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
class Resolver {
    /**
     * @param {BaseManager} baseManager
     * @param {function} service service for the Const DSU
     * @constructor
     */
    constructor(baseManager, service){
        this.service = service;
        baseManager.cacheManager(this);
    }

    /**
     * Resolves The keySSI and loads the DSI via the Service's get Method
     * @param {string} key the db primary key
     * @param {boolean} readDSU
     * @param {function(err, {})} callback
     */
    getOne(key, readDSU, callback){
        const params = key.split('-');
        const keySSI = this.service.generateKey(...params);
        if (!readDSU)
            return callback(undefined, keySSI.getIdentifier());
        this.service.get(keySSI, callback);
    }
}

module.exports = Resolver;

