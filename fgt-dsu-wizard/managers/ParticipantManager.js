const BaseManager = require('../../pdm-dsu-toolkit/managers/BaseManager');

/**
 * Participant Manager Class
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
 * Should eventually integrate with the WP3 decisions
 *
 * @param {DSUStorage} dsuStorage the controllers dsu storage
 * @param {function(err, ParticipantManager)} [callback}
 * @module Managers
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
 * @module Managers
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