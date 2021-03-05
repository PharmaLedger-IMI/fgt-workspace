/**
 * @module fgt-mah-ssapp.managers
 */

const ACTOR_MOUNT_PATH = "/actor";

/**
 * Id Manager Class
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
 * @param {string} domain the anchoring domain
 */
class IdManager {
    constructor(dsuStorage, domain) {
        this.DSUStorage = dsuStorage;
        this.IdService = new (require('wizard').Services.IdService)(domain);

        this.idCache;
    }

    /**
     * Ensures the DSU Storage is properly Initialized and the necessary structure of the SSApp (IdWise) is set
     * @param {function(err)}callback
     * @private
     */
    _initialize(callback){
        this._enableDirectAccess((err) => {
            if (err)
                return callback(err);
            callback();
        });
    }

    /**
     * @see DSUStorage#enableDirectAccess
     * @private
     */
    _enableDirectAccess(callback){
        if(!this.DSUStorage.directAccessEnabled)
            return this.DSUStorage.enableDirectAccess(callback);
        callback();
    }

    /**
     * Creates a {@link Actor} dsu
     * @param {Actor} actor
     * @param {function(err, keySSI, string)} callback where the string is the mount path
     */
    create(actor, callback) {
        this._initialize(() => {
            this.IdService.create(actor, (err, keySSI) => {
                if (err)
                    return callback(err);
                console.log(`Id DSU created with ssi: ${keySSI.getIdentifier(true)}`);
                this.DSUStorage.mount(ACTOR_MOUNT_PATH, keySSI.getIdentifier(), (err) => {
                    if (err)
                        return callback(err);
                    console.log(`Actor ${actor.id} created and mounted at '${ACTOR_MOUNT_PATH}'`);
                    callback(undefined, keySSI, ACTOR_MOUNT_PATH);
                });
            });
        });
    }

    /**
     * reads the id information (if exists)
     * @param {function(err, Actor)} callback
     */
    getId(callback){
        this.DSUStorage.getObject(`${ACTOR_MOUNT_PATH}/info`, (err, actor) => {
            if (err)
                return callback(err);
            callback(undefined, actor);
        });
    }

    /**
     * Removes the Id DSU (does not delete/invalidate DSU, simply 'forgets' the reference)
     * @param {function(err)} callback
     */
    removeId(callback) {
        this._initialize(() => {
            this.DSUStorage.unmount(ACTOR_MOUNT_PATH, (err) => {
                if (err)
                    return callback(err);
                console.log(`Id removed from mount point ${ACTOR_MOUNT_PATH}`);
                callback();
            });
        });
    }

    /**
     * Edits/Overwrites the id details
     * @param {function(err)} callback
     */
    editId(callback) {
        this._initialize(() => {
            this.DSUStorage.writeFile(`${ACTOR_MOUNT_PATH}/info`, (err) => {
                if (err)
                    return callback(err);
                console.log(`Id updated`);
                callback();
            });
        });
    }
}

let idManager;

/**
 * @param {DSUStorage} dsuStorage
 * @param {string} domain
 * @returns {IdManager}
 */
const getIdManager = function (dsuStorage, domain) {
    if (!idManager) {
        if (!dsuStorage)
            throw new Error("No DSUStorage provided");
        idManager = new IdManager(dsuStorage, domain);
    }
    return idManager;
}

module.exports = getIdManager;