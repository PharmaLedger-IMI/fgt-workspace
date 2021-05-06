/**
 * Resolver classes substitute Managers when they're not available to be resolve a
 * Const DSU and extract the updated Information when required
 *
 * Expects the injection of a service with the 2 following methods:
 *  - generateKey(...keyArgs): to generate the Array SSI:
 *  - get(KeySSI): that loads the DSU and loads the Object information
 */
class Resolver {
    constructor(service){
        this.service = service;
    }

    getOne(key, readDSU, callback){
        const params = key.split('-');
        const keySSI = this.service.generateKey(...params);
        if (!readDSU)
            return callback(undefined, keySSI.getIdentifier());
        this.service.get(keySSI, callback);
    }
}

module.exports = Resolver;

