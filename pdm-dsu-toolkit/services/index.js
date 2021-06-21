/**
 * Function responsible for handling DSU creation according to it's type, either via direct
 * access to the api, or vie the DSU Fabric
 * @typedef {function} Service
 * @namespace Services
 */
module.exports = {
    DSUService: require('./DSUService'),
    WebcLocaleService: require('./WebcLocaleService'),
    WebComponentService: require('./WebComponentService'),
    ParticipantService: require('./ParticipantService'),
    Strategy: require('./strategy'),
    Utils: require('./utils')
}