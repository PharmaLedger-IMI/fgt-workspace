const {INFO_PATH, PARTICIPANT_MOUNT_PATH, IDENTITY_MOUNT_PATH, DATABASE_MOUNT_PATH} = require('../constants');
const { getResolver ,getKeySSISpace,  _err} = require('../services/utils');
const relevantMounts = [PARTICIPANT_MOUNT_PATH, DATABASE_MOUNT_PATH];
const {getMessageManager, Message} = require('./MessageManager');
const DBLock = require('./DBLock');

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
 *
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
 * As well as the SSApp Architecture {@link ../drawing.png here}
 *
 * it also integrates with the {@link DSUStorage} to provide direct access to the Base DSU by default.
 *
 * All other Managers in this architecture can inherit from this to get access to the getIdentity && getEnvironment API from the credentials set in the pdm-loader
 *
 *
 * @memberOf Managers
 * @class BaseManager
 * @abstract
 */
class BaseManager {
    /**
     * @param {DSUStorage} dsuStorage the controllers dsu storage
     * @param {function(err, BaseManager)} [callback] optional callback. called after initialization. mostly for testing
     * @constructor
     */
    constructor(dsuStorage, callback) {
        this.DSUStorage = dsuStorage;
        this.rootDSU = undefined;
        this.db = undefined;
        this.dbLock = undefined;
        this.participantConstSSI = undefined;
        this.did = undefined;
        this.messenger = undefined;
        this.identity = undefined;
        this.managerCache = {};
        this.controller = undefined;
        this._getResolver = getResolver;
        this._getKeySSISpace = getKeySSISpace;
        this._err = _err;

        const self = this;
        const initializer = function(){
            self._initialize((err) => {
                if (err){
                    console.log(`Could not initialize base manager ${err}`);
                    if(callback)
                        return callback(err);
                }
                console.log(`base manager initialized`);
                if (callback)
                    callback(undefined, self);
            });
        }

        if (!self.controller)
            return initializer();

        // For ui flow reasons
        setTimeout(() => {
            initializer();
        }, 100)

    };

    /**
     * Caches every other manager to enforce a singleton behaviour
     * @param {Manager} manager
     */
    cacheManager(manager){
        const name = manager.constructor.name;
        if (name in this.managerCache)
            throw new Error("Duplicate managers " + name);

        this.managerCache[name] = manager;
    }

    /**
     * Returns a cached {@link Manager}
     * @param {class | string} manager the class ex: 'getManager(SomethingManager)'
     * @throws error when the requested manager is not cached
     */
    getManager(manager){
        const name = typeof manager === 'string' ? manager : manager.name;
        if (!(name in this.managerCache))
            throw new Error("No manager cached " + name);
        return this.managerCache[name];
    }

    /**
     * Sends a message to a DID via the {@link MessageManager}
     * @param {string | Wc3DID} did
     * @param {string} api
     * @param {{}} message
     * @param {function(err)} callback
     */
    sendMessage(did, api, message, callback){
        const msg = new Message(api, message)
        this.messenger.sendMessage(did, msg, callback);
    }

    /**
     * Registers a {@link Manager} with the {@link MessageManager} of the provided api
     * so it'll be updated automatically
     * @param {string} api the tableName typically
     * @param {function(Message)} listener
     * @return {*}
     */
    registerMessageListener(api, listener){
        const self = this;
        if (this.messenger) { // initialization done
            return this.messenger.registerListeners(api, listener);
        } else {
            console.log("Waiting for participant initialization");
            setTimeout(() => { self.registerMessageListener.call(self, api, listener); },
                100);
        }
    }

    /**
     * See {@link MessageManager#deleteMessage}.
     */
    deleteMessage(message, callback){
        this.messenger.deleteMessage(message, callback);
    }

    /**
     * See {@link MessageManager#getMessages}.
     */
    getMessages(api, callback){
        this.messenger.getMessages(api, callback);
    }

    /**
     * Stops the message service listener
     */
    shutdownMessenger(){
        this.messenger.shutdown();
    }

    /**
     * giver the manager a reference to the controller so it can refresh the UI
     * @param {LocalizedController} controller
     */
    setController(controller){
        this.controller = controller;
    }

    /**
     * Retrieves the RootDSU syncronasly to the SSAPP, where all the other DSU's are mounted/referenced
     * @return {Archive}
     * @private
     * @throws error if the DSU is not cached
     */
    _getRootDSU(){
        if (!this.rootDSU)
            throw new Error("ParticipantDSU not cached");
        return this.rootDSU;
    };

