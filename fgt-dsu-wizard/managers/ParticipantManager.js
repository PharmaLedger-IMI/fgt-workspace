const BaseManager = require('../../pdm-dsu-toolkit/managers/BaseManager');

/**
 * Participant Manager Class - Extension of Base Manager
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
 * @param {DSUStorage} DSUStorage
 * @param {function(err, Manager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @class ParticipantManager
 * @extends BaseManager
 * @memberOf Managers
 * @see BaseManager
 */
class ParticipantManager extends BaseManager{
    constructor(dsuStorage, callback) {
        super(dsuStorage, (err, manager) => {
            if (err)
                return callback(err);
            require('./DirectoryManager')(this, (err, directoryManager) => {
                if (err)
                    return callback(err);
                manager.directoryManager = directoryManager;
                require('./StockManager')(this, true, (err, stockManager) => {
                    if (err)
                        return callback(err);
                    manager.stockManager = stockManager;
                    callback(undefined, manager);
                });
            });
        });
        this.directoryManager = undefined;
        this.stockManager = undefined;
    };

    /**
     * Must return the string to be used to generate the DID
     * @param {object} identity
     * @param {string} participantConstSSI
     * @param {function(err, string)}callback
     * @protected
     * @override
     */
    _getDIDString(identity, participantConstSSI, callback){
        callback(undefined, identity.id + '');
    }
}

let participantManager;

/**
 * @param {DSUStorage} [dsuStorage] only required the first time, if not forced
 * @param {boolean} [force] defaults to false. overrides the singleton behaviour and forces a new instance.
 * Makes DSU Storage required again!
 * @param {function(err, ParticipantManager)} [callback]
 * @returns {ParticipantManager}
 * @memberOf Managers
 */
const getParticipantManager = function (dsuStorage, force, callback) {
    if (!callback){
        if (typeof force === 'function'){
            callback = force;
            force = false;
        }
    }
    if (!participantManager || force) {
        if (!dsuStorage)
            throw new Error("No DSUStorage provided");
        participantManager = new ParticipantManager(dsuStorage, callback);
    }
    return participantManager;
}

module.exports = getParticipantManager;