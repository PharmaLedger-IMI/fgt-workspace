const { ANCHORING_DOMAIN } = require('../constants');
const Manager = require("../../pdm-dsu-toolkit/managers/Manager");
const Order = require('../model').Order;
const OrderLine = require('../model').OrderLine;
const OrderStatus = require('../model').OrderStatus;

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
 * @module managers
 * @class ShipmentManager
 * @abstract
 */
class ShipmentManager extends Manager {
    constructor(participantManager, tableName, indexes, callback) {
        super(participantManager, tableName, ['shipmentId', 'requesterId', 'products', 'batches', ...indexes], callback);
        this.shipmentService = new (require('../services').ShipmentService)(ANCHORING_DOMAIN);
    }

    /**
     * generates the db's key for the Shipment
     * @param {string|number} otherParticipantId
     * @param {string|number} shipmentId
     * @return {string}
     * @protected
     */
    _genCompostKey(otherParticipantId, shipmentId){
        return `${otherParticipantId}-${shipmentId}`;
    }

    /**
     * Must wrap the entry in an object like:
     * <pre>
     *     {
     *         index1: ...
     *         index2: ...
     *         value: item
     *     }
     * </pre>
     * so the DB can be queried by each of the indexes and still allow for lazy loading
     * @param {string} [key]
     * @param {Shipment} item
     * @param {string|object} record
     * @return {any} the indexed object to be stored in the db
     * @protected
     * @override
     */
    _indexItem(key, item, record) {
        if (!record){
            record = item;
            item = key;
            key = undefined;
        }
        return {
            shipmentId: item.shipmentId,
            products: item.orderLines.map(ol => ol.gtin).join(','),
            batches: item.orderLines.map(ol => ol.batch).join(','),
            value: record
        }
    }
}

module.exports = ShipmentManager;