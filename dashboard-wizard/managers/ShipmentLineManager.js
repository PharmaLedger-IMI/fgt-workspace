const { DB, DEFAULT_QUERY_OPTIONS} = require('../../fgt-dsu-wizard/constants');
const ApiManager = require("./ApiManager");
/**
 * ShipmentLine Manager Class
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
 * @class ShipmentLineManager
 * @extends Manager
 * @memberOf Managers
 */
class ShipmentLineManager extends ApiManager {
    constructor(participantManager, callback) {
        super(participantManager, DB.shipmentLines, ['gtin', 'createdOn', 'batch', 'status', 'requesterId', 'senderId'], callback)
    }

    /**
     * reads ssi for that OrderLine in the db. loads is and reads the info at '/info' and the status at '/status/info
     * @param {string} key
     * @param {boolean} [readDSU] defaults to true. decides if the manager loads and reads from the dsu or not
     * @param {function(err, object|KeySSI, Archive)} callback returns the Product if readDSU and the dsu, the keySSI otherwise
     */
    getOne(key, readDSU,  callback) {
        super.getOne(key, readDSU, callback);
    }

    /**
     * Lists all received orders.
     * @param {boolean} [readDSU] defaults to true. decides if the manager loads and reads from the dsu's {@link INFO_PATH} or not
     * @param {object} [options] query options. defaults to {@link DEFAULT_QUERY_OPTIONS}
     * @param {function(err, Order[])} callback
     */
    getAll(readDSU, options, callback) {
        const defaultOptions = () => Object.assign({}, DEFAULT_QUERY_OPTIONS, {
            query: ['date > 0'],
            sort: 'dsc'
        });

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

        super.getAll(readDSU, options, callback)
    }

    /**
     * updates a shipmentLine
     *
     * @param {string} [key] key is optional so child classes can override them
     * @param {ShipmentLine} shipmentLine
     * @param {function(err, Shipment?, Archive?)} callback
     */
    update(key, shipmentLine, callback){
        if (!callback){
            callback = shipmentLine;
            shipmentLine = key;
            key = this._genCompostKey(shipmentLine.requesterId, shipmentLine.senderId, shipmentLine.gtin, shipmentLine.createdOn);
        }

        super.update(key, shipmentLine, callback);
    }
}

/**
 * @param {ParticipantManager} participantManager
 * @param {function(err, Manager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @returns {ShipmentLineManager}
 * @memberOf Managers
 */
const getShipmentLineManager = function (participantManager,  callback) {
    let manager;
    try {
        manager = participantManager.getManager(ShipmentLineManager);
        if (callback)
            return callback(undefined, manager);
    } catch (e){
        manager = new ShipmentLineManager(participantManager, callback);
    }

    return manager;
}

module.exports = getShipmentLineManager;
