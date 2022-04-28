const { DB, DEFAULT_QUERY_OPTIONS } = require('../../fgt-dsu-wizard/constants');
const ShipmentManager = require("./ShipmentManager");
const {Shipment} = require('../../fgt-dsu-wizard/model');
const SORT_OPTIONS = {ASC: "asc", DSC: 'dsc'}
const {toPage} = require('../../pdm-dsu-toolkit/managers/Page');


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
        super(participantManager, "shipment", ['senderId', 'requesterId'], callback);
        this.participantManager = participantManager;
        this.stockManager = participantManager.stockManager;
    }


    /**
     * Creates a {@link Shipment} dsu
     * @param {string} orderId the id to the received order that generates the shipment
     * @param {Shipment} shipment
     * @param {function(err, KeySSI, dbPath)} callback where the dbPath follows a "tableName/shipmentId" template.
     * @override
     */
    create(orderId, shipment, callback) {
        super.create(undefined, shipment, callback);
    }

    /**
     * Lists all issued orders.
     * @param {boolean} [readDSU] defaults to true. decides if the manager loads and reads from the dsu's {@link INFO_PATH} or not
     * @param {object} [options] query options. defaults to {@link DEFAULT_QUERY_OPTIONS}
     * @param {function(err, Order[])} callback
     */
    getAll(readDSU, options, callback) {
        const defaultOptions = () => Object.assign({}, DEFAULT_QUERY_OPTIONS, {
            query: ["__timestamp > 0", `senderId == ${this.getIdentity().id}`]
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

        let self = this;
        self.getStorage().query(this._getTableName(), options.query, options.sort, options.limit, {senderId: this.getIdentity().id}, (err, records) => {
            if (err)
                return self._err(`Could not perform query`, err, callback);
            if (!readDSU)
                return callback(undefined, records.results.map(r => self.mapRecordToKey(r)))
            callback(undefined, records.results);
        });
    }

    getPage(itemsPerPage, page, dsuQuery, keyword, sort, readDSU, callback){
        let receivedPage = page || 1;
        sort = SORT_OPTIONS[(sort || SORT_OPTIONS.DSC).toUpperCase()] ? SORT_OPTIONS[(sort || SORT_OPTIONS.DSC).toUpperCase()] : SORT_OPTIONS.DSC;
        const self = this;
        this.getStorage().query(this._getTableName(), dsuQuery && dsuQuery.length ? dsuQuery : undefined, sort, DEFAULT_QUERY_OPTIONS.limit, Object.assign({
            itemsPerPage: itemsPerPage,
            page: receivedPage
        }, {senderId: this.getIdentity().id}), (err, records) => {
            if (err)
                return callback(err);
            callback(undefined, toPage(records.meta.page, records.meta.totalPages, readDSU ? records.results: records.results.map(r => self.mapRecordToKey(r)), itemsPerPage));
        });
    }

    /**
     * updates an Issued Shipment
     *
     * @param {string} [key] key is optional so child classes can override them
     * @param {Shipment} shipment
     * @param {function(err, Shipment?, Archive?)} callback
     */
    update(key, shipment, callback){
        super.update(key, shipment, callback);
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

module.exports = {
    getIssuedShipmentManager,
    IssuedShipmentManager
};
