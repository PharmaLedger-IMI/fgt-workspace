const {DB, DEFAULT_QUERY_OPTIONS} = require('../../fgt-dsu-wizard/constants');
const ApiManager = require("./ApiManager");
const {Notification, Batch} = require('../../fgt-dsu-wizard/model');

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
class NotificationManager extends ApiManager{
    constructor(participantManager, callback) {
        super(participantManager, DB.notifications, ['senderId', 'subject'], callback);
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
     * Lists all registered items according to query options provided
     * @param {boolean} [readDSU] defaults to true. decides if the manager loads and reads from the dsu's {@link INFO_PATH} or not
     * @param {object} [options] query options. defaults to {@link DEFAULT_QUERY_OPTIONS}
     * @param {function(err, object[])} callback
     * @override
     */
     getAll(readDSU, options, callback){
        const defaultOptions = () => Object.assign({}, DEFAULT_QUERY_OPTIONS, {
            query: ['__timestamp > 0']
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

        super.getAll(readDSU, options, callback);
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
