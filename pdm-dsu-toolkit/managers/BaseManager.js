const {INFO_PATH, PARTICIPANT_MOUNT_PATH} = require('../constants');
/**
 * Base Manager Class
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
 * This Base Manager Class is designed to integrate with the pdm-trust-loader and a init.file configuration of
 * <pre>
 *
 * </pre>
 *
 * it also integrates with the {@link DSUStorage} to provide direct access to the Base DSU by default.
 *
 * All other Managers in this architecture can inherit from this to get access to the getIdentity && getEnvironment API from the credentials set in the pdm-loader
 *
 * @param {DSUStorage} dsuStorage the controllers dsu storage
 * @param {string} domain the anchoring domain
 * @module pdm-dsu-toolkit.managers
 */
class BaseManager{
    constructor(dsuStorage, domain) {
        this.DSUStorage = dsuStorage;
        this.participantService = new (require('../services').ParticipantService)(domain);
        this.resolver = undefined;
        this.rootDSU = undefined;
    };

    getRootDSU(){
        if (!this.rootDSU)
            throw new Error("ParticipantDSU not cached");
        return this.rootDSU;
    };

    /**
     * Creates a {@link Participant} dsu
     * @param {Participant} participant
     * @param {function(err, keySSI, string)} callback where the string is the mount path
     */
    create(participant, callback) {
        let self = this;
        if (typeof callback != "function")
            throw new Error("callback must be a function!");
        self.DSUStorage.enableDirectAccess(() => {
            self.participantService.create(participant, inbox, (err, keySSI) => {
                if (err)
                    return callback(err);
                console.log(`Participant DSU created with ssi: ${keySSI.getIdentifier(true)}`);
                self.DSUStorage.mount(PARTICIPANT_MOUNT_PATH, keySSI.getIdentifier(), (err) => {
                    if (err)
                        return callback(err);
                    console.log(`Participant ${participant.id} created and mounted at '${PARTICIPANT_MOUNT_PATH}'`);
                    self._cacheParticipantDSU((err) => {
                        if (err)
                            return callback(err);
                        callback(undefined, keySSI, PARTICIPANT_MOUNT_PATH);
                    });
                });
            });
        });
    };

    _cacheParticipantDSU(callback){
        if (this.rootDSU)
            return callback();
        let self = this;
        self.DSUStorage.enableDirectAccess(() => {
            self.DSUStorage.listMountedDSUs('/', (err, mounts) => {
                if (err)
                    return callback(err);
                if (!mounts)
                    return callback("no mounts found!");
                self._matchParticipantDSU(mounts, (err, dsu) => {
                    if (err)
                        return callback(err);
                    self.rootDSU = dsu;
                    callback();
                });
            });
        });
    };

    _matchParticipantDSU(mounts, callback){
        // m.path has "participant". PARTICIPANT_MOUNT_PATH has "/participant".
        let mount = mounts.filter(m => m.path === PARTICIPANT_MOUNT_PATH.substr(1));
        if (!mount || mount.length !== 1)
            return callback("No participant mount found");
        this._loadDSU(mount[0].identifier, (err, dsu) => {
            if (err)
                return callback(err);
            console.log(`Participant DSU Successfully cached: ${mount[0].identifier}`);
            callback(undefined, dsu);
        });
    };

    _loadDSU(keySSI, callback){
        if (!this.resolver)
            this.resolver = require('opendsu').loadApi('resolver');
        this.resolver.loadDSU(keySSI, callback);
    };

    /**
     * reads the participant information (if exists)
     * @param {function(err, PARTICIPANT_MOUNT_PATH)} callback
     */
    getParticipant(callback){
        let self = this;
        self._cacheParticipantDSU((err) => {
            if (err)
                return callback(err);
            self.DSUStorage.getObject(`${PARTICIPANT_MOUNT_PATH}${INFO_PATH}`, (err, participant) => {
                if (err)
                    return callback(err);
                callback(undefined, participant);
            });
        });
    };

    /**
     * Removes the PARTICIPANT_MOUNT_PATH DSU (does not delete/invalidate DSU, simply 'forgets' the reference)
     * @param {function(err)} callback
     */
    remove(callback) {
        this.DSUStorage.enableDirectAccess(() => {
            this.DSUStorage.unmount(PARTICIPANT_MOUNT_PATH, (err) => {
                if (err)
                    return callback(err);
                console.log(`Participant removed from mount point ${PARTICIPANT_MOUNT_PATH}`);
                callback();
            });
        });
    };

    /**
     * Edits/Overwrites the Participant details
     * @param {Participant} participant
     * @param {function(err)} callback
     */
    edit(participant, callback) {
        this.DSUStorage.enableDirectAccess(() => {
            this.DSUStorage.writeFile(`${PARTICIPANT_MOUNT_PATH}${INFO_PATH}`, JSON.stringify(participant), (err) => {
                if (err)
                    return callback(err);
                console.log(`Participant updated`);
                callback();
            });
        });
    };
}

let baseManager;

/**
 * @param {DSUStorage} [dsuStorage]
 * @param {string} [domain]
 * @returns {ParticipantManager}
 */
const getBaseManager = function (dsuStorage, domain) {
    if (!baseManager) {
        if (!dsuStorage)
            throw new Error("No DSUStorage provided");
        if (!domain)
            throw new Error("No domain provided");
        baseManager = new BaseManager(dsuStorage, domain);
    }
    return baseManager;
}

module.exports = getBaseManager;