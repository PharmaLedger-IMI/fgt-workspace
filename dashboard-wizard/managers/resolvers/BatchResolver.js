const ApiResolver  = require('./Resolver');
const Batch = require('../../../fgt-dsu-wizard/model/Batch')


/**
 * Resolver classes substitute Managers when they're not available to be resolve a
 * Const DSU and extract the updated Information when required
 * @class BatchResolver
 * @memberOf Resolvers
 * @extends Resolver
 */
class BatchResolver extends ApiResolver{
    constructor(participantManager){
        super(participantManager, "resolve");
    }

    getOne(gtinBatch, readDSU, callback){
        super.getOne(gtinBatch, readDSU, (err, batch) => {
            if (err)
                return callback(err);
            callback(undefined, new Batch(batch))
        })
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