    /**
     * Initializes the Base Manager
     * Also loads and caches the 'Public identity from the loader credentials'
     * @param {function(err)} callback
     * @private
     */
    _initialize(callback){
        if (this.rootDSU)
            return callback();
        let self = this;

        const enableDirectAccess = function(callback){
            self.DSUStorage.enableDirectAccess((err) => {
                self.rootDSU = self.DSUStorage;
                callback(err);
            });
        }

        const getIdentity = function(callback){
            self.getIdentity((err, identity) => err
                ? self._err(`Could not get Identity`, err, callback)
                : callback(err, identity));
        }

        if (!self.controller)
            return enableDirectAccess(err => err
                ? callback(err)
                : getIdentity((err, identity) => err
                    ? self._err(`Could not get Identity`, err, callback)
                    : self._cacheRelevant(callback, identity)));

        // For UI Responsiveness
        setTimeout(() => {
            enableDirectAccess(err => err
                ? callback(err)
                : setTimeout(() => {
                    getIdentity((err, identity) => err
                        ? self._err(`Could not get Identity`, err, callback)
                        : setTimeout(() => {
                            self._cacheRelevant(callback, identity);
                        }), 250);
                }), 100);
        }, 100);
    };

    /**
     * Veryfied that all the DSU's necessary to the SSAPP Architecture are available
     * @param {{}} mounts
     * @private
     */
    _verifyRelevantMounts(mounts){
        return this._cleanPath(DATABASE_MOUNT_PATH) in mounts && this._cleanPath(PARTICIPANT_MOUNT_PATH) in mounts;
    }

    /**
     * Util method to handle mount paths
     * @param {string} path
     * @return {string}
     * @private
     */
    _cleanPath(path){
        return path[0] === '/' ? path.substring(1) : path;
    }

    /**
     * Caches relevant objects to be able to provide synchronous access to other managers
     * @param {function(err, Participant)} callback
     * @param identity
     * @private
     */
    _cacheRelevant(callback, identity){
        let self = this;
        this.rootDSU.listMountedDSUs('/', (err, mounts) => {
            if (err)
                return self._err(`Could not list mounts in root DSU`, err, callback);
            const relevant = {};
            mounts.forEach(m => {
                if (relevantMounts.indexOf('/' + m.path) !== -1)
                    relevant[m.path] = m.identifier;
            });
            if (!self._verifyRelevantMounts(relevant))
                return callback(`Loader Initialization failed`);
            let dbSSI = getKeySSISpace().parse(relevant[self._cleanPath(DATABASE_MOUNT_PATH)]);
            if (!dbSSI)
                return callback(`Could not retrieve db ssi`);
            dbSSI = dbSSI.derive();

            const loadDB = function(callback){
                try{
                    self.db = require('opendsu').loadApi('db').getWalletDB(dbSSI, 'mydb');
                    self.db.on('initialised', () => {
                        console.log(`Database Cached`);
                        self.dbLock = new DBLock(self.db);
                        callback();
                    });
                } catch (e) {
                    return self._err(`Error Loading Database`, e, callback);
                }
            }

            const loadMessenger = function(callback){
                self.participantConstSSI = relevant[self._cleanPath(PARTICIPANT_MOUNT_PATH)];
                self._getDIDString(identity, self.participantConstSSI, (err, didString) => {
                    if (err)
                        return callback(err);
                    console.log(`DID String is ${didString}`);
                    getMessageManager(self, didString, (err, messageManager) => {
                        if (err)
                            return callback(err);
                        self.messenger = messageManager;
                        callback(undefined, self);
                    });
                });
            }

            if (!self.controller)
                return loadDB((err) => err
                    ? callback(err)
                    : loadMessenger(callback));

            // For UI Responsiveness
            setTimeout(() => {
                loadDB(err => err
                    ? callback(err)
                    : setTimeout(() => loadMessenger(callback), 20));
            }, 20);
        });
    }

    /**
     * @param {string|KeySSI} keySSI
     * @param {function(err, Archive)} callback
     * @private
     */
    _loadDSU(keySSI, callback){
        let self = this;
        if (typeof keySSI === 'string'){
            try {
                keySSI = self._getKeySSISpace().parse(keySSI);
            } catch (e) {
                return self._err(`Could not parse SSI ${keySSI}`, e, callback);
            }
            return self._loadDSU(keySSI, callback);
        }
        this._getResolver().loadDSU(keySSI, callback);
    };

    /**
     * reads the participant information (if exists)
     * @param {function(err, object)} [callback] only required if the identity is not cached
     * @returns {Participant} identity (if cached and no callback is provided)
     */
    getIdentity(callback){
        if (this.identity){
            if (callback)
                return callback(undefined, this.identity);
            return this.identity;
        }

        let self = this;
        self.DSUStorage.getObject(`${PARTICIPANT_MOUNT_PATH}${IDENTITY_MOUNT_PATH}${INFO_PATH}`, (err, participant) => {
            if (err)
                return self._err(`Could not get identity`, err, callback);
            self.identity = participant;
            callback(undefined, participant)
        });
    };

    /**
     * Must return the string to be used to generate the DID
     * @param {object} identity
     * @param {string} participantConstSSI
     * @param {function(err, string)}callback
     * @protected
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
        let self = this;
        this._initialize(err => {
            if (err)
                return self._err(`Could not initialize`, err, callback);
            self.DSUStorage.setObject(`${PARTICIPANT_MOUNT_PATH}${INFO_PATH}`, JSON.stringify(participant), (err) => {
                if (err)
                    return callback(err);
                console.log(`Participant updated`);
                this.identity = participant;
                callback(undefined, participant);
            });
        });
    };
}

module.exports = BaseManager;