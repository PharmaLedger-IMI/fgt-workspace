const {ANCHORING_DOMAIN} = require('../../constants');

/**
 * Resolver classes substitute Managers when they're not available to be resolve a
 * Const DSU and extract the updated Information when required
 */
class BatchResolver {
    constructor(){
        this.keyGen = require('../../commands/setBatchSSI').createBatchSSI;
    }

    getOne(key, readDSU, callback){
        const params = key.split('-');
        const batchService = new (require('../../services/BatchService'))(ANCHORING_DOMAIN);
        const keySSI = batchService.generateKey(params[0], params[1]);
        if (!readDSU)
            return callback(undefined, keySSI.getIdentifier());
        batchService.get(keySSI, callback);
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

