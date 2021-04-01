/**
 * @module managers
 */

/**
 *
 */
const {INFO_PATH, PARTICIPANT_MOUNT_PATH, IDENTITY_MOUNT_PATH, DATABASE_MOUNT_PATH, DID_METHOD} = require('../constants');
const { getResolver , _err} = require('../services/utils');
const relevantMounts = [PARTICIPANT_MOUNT_PATH, DATABASE_MOUNT_PATH];
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
 * @module managers
 * @class BaseManager
 * @abstract
 */
class BaseManager {
    constructor(dsuStorage) {
        this.DSUStorage = dsuStorage;
        this.w3cDID = require('opendsu').loadApi('w3cdid');
        this.rootDSU = undefined;
        this.db = undefined;
        this.participantConstSSI = undefined;
        this.did = undefined;
    };

    getRootDSU(){
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
            self._cacheRelevant(callback);
        });
    };

    _cleanPath(path){
        return path[0] === '/' ? path.substring(1) : path;
    }

    _verifyRelevantMounts(mounts){
        return DATABASE_MOUNT_PATH in mounts && PARTICIPANT_MOUNT_PATH in mounts;
    }

    _cacheRelevant(callback){
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
            this.db = require('opendsu').loadApi('db').getWalletDB(relevant[DATABASE_MOUNT_PATH]);
            console.log(`Database Cached`);
            callback()
        });
    }

    _loadDSU(keySSI, callback){
        getResolver().loadDSU(keySSI, callback);
    };

    /**
     * reads the participant information (if exists)
     * @param {function(err, PARTICIPANT_MOUNT_PATH)} callback
     */
    getIdentity(callback){
        let self = this;
        self._initialize((err) => {
            if (err)
                return callback(err);
            self.DSUStorage.getObject(`${PARTICIPANT_MOUNT_PATH}${IDENTITY_MOUNT_PATH}${INFO_PATH}`, (err, participant) => {
                if (err)
                    return callback(err);
                callback(undefined, participant);
            });
        });
    };

    getOwnDID(){
        let self = this;
        const didString = this.

        this.w3cDID.createIdentity(DID_METHOD, self._get, (err, firstDIDDocument) => {
            if (err) {
                throw err;
            }

            firstDIDDocument.readMessage((err, msg) => {
                if (err) {
                    throw err;
                }

                console.log(`${recipientIdentity} received message: ${msg}`);
                assert.equal(msg, message);
                testFinished();
            });

            const recipientIdentity = firstDIDDocument.getIdentifier();
            w3cDID.createIdentity("demo", "otherDemoIdentity", (err, secondDIDDocument) => {
                if (err) {
                    throw err;
                }

                const senderIdentity = firstDIDDocument.getIdentifier();
                setTimeout(() => {
                    secondDIDDocument.sendMessage(message, recipientIdentity, (err) => {
                        if (err) {
                            throw err;
                        }
                        console.log(`${senderIdentity} sent message to ${recipientIdentity}.`);
                    });
                }, 1000);

            });
        })
    }

    /**
     * Must return the string to be used to generate the DID
     * @param {object} identity
     * @param {string} participantConstSSI
     * @private
     */
    _getDIDString(identity, participantConstSSI){
        throw new Error(`Subclasses must implement this`);
    }

    /**
     * Edits/Overwrites the Participant details
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
                callback();
            });
        });
    };
}

let baseManager;

/**
 * @param {DSUStorage} dsuStorage
 * @returns {ParticipantManager}
 * @module managers
 */
const getBaseManager = function (dsuStorage) {
    if (!baseManager) {
        if (!dsuStorage)
            throw new Error("No DSUStorage provided");
        baseManager = new BaseManager(dsuStorage);
    }
    return baseManager;
}

module.exports = getBaseManager;