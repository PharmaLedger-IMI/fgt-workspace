/**
 * Function responsible for handling DSU creation according to it's type, either via direct
 * access to the api, or vie the DSU Fabric
 * @typedef {function} Service
 */

/**
 * @module services
 */
module.exports = {
    DSUService: require('./DSUService'),
    WebcLocaleService: require('./WebcLocaleService'),
    ParticipantService: require('./ParticipantService'),
    Strategy: require('./strategy')
}