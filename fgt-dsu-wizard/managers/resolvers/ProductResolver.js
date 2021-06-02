const {ANCHORING_DOMAIN} = require('../../constants');
const Resolver  = require('../../../pdm-dsu-toolkit/managers').Resolver

/**
 * Resolver classes substitute Managers when they're not available to be resolve a
 * Const DSU and extract the updated Information when required
 */
class ProductResolver extends Resolver{
    constructor(){
        super(new (require('../../services/ProductService'))(ANCHORING_DOMAIN));
    }
}

let productResolver;
/**
 * @returns {ProductResolver} as a singleton
 */
const getProductResolver = function () {
    if (!productResolver)
        productResolver = new ProductResolver();
    return productResolver;
}

module.exports = getProductResolver;

