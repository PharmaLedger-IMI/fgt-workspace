const { DB, DEFAULT_QUERY_OPTIONS } = require('../constants');
const ShipmentManager = require("./ShipmentManager");
const getReceivedOrderManager = require("./ReceivedOrderManager");
const {Shipment, Order, OrderStatus, ShipmentStatus, Wholesaler} = require('../model');


/**
 * Issued Shipment Manager Class - concrete ShipmentManager for issuedShipments.
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
 * @class IssuedShipmentManager
 * @extends Manager
 * @memberOf Managers
 */
class IssuedShipmentManager extends ShipmentManager {
    constructor(participantManager, callback) {
        super(participantManager, DB.issuedShipments, ['requesterId'], callback);
        this.participantManager = participantManager;
    }

    /**
     * Must wrap the DB entry in an object like:
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
     * @return {object} the indexed object to be stored in the db
     * @protected
     * @override
     */
    _indexItem(key, item, record) {
        if (!record){
            record = item;
            item = key;
            key = undefined;
        }
        return {...super._indexItem(key, item, record), requesterId: item.requesterId};
    }

    /**
     * Binds the {@link Shipment#shipmentId} to the shipment and fills in participant details;
     * @param {Shipment} shipment
     * @param {function(err, Shipment)} callback
     * @private
     */
    _bindParticipant(shipment, callback){
        shipment.shipmentId = shipment.shipmentId || (new Date()).toISOString();

        let self = this;
        self.getIdentity((err, wholesaler) => {
            if (err)
                return self._err(`Could not retrieve identity`, err, callback);
            wholesaler = new Wholesaler(wholesaler);
            shipment.senderId = wholesaler.id;
            shipment.shipFromAddress = wholesaler.originAddress || wholesaler.address;
            shipment.shipmentLines = shipment.shipmentLines.map(sl => {
                sl.senderId = wholesaler.id;
                sl.status = shipment.status;
                return sl;
            })
            callback(undefined, shipment);
        });
    }


    /**
     * Creates a {@link Shipment} dsu
     * @param {string} orderId the id to the received order that generates the shipment
     * @param {string|number} [shipmentId] the table key
     * @param {Shipment} shipment
     * @param {{}} stockInfo
     * @param {function(err, sReadSSI, dbPath)} callback where the dbPath follows a "tableName/shipmentId" template.
     * @override
     */
    create(orderId, shipment, stockInfo, callback) {
        let self = this;

        if (!callback){
            callback = stockInfo;
            stockInfo = undefined;
        }

        const createInner = function(chosenSerials, callback){
            if (!callback){
                callback = chosenSerials;
                chosenSerials = undefined
            }

            const receivedOrderManager = getReceivedOrderManager(self.participantManager);
                const receivedOrderKey = receivedOrderManager._genCompostKey(shipment.requesterId, orderId);

            receivedOrderManager.getOne(receivedOrderKey, (err, orderSSI) => {
                if (err)
                    return self._err(`Could not retrieve received order ${orderId}`, err, callback);
                self.shipmentService.create(shipment, orderSSI, (err, keySSI, shipmentLinesSSIs) => {
                    if (err)
                        return self._err(`Could not create product DSU for ${shipment}`, err, callback);
                    const record = keySSI.getIdentifier();
                    console.log("Shipment SSI=" + record);
                    self.insertRecord(self._genCompostKey(shipment.requesterId, shipment.shipmentId), self._indexItem(shipment, record), (err) => {
                        if (err)
                            return self._err(`Could not insert record with shipmentId ${shipment.shipmentId} on table ${self.tableName}`, err, callback);
                        const path = `${self.tableName}/${shipment.shipmentId}`;
                        console.log(`Shipment ${shipment.shipmentId} created stored at DB '${path}'`);
                        const aKey = keySSI.getIdentifier();
                        self.sendMessagesAsync(shipment, shipmentLinesSSIs, aKey);
                        callback(undefined, keySSI, path);
                    });
                });
            });
        }

        if (!stockInfo)
            return createInner(callback);

        self.stockManager.manageAll(stockInfo.map(s => s.stock.available.map(a => {
            a.quantity = - a.getQuantity();
            a.serialNumbers = [];
            return a;
        })), (err, serials)=> {
            if (err)
                return self._err(`Could not update Stock`, err, callback);
           createInner(serials, callback);
        });
    }

    sendMessagesAsync(shipment, shipmentLinesSSIs, aKey){
        const self = this;
        self.sendMessage(shipment.requesterId, DB.receivedShipments, aKey, (err) =>
            self._messageCallback(err ? `Could not sent message to ${shipment.shipmentId} with ${DB.receivedShipments}: ${err}` : err,
                `Message sent to ${shipment.requesterId}, ${DB.receivedShipments}, ${aKey}`));

        self.sendShipmentLinesToMAH([...shipment.shipmentLines], [...shipmentLinesSSIs], (err) =>
            self._messageCallback( err ? `Could not transmit shipmentLines to The manufacturers` : 'Lines Notice sent to Manufacturers'));
    }

    /**
     *
     * @param err
     * @param message
     * @protected
     * @override
     */
    _messageCallback(err, message) {
        super._messageCallback(err, message);
    }

    /**
     * Lists all issued orders.
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

        let self = this;
        super.getAll(readDSU, options, (err, result) => {
            if (err)
                return self._err(`Could not parse IssuedShipments ${JSON.stringify(result)}`, err, callback);
            console.log(`Parsed ${result.length} shipments`);
            callback(undefined, result);
        });
    }
}

/**
 * @param {ParticipantManager} participantManager
 * @param {function(err, Manager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @returns {IssuedShipmentManager}
 * @memberOf Managers
 */
const getIssuedShipmentManager = function (participantManager,  callback) {
    let manager;
    try {
        manager = participantManager.getManager(IssuedShipmentManager);
        if (callback)
            return callback(undefined, manager);
    } catch (e){
        manager = new IssuedShipmentManager(participantManager, callback);
    }

    return manager;
}

module.exports = getIssuedShipmentManager;
