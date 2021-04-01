const {PARTICIPANT_MOUNT_PATH, INFO_PATH} = require('../constants');

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
 * @param {Archive|Database} storage the DSU where the storage should happen or more commonly the Database Object
 * @module managers
 * @class Manager
 */
class Manager{
    constructor(storage){
        this.storage = storage;
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
}

module.exports = Manager;