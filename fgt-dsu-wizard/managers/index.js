/**
 * @module fgt-dsu-wizard.managers
 */

/**
 * Manager Classes in this context should do the bridge between the controllers
 * and the services exposing only the necessary api to the controllers while encapsulating <strong>all</strong> business logic.
 *
 * All Manager Classes should be singletons.
 *
 * This complete separation of concerts is very beneficial for 2 reasons:
 * <ul>
 *     <li>Allows for testing since there's no browser dependent code (i think) since the DSUStorage can be 'mocked'</li>
 *     <li>Allows for different controllers access different business logic when necessary (while benefiting from the singleton behaviour)</li>
 * </ul>
 */
module.exports = {
    Manager: require('../../pdm-dsu-toolkit/managers/Manager'),
    getOrderManager: require('./OrderManager'),
    getParticipantManager: require('./ParticipantManager'),
    getProductManager: require('./ProductManager'),
    getBatchManager: require('./BatchManager'),
    getStockManager: require('./StockManager'),
    getBaseManager: require('../../pdm-dsu-toolkit/managers/BaseManager')
}