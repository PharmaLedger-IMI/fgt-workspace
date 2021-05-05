const {ANCHORING_DOMAIN} = require('../../constants');

/**
 * Resolver classes substitute Managers when they're not available to be resolve a
 * Const DSU and extract the updated Information when required
 */
class BatchResolver {
    constructor(){
        this.batchService = new (require('../../services/BatchService'))(ANCHORING_DOMAIN);
    }

    getOne(key, readDSU, callback){
        const params = key.split('-');
        const keySSI = this.batchService.generateKey(params[0], params[1]);
        if (!readDSU)
            return callback(undefined, keySSI.getIdentifier());
        this.batchService.get(keySSI, callback);
    }
}

let batchResolver;
/**
 * @returns {BatchResolver} as a singleton
 */
const getBatchResolver = function () {
    if (!batchResolver)
        batchResolver = new BatchResolver();
    return batchResolver;
}

module.exports = getBatchResolver;

