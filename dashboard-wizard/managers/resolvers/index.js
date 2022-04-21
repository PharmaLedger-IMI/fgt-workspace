/**
 * Provides a bridge between the Managers Namespace and the resolving of const DSUs
 * @namespace Resolvers
 */
module.exports = {
    getProductResolver: require('./ProductResolver'),
    getBatchResolver: require('./BatchResolver')
}