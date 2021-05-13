const { ANCHORING_DOMAIN, DB } = require('../constants');
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
        super(participantManager, tableName, ['shipmentId', 'products', 'batches', ...indexes], callback);
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
            products: item.shipmentLines.map(ol => ol.gtin).join(','),
            batches: item.shipmentLines.map(ol => ol.batch).join(','),
            value: record
        }
    }

    /**
     * messages to all MAHs.
     * the shipment is the same for the orderlines and their ssis because of the way the code is written
     * @param shipmentLines
     * @param shipmentLinesSSI
     * @param callback
     * @return {*}
     */
    sendShipmentLinesToMAH(shipmentLines, shipmentLinesSSI, callback) {
        const self = this;
        if (shipmentLines.length !== shipmentLinesSSI.length)
            return callback(`Invalid arguments`);

        const orderLineIterator = function(linesCopy,  mahs, callback){
            if (!callback){
                callback = mahs;
                mahs = [];
            }

            const shipmentLine = linesCopy.shift();

            if (!shipmentLine){
                console.log(`All MAHs resolved`)
                return callback(undefined, mahs);
            }

            self.shipmentService.resolveMAH(shipmentLine, (err, mahId) => {
                if (err)
                    return self._err(`Could not resolve MAH for ${shipmentLine}`, err, callback);
                mahs.push(mahId);
                orderLineIterator(linesCopy, mahs, callback);
            });
        }

        orderLineIterator(shipmentLines.slice(), (err, resolvedMahs) => {
            if (err)
                return self._err(`Error resolving MAHs`, err, callback);

            const byMAH = resolvedMahs.reduce((accum, mah, i) => {
                (accum[mah] = accum[mah] || []).push(shipmentLinesSSI[i]);
                return accum;
            }, {});

            Object.keys(byMAH).forEach(mahId => {
                const ssis = byMAH[mahId].map(k => typeof k === 'string' ? k.getIdentifier() : k);
                const message = JSON.stringify(ssis);
                self.sendMessage(mahId, DB.shipmentLines, message, (err) =>
                    self._messageCallback(err ? `Could not send message to MAH ${mahId} for shipmentLines ${JSON.stringify(byMAH[mahId])} with ssis ${ssis} ${err}` : err,
                        `ShipmentLines ${JSON.stringify(ssis)} transmitted to MAH ${mahId}`));
            });

            callback();
        });
    }
}

module.exports = ShipmentManager;