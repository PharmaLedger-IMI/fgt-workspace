/**
 * @module managers
 */

/**
 *
 */
const {INFO_PATH, PARTICIPANT_MOUNT_PATH, IDENTITY_MOUNT_PATH, DATABASE_MOUNT_PATH} = require('../constants');
const { getResolver , _err} = require('../services/utils');
const relevantMounts = [PARTICIPANT_MOUNT_PATH, DATABASE_MOUNT_PATH];
const {MessageManager, Message} = require('./MessageManager');
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
 *      define $ID$ fromvar -$Identity-
 *      define $ENV$ fromvar -$Environment-
 *
 *      with cmd createdsu seed traceability specificstring
 *          define $SEED$ fromcmd getidentifier true
 *          createfile info $ID$
 *      endwith
 *      createfile environment.json $ENV$
 *      mount $SEED$ /id
 *
 *      with var $SEED$
 *          define $READ$ fromcmd derive true
 *      endwith
 *
 *      define $SECRETS$ fromcmd objtoarray $ID$
 *
 *      with cmd createdsu const traceability $SECRETS$
 *          mount $READ$ /id
 *          define $CONST$ fromcmd getidentifier true
 *      endwith
 *
 *      mount $CONST$ /participant
 *
 *      with cmd createdsu seed traceability fordb
 *          define $DB$ fromcmd getidentifier true
 *      endwith
 *
 *      mount $DB$ /db
 * </pre>
 *
 * it also integrates with the {@link DSUStorage} to provide direct access to the Base DSU by default.
 *
 * All other Managers in this architecture can inherit from this to get access to the getIdentity && getEnvironment API from the credentials set in the pdm-loader
 *
 * @param {DSUStorage} dsuStorage the controllers dsu storage
 * @param {string} domain the anchoring domain
 * @module managers
 * @class BaseManager
 * @abstract
 */
class BaseManager {
    constructor(dsuStorage) {
        this.DSUStorage = dsuStorage;
        this.rootDSU = undefined;
        this.db = undefined;
        this.participantConstSSI = undefined;
        this.did = undefined;
        this.messenger = undefined;
        this._initialize((err) => {
            console.log(err);
        })
    };

    sendMessage(did, api, message, callback){
        const msg = new Message(api, message)
        this.messenger.sendMessage(did, msg, callback);
    }

    getMessages(callback){

    }

    _getRootDSU(){
        if (!this.rootDSU)
            throw new Error("ParticipantDSU not cached");
        return this.rootDSU;
    };

    _initialize(callback){
        if (this.rootDSU)
            return callback();
        let self = this;
        self.DSUStorage.enableDirectAccess(() => {
            self.rootDSU = self.DSUStorage;
            self.getIdentity((err, identity) => err
                ? _err(`Could not get Identity`, err, callback)
                : self._cacheRelevant(callback, identity));
        });
    };

    _cleanPath(path){
        return path[0] === '/' ? path.substring(1) : path;
    }

    _verifyRelevantMounts(mounts){
        return DATABASE_MOUNT_PATH in mounts && PARTICIPANT_MOUNT_PATH in mounts;
    }

    _cacheRelevant(callback, identity){
        let self = this;
        this.rootDSU.listMountedDSUs('/', (err, mounts) => {
            if (err)
                return _err(`Could not list mounts in root DSU`, err, callback);
            const relevant = {};
            mounts.forEach(m => {
                if (relevantMounts.indexOf(m.path) !== -1)
                    relevant[m.path] = m.identifier;
            });
            if (!self._verifyRelevantMounts(relevant))
                return callback(`Loader Initialization failed`);
            self.db = require('opendsu').loadApi('db').getWalletDB(relevant[DATABASE_MOUNT_PATH]);
            self.messenger = new MessageManager(self.db, self._getDIDString(identity));
            self.participantConstSSI = relevant[PARTICIPANT_MOUNT_PATH];
            console.log(`Database Cached`);
            callback()
        });
    }

    _loadDSU(keySSI, callback){
        getResolver().loadDSU(keySSI, callback);
    };

    /**
     * reads the participant information (if exists)
     * @param {function(err, object)} callback
     */
    getIdentity(callback){
        let self = this;
        self.DSUStorage.getObject(`${PARTICIPANT_MOUNT_PATH}${IDENTITY_MOUNT_PATH}${INFO_PATH}`, (err, participant) => err
            ? _err(`Could not get identity`, err, callback)
            : callback(undefined, participant));
    };

    /**
     * Must return the string to be used to generate the DID
     * @param {object} identity
     * @param {string} participantConstSSI
     * @param {function(err, string)}callback
     * @private
     */
    _getDIDString(identity, participantConstSSI, callback){
        throw new Error(`Subclasses must implement this`);
    }

    /**
     * Edits/Overwrites the Participant details. Should this be allowed??
     * @param {Participant} participant
     * @param {function(err)} callback
     */
    editIdentity(participant, callback) {
        this._initialize(err => {
            if (err)
                return _err(`Could not initialize`, err, callback);
            self.DSUStorage.setObject(`${PARTICIPANT_MOUNT_PATH}${INFO_PATH}`, JSON.stringify(participant), (err) => {
                if (err)
                    return callback(err);
                console.log(`Participant updated`);
                callback(undefined, participant);
            });
        });
    };
}

module.exports = BaseManager;