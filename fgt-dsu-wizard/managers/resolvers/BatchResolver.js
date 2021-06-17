const {ANCHORING_DOMAIN} = require('../../constants');
const Resolver  = require('../../../pdm-dsu-toolkit/managers').Resolver

/**
 * Resolver classes substitute Managers when they're not available to be resolve a
 * Const DSU and extract the updated Information when required
 * @class BatchResolver
 * @memberOf Resolvers
 * @extends Resolver
 */
class BatchResolver extends Resolver{
    constructor(participantManager){
        super(participantManager, new (require('../../services/BatchService'))(ANCHORING_DOMAIN));
    }
}

/**
 * @returns {BatchResolver} the batch resolver as a singleton
 * @memberOf Resolvers
 */
const getBatchResolver = function (participantManager, callback) {
    let resolver;
    try {
        resolver = participantManager.getManager(BatchResolver);
        if (callback)
            return callback(undefined, resolver);
    } catch (e){
        resolver = new BatchResolver(participantManager);
    }
    if (callback)
        return callback(undefined, resolver);

    return resolver;
}

module.exports = getBatchResolver;

