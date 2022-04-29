const {INFO_PATH, DB, DEFAULT_QUERY_OPTIONS} = require('../../fgt-dsu-wizard/constants');
const ApiManager = require("./ApiManager");
const Sale = require('../../fgt-dsu-wizard/model/Sale');

const getReceiptManager = require('./ReceiptManager');


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
 * @class SaleManager
 * @extends Manager
 * @memberOf Managers
 */
class SaleManager extends ApiManager{
    constructor(participantManager, callback) {
        super(participantManager, "sale", ['id', 'products', 'sellerId'], (err, manager) => {
            if (err)
                return callback ? callback(err) : console.log(err);
            getReceiptManager(participantManager, (err, receiptManager) => {
                if (err)
                    console.log(`Could not get IssuedOrderManager:`, err);
                else
                    manager.receiptManager = receiptManager;

                if (callback)
                    callback(undefined, manager);
            })
        });
        this.stockManager = participantManager.stockManager;
        this.receiptManager = this.receiptManager || undefined;
    }

    /**
     * Creates a {@link Sale} entry
     * @param {Sale} sale
     * @param {function(err, keySSI?, string?)} callback where the string is the mount path relative to the main DSU
     */
    create(sale, callback) {
        super.create(undefined, sale, callback)
    }


    mapRecordToKey(record) {
        return record.id;
    }

    /**
     * updates a product from the list
     * @param {string|number} [id] the table key
     * @param {Sale} newSale
     * @param {function(err, Sale?)} callback
     * @override
     */
    update(id, newSale, callback){
        return callback(`All sales are final`);
    }

    /**
     * reads ssi for that gtin in the db. loads is and reads the info at '/info'
     * @param {string} id
     * @param {boolean} [readDSU] defaults to true. decides if the manager loads and reads from the dsu or not
     * @param {function(err, Stock|KeySSI, Archive)} callback returns the Product if readDSU and the dsu, the keySSI otherwise
     * @override
     */
    getOne(id, readDSU,  callback) {
        super.getOne(id, readDSU, callback);
    }

    /**
     * Lists all registered items according to query options provided
     * @param {boolean} [readDSU] defaults to true. decides if the manager loads and reads from the dsu's {@link INFO_PATH} or not
     * @param {object} [options] query options. defaults to {@link DEFAULT_QUERY_OPTIONS}
     * @param {function(err, object[])} callback
     * @override
     */
    getAll(readDSU, options, callback){
        const defaultOptions = () => Object.assign({}, DEFAULT_QUERY_OPTIONS, {
            query: [
                "__timestamp > 0",
                'id like /.*/g'
            ],
            sort: "dsc"
        });

        if (!callback){
            if (!options){
                callback = readDSU;
                options = defaultOptions();
                readDSU = true;
            }
            if (typeof readDSU === 'boolean'){
                callback = options;
                options = defaultOptions();
            }
            if (typeof readDSU === 'object'){
                callback = options;
                options = readDSU;
                readDSU = true;
            }
        }

        options = options || defaultOptions();

        let self = this;
        super.getAll(readDSU, options, callback)
    }

}

/**
 * @param {ParticipantManager} participantManager
 * @param {function(err, Manager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @returns {SaleManager}
 * @memberOf Managers
 */
const getSaleManager = function (participantManager, callback) {
    let manager;
    try {
        manager = participantManager.getManager(SaleManager);
        if (callback)
            return callback(undefined, manager);
    } catch (e){
        manager = new SaleManager(participantManager, callback);
    }

    return manager;
}

module.exports = getSaleManager;