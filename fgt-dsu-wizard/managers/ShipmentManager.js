const { ANCHORING_DOMAIN, DB } = require('../constants');
const Manager = require("../../pdm-dsu-toolkit/managers/Manager");

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
class ShipmentManager extends Manager {
    constructor(participantManager, tableName, indexes, callback) {
        super(participantManager, tableName, ['shipmentId', 'products', 'batches', 'status', ...indexes], callback);
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
     * Util function that loads a ShipmentDSU and reads its information
     * @param {string|KeySSI} keySSI
     * @param {function(err, Shipment, Archive)} callback
     * @protected
     * @override
     */
    _getDSUInfo(keySSI, callback){
        return this.shipmentService.get(keySSI, callback);
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
            status: item.status.status,
            products: item.shipmentLines.map(ol => ol.gtin).join(','),
            batches: item.shipmentLines.map(ol => ol.batch).join(','),
            value: record
        }
    }

    /**
     * reads ssi for that gtin in the db. loads is and reads the info at '/info'
     * @param {string} key
     * @param {boolean} [readDSU] defaults to true. decides if the manager loads and reads from the dsu or not
     * @param {function(err, object
     * |KeySSI, Archive)} callback returns the Product if readDSU and the dsu, the keySSI otherwise
     */
    getOne(key, readDSU,  callback) {
        if (!callback){
            callback = readDSU;
            readDSU = true;
        }
        let self = this;
        self.getRecord(key, (err, record) => {
            if (err)
                return self._err(`Could not load record with key ${key} on table ${self._getTableName()}`, err, callback);
            if (!readDSU)
                return callback(undefined, record.value || record);
            self.shipmentService.get(record.value || record, callback);
        });
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
                const ssis = byMAH[mahId].map(k => typeof k === 'string' ? k : k.getIdentifier());
                const message = JSON.stringify(ssis);
                self.sendMessage(mahId, DB.shipmentLines, message, (err) =>
                    self._messageCallback(err ? `Could not send message to MAH ${mahId} for shipmentLines ${JSON.stringify(byMAH[mahId])} with ssis ${ssis} ${err}` : err,
                        `ShipmentLines ${JSON.stringify(ssis)} transmitted to MAH ${mahId}`));
            });

            callback();
        });
    }

    /**
     * updates an item
     *
     * @param {string} [key] key is optional so child classes can override them
     * @param {Shipment} shipment
     * @param {function(err, Shipment?, Archive?)} callback
     */
    update(key, shipment, callback){
        if (!callback)
            return callback(`No key Provided...`);

        let self = this;
        self.getRecord(key, (err, record) => {
            if (err)
                return self._err(`Unable to retrieve record with key ${key} from table ${self._getTableName()}`, err, callback);
            self.shipmentService.update(record.value, shipment, (err, updatedShipment, dsu, orderId, linesSSis) => {
                if (err)
                    return self._err(`Could not Update Order DSU`, err, callback);
                self.updateRecord(key, self._indexItem(key, updatedShipment, record.value), (err) => {
                    if (err)
                        return self._err(`Unable to update record with key ${key} from table ${self._getTableName()}`, err, callback);
                    callback(undefined, updatedShipment, record.value, orderId, linesSSis);
                });
            });
        });
    }
}

module.exports = ShipmentManager;