const DashboardResolver  = require('./DashboardResolver')


/**
 * Resolver classes substitute Managers when they're not available to be resolve a
 * Const DSU and extract the updated Information when required
 * @memberOf Resolvers
 * @extends Resolver
 */
class ProductResolver extends DashboardResolver{
    constructor(participantManager){
        super(participantManager);
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

