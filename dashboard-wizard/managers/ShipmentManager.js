const ApiManager = require("./ApiManager");

/**
 * Shipment Manager Class
 *
 * Abstract class.
 * Use only concrete subclasses {@link IssuedShipmentManager} or {@link ReceivedShipmentManager}.
 *
 * @param {ParticipantManager} participantManager the top-level manager for this participant, which knows other managers.
 * @param {string} tableName the default table name for this manager eg: MessageManager will write to the messages table
 * @param {string[]} indexes the indexes to be applied to the table in the db. cannot be undefined
 * @param {function(err, Manager)} callback
 * @memberOf Managers
 * @class ShipmentManager
 * @extends Manager
 * @abstract
 */
class ShipmentManager extends ApiManager {
    constructor(participantManager, tableName, indexes, callback) {
        super(participantManager, tableName, ['shipmentId', 'products', 'batches', 'status', ...indexes], callback);
    }

    mapRecordToKey(record) {
        return record.shipmentId;
    }

    /**
     * reads ssi for that gtin in the db. loads is and reads the info at '/info'
     * @param {string} key
     * @param {boolean} [readDSU] defaults to true. decides if the manager loads and reads from the dsu or not
     * @param {function(err, object
     * |KeySSI, Archive)} callback returns the Product if readDSU and the dsu, the keySSI otherwise
     */
    getOne(key, readDSU,  callback) {
        super.getOne(key, readDSU, callback);
    }

    /**
     * updates an item
     *
     * @param {string} [key] key is optional so child classes can override them
     * @param {Shipment} shipment
     * @param {function(err, Shipment?, Archive?)} callback
     */
    update(key, shipment, callback){
        if (!callback){
            callback = shipment;
            shipment = key;
        }
        const status = shipment.status.status
        const request = {
            status: status,
            extraInfo: shipment.status.extraInfo
        }
        this.getStorage().updateRecord(this._getTableName(), [shipment.shipmentId], request, callback)
    }
}

module.exports = ShipmentManager;