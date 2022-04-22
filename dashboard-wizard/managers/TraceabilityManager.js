const {INFO_PATH, DB, DEFAULT_QUERY_OPTIONS} = require('../../fgt-dsu-wizard/constants');
const ApiManager = require("./ApiManager");

const IndividualProduct = require('../../fgt-dsu-wizard/model/IndividualProduct');

const ACTION = {
    REQUEST: 'request',
    RESPONSE: 'response'
}


/**
 * Stock Manager Class
 *
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
 *
 * @param {ParticipantManager} participantManager
 * @param {function(err, Manager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @class TraceabilityManager
 * @extends Manager
 * @memberOf Managers
 */
class TraceabilityManager extends ApiManager{
    constructor(participantManager, callback) {
        super(participantManager, DB.traceability, [], callback);
    }

    /**
     * @param {string} key
     * @param {*} obj
     * @param {function(err?, keySSI?, string?)} callback where the string is the mount path relative to the main DSU
     */
    create(key, obj, callback) {
        callback(`Traceability cannot be created`);
    }

    /**
     * @param {string|number} [key] the table key
     * @param {{}} obj
     * @param {function(err?, Stock?)} callback
     * @override
     */
    update(key, obj, callback){
        callback(`Traceability cannot be updated`);
    }

    /**
     * @param {IndividualProduct} obj
     * @param {function(err?, Node?, Node?)} callback
     * @override
     */
    getOne(obj,  callback) {
        super.create(undefined, obj, callback)
    }

    /**
     * Lists all registered items according to query options provided
     * @param {boolean} [readDSU] defaults to true. decides if the manager loads and reads from the dsu's {@link INFO_PATH} or not
     * @param {object} [options] query options. defaults to {@link DEFAULT_QUERY_OPTIONS}
     * @param {function(err?, object[]?)} callback
     * @override
     */
    getAll(readDSU, options, callback){
        callback(`Not the way tracking works`);
    }
}


/**
 * @param {ParticipantManager} participantManager
 * @param {function(err, Manager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @returns {TraceabilityManager}
 * @memberOf Managers
 */
const getTraceabilityManager = function (participantManager, callback) {
    let manager;
    try {
        manager = participantManager.getManager(TraceabilityManager);
        if (callback)
            return callback(undefined, manager);
    } catch (e){
        manager = new TraceabilityManager(participantManager, callback);
    }

    return manager;
}

module.exports = getTraceabilityManager;