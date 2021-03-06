const {ANCHORING_DOMAIN} = require('../../constants');
const Resolver  = require('../../../pdm-dsu-toolkit/managers').Resolver

/**
 * Resolver classes substitute Managers when they're not available to be resolve a
 * Const DSU and extract the updated Information when required
 * @memberOf Resolvers
 * @extends Resolver
 */
class ProductResolver extends Resolver{
    constructor(participantManager){
        super(participantManager, new (require('../../services/ProductService'))(ANCHORING_DOMAIN));
    }
}

/**
 * @returns {ProductResolver} as a singleton
 * @memberOf Resolvers
 */
const getProductResolver = function (participantManager, callback) {
    let resolver;
    try {
        resolver = participantManager.getManager(ProductResolver);
        if (callback)
            return callback(undefined, resolver);
    } catch (e){
        resolver = new ProductResolver(participantManager);
    }
    if (callback)
        return callback(undefined, resolver);

    return resolver;
}

module.exports = getProductResolver;

