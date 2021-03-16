/**
 * @module fgt-dsu-toolkit.managers
 */

/**
 * Manager Classes in this context should do the bridge between the controllers
 * and the services exposing only the necessary api to the controllers while encapsulating <strong>all</strong> business logic.
 *
 * All Manager Classes should be singletons.
 *
 * This complete separation of concerns is very beneficial for 2 reasons:
 * <ul>
 *     <li>Allows for testing since there's no browser dependent code (i think) since the DSUStorage can be 'mocked'</li>
 *     <li>Allows for different controllers access different business logic when necessary (while benefiting from the singleton behaviour)</li>
 * </ul>
 *
 * @param {Archive} storageDSU the DSU where the storage should happen
 */
class Manager{
    constructor(storageDSU){
        this.storage = storageDSU;
        this.storage.getObject = this._getObject(this.storage);
        this.storage.directAccessEnabled = true;
        this.resolver = undefined;
    }

    /**
     * Retrieves the {@link participant}
     * @param {function(err, Participant)}callback
     */
    getParticipant(callback){
        this.storage.getObject(PARTICIPANT_MOUNT_PATH, callback);
    }

    _getObject(dsu){
        return function(path, callback) {
            dsu.readFile(path, function (err, res) {
                if (err)
                    return callback(err);
                try {
                    res = JSON.parse(res.toString());
                } catch (err) {
                    return callback(err);
                }
                callback(undefined, res);
            });
        }
    }

    /**
     * Util function. Loads a DSU
     * @param {KeySSI} keySSI
     * @param {function(err, Archive)} callback
     */
    loadDSU(keySSI, callback){
        if (!this.resolver)
            this.resolver = require('opendsu').loadApi('resolver');
        this.resolver.loadDSU(keySSI, callback);
    }

    /**
     * Should translate the Controller Model into the Business Model
     * @param model the Controller's Model
     * @returns {dict} the Business Model object ready to feed to the constructor
     */
    fromModel(model){
        let result = {};
        Object.keys(model).forEach(key => {
            if (model.hasOwnProperty(key) && model[key].value)
                result[key] = model[key].value;
        });
        return result
    }

    /**
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
        this.storage.listMountedDSUs(path, (err, mounts) => {
            if (err)
                return callback(err);
            console.log(`Found ${mounts.length} mounts at ${path}`);
            callback(undefined, mounts);
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
     * @param {function(err, object[])} callback
     * @private
     */
    readAll(mounts, callback){
        let self = this;
        let batches = [];
        let iterator = function(m){
            let mount = m.shift();
            if (!mount)
                return callback(undefined, Object.keys(batches).map(key => batches[key]));
            console.log(`getObject ${mount.path}${INFO_PATH}`);
            self.storage.getObject(`${mount.path}${INFO_PATH}`, (err, batch) => {
                if (err)
                    return callback(err);
                //console.log("gotObject", batch);
                batches.push(batch);
                iterator(m);
            });
        }
        iterator(mounts.slice());
    }
}

module.exports = Manager;