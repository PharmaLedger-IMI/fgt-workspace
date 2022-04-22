const { DB, DEFAULT_QUERY_OPTIONS } = require('../../fgt-dsu-wizard/constants');
const ShipmentManager = require("./ShipmentManager");

/**
 * Received Shipment Manager Class - concrete ShipmentManager for received Shipments.
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
 * @class ReceivedShipmentManager
 * @extends ShipmentManager
 * @memberOf Managers
 */
class ReceivedShipmentManager extends ShipmentManager {
    constructor(participantManager, callback) {
        super(participantManager, "shipment", ['senderId', 'requesterId'], callback);
    }

    /**
     * Not necessary for this manager
     * @override
     */
    create(key, item, callback) {
        callback(`This manager does not have this functionality`);
    }

    /**
     * Lists all received orders.
     * @param {boolean} [readDSU] defaults to true. decides if the manager loads and reads from the dsu's {@link INFO_PATH} or not
     * @param {object} [options] query options. defaults to {@link DEFAULT_QUERY_OPTIONS}
     * @param {function(err, Order[])} callback
     */
    getAll(readDSU, options, callback) {
        const defaultOptions = () => Object.assign({}, DEFAULT_QUERY_OPTIONS);

        if (!callback) {
            if (!options) {
                callback = readDSU;
                options = defaultOptions();
                readDSU = true;
            }
            if (typeof readDSU === 'boolean') {
                callback = options;
                options = defaultOptions();
            }
            if (typeof readDSU === 'object') {
                callback = options;
                options = readDSU;
                readDSU = true;
            }
        }

        options = options || defaultOptions();

        super.getAll(readDSU, options, callback);
    }

    /**
     * updates an item
     *
     * @param {string} [key] key is optional so child classes can override them
     * @param {Shipment} shipment
     * @param {function(err, Shipment?, Archive?)} callback
     */
    update(key, shipment, callback){
        callback(`Functionality not available`);
    }
}


/**
 * @param {ParticipantManager} participantManager
 * @param {function(err, Manager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @returns {ReceivedShipmentManager}
 * @memberOf Managers
 */
const getReceivedShipmentManager = function (participantManager, callback) {
    let manager;
    try {
        manager = participantManager.getManager(ReceivedShipmentManager);
        if (callback)
            return callback(undefined, manager);
    } catch (e){
        manager = new ReceivedShipmentManager(participantManager, callback);
    }

    return manager;
}

module.exports = getReceivedShipmentManager;
