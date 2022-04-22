const Resolver  = require('../../../pdm-dsu-toolkit/managers').Resolver


class DashBoardResolver extends Resolver {
    /**
     * @param {BaseManager} baseManager
     * @constructor
     */
    constructor(baseManager){
        super(baseManager)
        baseManager.cacheManager(this);

    }

    /**
     * Resolves The keySSI and loads the DSI via the Service's get Method
     * @param {string} key the db primary key
     * @param {boolean} readDSU
     * @param {function(err, {})} callback
     */
    getOne(key, readDSU, callback){
        return callback()
        // const params = key.split('-');
        // const keySSI = this.service.generateKey(...params);
        // if (!readDSU)
        //     return callback(undefined, keySSI.getIdentifier());
        // this.service.get(keySSI, callback);
    }
}

module.exports = DashBoardResolver;