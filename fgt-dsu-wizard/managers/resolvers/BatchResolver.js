const {ANCHORING_DOMAIN} = require('../../constants');
const Resolver  = require('../../../pdm-dsu-toolkit/managers').Resolver

/**
 * Resolver classes substitute Managers when they're not available to be resolve a
 * Const DSU and extract the updated Information when required
 */
class BatchResolver extends Resolver{
    constructor(){
        super(new (require('../../services/BatchService'))(ANCHORING_DOMAIN));
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

