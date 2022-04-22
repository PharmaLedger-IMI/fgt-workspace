const {_err} = require('../../pdm-dsu-toolkit/services/utils');
const {ApiStorage} = require("./ApiStorage");

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
class ApiBaseManager {
    /**
     * @param {DSUStorage} dsuStorage the controllers dsu storage
     * @param {function(err, BaseManager)} [callback] optional callback. called after initialization. mostly for testing
     * @constructor
     */
    constructor(dsuStorage, callback) {
        this.storage = new ApiStorage("http://localhost:8081/traceability");
        this.identity = undefined;
        this.managerCache = {};
        this.controller = undefined;
        this.environment = undefined;
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

    getStorage(){
        return this.storage;
    }

    getEnvironment(callback){
        if (this.environment)
            return callback(undefined, this.environment);
        if (!this.rootDSU)
            return callback(`No Root DSU defined`);
        this.rootDSU.getObject('/environment.json', (err, env) => {
            if (err)
                return callback(err);
            this.environment = env;
            callback(undefined, env);
        });
    }

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
     * giver the manager a reference to the controller so it can refresh the UI
     * @param {LocalizedController} controller
     */
    setController(controller){
        this.controller = controller;
    }

    /**
     * Initializes the Base Manager
     * Also loads and caches the 'Public identity from the loader credentials'
     * @param {function(err)} callback
     * @private
     */
    _initialize(callback){
        let self = this;
        const getIdentity = function(callback){
            self.getIdentity((err, identity) => err
                ? self._err(`Could not get Identity`, err, callback)
                : callback(err, identity));
        }

        if (!self.controller)
            return getIdentity((err, identity) => err
                    ? self._err(`Could not get Identity`, err, callback)
                    : callback(undefined, identity));

        // For UI Responsiveness
        setTimeout(() => {
            setTimeout(() => {
                getIdentity((err, identity) => err
                    ? self._err(`Could not get Identity`, err, callback)
                    :callback(undefined, identity));
            }, 100);
        }, 100);
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

        const self = this;
        const request = this.storage.__createRequest("identity.json", "get");
        this.storage.__executeRequest(request, (err, data) => {
            if (err)
                return callback(err);
            self.identity = data;
            callback(undefined, self.identity);
        })
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
}

module.exports = ApiBaseManager;