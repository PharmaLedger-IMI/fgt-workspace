const ApiResolver  = require('./Resolver');
const Product = require('../../../fgt-dsu-wizard/model/Product')

/**
 * Resolver classes substitute Managers when they're not available to be resolve a
 * Const DSU and extract the updated Information when required
 * @memberOf Resolvers
 * @extends Resolver
 */
class ProductResolver extends ApiResolver{
    constructor(participantManager){
        super(participantManager, "resolve");
    }

    getOne(gtin, readDSU, callback){
        if (!callback){
            callback = readDSU;
            readDSU = true
        }
        super.getOne(gtin, readDSU, (err, product) => {
            if (err)
                return callback(err);
            callback(undefined, new Product(product))
        })
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

