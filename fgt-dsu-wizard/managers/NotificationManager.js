const {DB} = require('../constants');
const Manager = require("../../pdm-dsu-toolkit/managers/Manager");
const {Notification, Batch, Stock} = require('../model');
const getStockManager = require('./StockManager');

/**
 * Batch Manager Class
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
 * @class NotificationManager
 * @extends Manager
 * @memberOf Managers
 */
class NotificationManager extends Manager{
    constructor(participantManager, callback) {
        super(participantManager, DB.notifications, ['senderId', 'subject'], (err, manager) => {
            if (err)
                return callback ? callback(err) : console.log(err);
            manager.registerMessageListener((message, cb) => {
                manager.processMessageRecord(message, (err) => {
                    manager.refreshController();
                    cb(err);
                });
            });

            manager.stockManager = manager.stockManager || getStockManager(participantManager);

            if (callback)
                callback(undefined, manager);
        });
        this.stockManager = this.stockManager || getStockManager(participantManager);
    }

    /**
     * generates the db's key for the batch
     * @param {string} senderId
     * @param {string} subject
     * @return {string}
     * @private
     */
    _genCompostKey(senderId, subject){
        return `${senderId}-${subject}-${Date.now()}`;
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
     * @param {string} key
     * @param {Notification} item
     * @param {string|object} record
     * @return {object} the indexed object to be stored in the db
     * @protected
     * @override
     */
    _indexItem(key, item, record){
        return {
            senderId: item.senderId,
            subject: item.subject,
            body: item.body
        }
    };

    /**
     * Processes the received messages, saves them to the the table and deletes the message
     * @param {*} message
     * @param {function(err)} callback
     * @protected
     * @override
     */
    _processMessageRecord(message, callback) {
        let self = this;
        if (!message || typeof message !== object)
            return callback(`Invalid Message:  ${message} does not have a valid notification`);

        const notification = new Notification(message);
        const err = notification.validate()
        if (err)
            return callback(err);

        const key = self._genCompostKey(notification.senderId, notification.subject);
        self.insertRecord(key, self._indexItem(key, notification), (err, record) => {
            if (err)
                return callback(err);
            self._handleNotification(notification, (err) => {
                if (err)
                    console.log(`Could not process notification`, err);
                callback(undefined);
            })
        });
    };

    _handleBatch(body, callback){
        const {gtin, batch} = body;
        const err = batch.validate();
        if (err)
            return callback(err);

        const {batchNumber, status, expiry} = batch;

        const self = this;
        self.stockManager.getAll({
            query: [`gtin == ${gtin}`]
        }, (err, stock) => {
            if (err)
                return callback(err);
            const batch = stock.batches.find(b => b.batchNumber === batchNumber);
            if (!batch)
                return callback(`No stock of such batch... why were we notified of this??`);

            if (batch.expiry !== expiry){
                console.log(`Updating batch expiry to ${expiry}`);
                batch.expiry = expiry;
            }

            if (batch.status !== status){
                console.log(`Updating batch status to ${expiry}`);
                batch.status = status;
            }
            self.stockManager.update(gtin, stock, callback);
        });
    }

    _handleNotification(notification, callback){
        switch (notification.subject){
            case "batch":
                return this._handleBatch(notification.body, callback);
            default:
                return callback(`Cannot handle such notification - ${notification}`);
        }
    }

    /**
     * Creates a {@link Notification}
     * @param {Notification} notification
     * @param {function(err, keySSI, string)} callback first keySSI if for the batch, the second for its' product dsu
     * @override
     */
    create(notification, callback) {
        callback(`Notification cannot be created`);    }

    /**
     * reads the specific Notification
     *
     * @param {string} key
     * @param {boolean} [readDSU] defaults to true. decides if the manager loads and reads from the dsu or not
     * @param {function(err, Notification|KeySSI, Archive)} callback returns the batch if readDSU, the keySSI otherwise
     * @override
     */
    getOne(key, readDSU, callback){
        super.getOne(key, readDSU, callback);
    }

    /**
     * Removes a Notification from the list (does not delete/invalidate DSU, simply 'forgets' the reference)
     * @param {string|number} key
     * @param {function(err)} callback
     * @override
     */
    remove(key, callback) {
        super.remove(key, callback);
    }

    /**
     * updates a Batch from the list
     * @param {string|number} gtin
     * @param {Notification} newBatch
     * @param {function(err, Batch, Archive)} callback
     * @override
     */
    update(gtin, newBatch, callback){
        return callback(`Notification cannot be updated`);
    }

    /**
     * Converts the text typed in a general text box into the query for the db
     * Subclasses should override this
     * @param {string} keyword
     * @return {string[]} query
     * @protected
     * @override
     */
    _keywordToQuery(keyword){
        keyword = keyword || '.*';
        return [`gtin like /${keyword}/g`];
    }
}

/**
 * @param {BaseManager} participantManager
 * @param {function(err, Manager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @returns {NotificationManager}
 * @memberOf Managers
 */
const getNotificationManager = function (participantManager, callback) {
    let manager;
    try {
        manager = participantManager.getManager(NotificationManager);
        if (callback)
            return callback(undefined, manager);
    } catch (e){
        manager = new NotificationManager(participantManager, callback);
    }

    return manager;
}

module.exports = getNotificationManager;
