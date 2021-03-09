/**
 * @module fgt-mah-ssapp.managers
 */

/**
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
 * For testing, instead of the DSUStorage provide the DSU itself after:
 * <pre>
 *     dsu.directAccessEnabled = true;
 * </pre>
 * This will make the DSU handle as a DSUStorage after binding
 *
 * @param {DSUStorage} dsuStorage the controllers dsu storage
 */
class Manager{
    constructor(dsuStorage){
        this.DSUStorage = dsuStorage;
        this.resolver = undefined;
    }

    loadDSU(keySSI, callback){
        if (!this.resolver)
            this.resolver = require('opendsu').loadApi('resolver');
        this.resolver.loadDSU(keySSI, callback);
    }

    /**
     * Ensures the DSU Storage is properly Initialized
     * and access to the main dsu's methods are given
     * @param {function(err)}callback
     */
    initialize(callback){
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
     * Should translate the Controller Model into the Business Model
     * @param model the Controller's Model
     * @returns {...} the Business Model object
     */
    fromModel(model){
        throw new Error("Each subclass must implement this!");
    }

    /**
     *
     * @param {object} object the business model object
     * @param model the Controller's model object
     * @returns {{}}
     */
    toModel(object, model){
        model = model || {};
        for (let prop in object)
            if (object.hasOwnProperty(prop)){
                if (!model[prop])
                    model[prop] = {};
                model[prop].value = object[prop];
            }

        return model;
    }

    /**
     * Lists all mounts at a given path.
     *
     * When chained with {@link Manager#readAll} will output a
     * list ob objects at the '/info' path of each mounted dsu
     * @param {string} path
     * @param {function(err, mount[])} callback
     * each mount object is:
     * <pre>
     *     {
     *         path: mountPath,
     *         identifier: keySSI
     *     }
     * </pre>
     */
    listMounts(path, callback) {
        this.initialize(() => {
            this.DSUStorage.listMountedDossiers(path, (err, mounts) => {
                if (err)
                    return callback(err);
                console.log(`Found ${mounts.length} mounts at ${path}`);
                callback(undefined, mounts);
            });
        });
    }

    /**
     * Resolve mounts and read DSUs
     * @param {object[]} mounts where each object is:
     * <pre>
     *     {
     *         path: mountPath,
     *         identifier: keySSI
     *     }
     * </pre> The array is consumed (mutated).
     * @param {function(err, Batch[])} callback
     * @private
     */
    readAll(mounts, callback){
        let self = this;
        let batches = [];
        let iterator = function(m){
            let mount = m.shift();
            if (!mount)
                return callback(undefined, Object.keys(batches).map(key => batches[key]));
            self.DSUStorage.getObject(`${mount.path}/info`, (err, batch) => {
                if (err)
                    return callback(err);
                batches.push(batch);
                iterator(m);
            });
        }
        iterator(mounts.slice());
    }
}

module.exports = Manager;