toolkitRequire=(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({"../../../pdm-dsu-toolkit":[function(require,module,exports){
(function (__dirname){(function (){
/**
 * @module fgt-dsu-toolkit
 */

/**
 * iterates through all the commands in the command folder and registers them
 * Is called by the apihub via the server.json
 */
function Init(server){
	const path = require('path');
	const cmdsDir = path.join(__dirname, "commands");
	require('fs').readdir(cmdsDir, (err, files) => {
		if (err)
			throw err;
		files.filter(f => f !== 'setSSI.js' && f !== 'index.js').forEach(f => {
			require(path.join(cmdsDir, f)).command(server);
		});
	});
}

module.exports = {
	Init,
	/**
	 * exposes the Commands module
	 */
	Commands: require("./commands"),
	/**
	 * Exposes the Services Module
	 */
	Services: require("./services"),
	/**
	 * Exposes the Managers module
	 */
	Managers: require("./managers"),
	/**
	 * exposes the Model module
	 */
	Model: require("./model")
};

}).call(this)}).call(this,"/")

},{"./commands":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/commands/index.js","./managers":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/managers/index.js","./model":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/model/index.js","./services":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/services/index.js","fs":false,"path":false}],"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/builds/tmp/toolkit_intermediar.js":[function(require,module,exports){
(function (global){(function (){
global.toolkitLoadModules = function(){ 

	if(typeof $$.__runtimeModules["toolkit"] === "undefined"){
		$$.__runtimeModules["toolkit"] = require("../../../pdm-dsu-toolkit");
	}
};
if (true) {
	toolkitLoadModules();
}
global.toolkitRequire = require;
if (typeof $$ !== "undefined") {
	$$.requireBundle("toolkit");
}

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../../pdm-dsu-toolkit":"../../../pdm-dsu-toolkit"}],"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/commands/index.js":[function(require,module,exports){
/**
 * @module pdm-dsu-toolkit.commands
 */
module.exports = {
    setSSI: require("./setSSI"),
    createParticipantSSI: require("./setParticipantSSI").createParticipantSSI,
    createParticipantConstSSI: require("./setParticipantConstSSI").createParticipantConstSSI
}
},{"./setParticipantConstSSI":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/commands/setParticipantConstSSI.js","./setParticipantSSI":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/commands/setParticipantSSI.js","./setSSI":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/commands/setSSI.js"}],"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/commands/setParticipantConstSSI.js":[function(require,module,exports){
/**
 * @module fgt-dsu-wizard.commands
 */

/**
 * Creates a seedSSI meant to contain participant 'participantConst' data.
 * could be used as an identity
 * @param {Participant} participant. Must have a valid id property.
 * @param {string} domain: anchoring domain
 * @returns {SeedSSI} (template)
 */
function createParticipantConstSSI(participant, domain) {
    console.log("New ParticipantConst_SSI in domain", domain);
    const openDSU = require('opendsu');
    const keyssiSpace = openDSU.loadApi("keyssi");
    return keyssiSpace.createArraySSI(domain, [participant.id]);
}

/**
 * Registers the endpoint on the api-hub's dsu-wizard.
 * @param {HttpServer} server
 */
function command(server){
    const setSSI = require('./setSSI');
    setSSI(server, "participantConst", createParticipantConstSSI, "setParticipantConstSSI", "traceability");
}

module.exports = {
    command,
    createParticipantConstSSI: createParticipantConstSSI
};

},{"./setSSI":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/commands/setSSI.js","opendsu":false}],"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/commands/setParticipantSSI.js":[function(require,module,exports){
/**
 * @module fgt-dsu-wizard.commands
 */

/**
 * Creates a seedSSI meant to contain participant 'participant' data.
 * could be used as an identity
 * @param {Participant} participant
 * @param {string} domain: anchoring domain
 * @returns {SeedSSI} (template)
 */
function createParticipantSSI(participant, domain) {
    console.log("New Participant_SSI in domain", domain);
    const openDSU = require('opendsu');
    const keyssiSpace = openDSU.loadApi("keyssi");
    return keyssiSpace.buildTemplateSeedSSI(domain, participant.id + participant.name + participant.tin, undefined, 'v0', undefined);
}

/**
 * Registers the endpoint on the api-hub's dsu-wizard.
 * @param {HttpServer} server
 */
function command(server){
    const setSSI = require('./setSSI');
    setSSI(server, "participant", createParticipantSSI, "setParticipantSSI", "traceability");
}

module.exports = {
    command,
    createParticipantSSI: createParticipantSSI
};

},{"./setSSI":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/commands/setSSI.js","opendsu":false}],"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/commands/setSSI.js":[function(require,module,exports){
/**
 * @module fgt-dsu-toolkit.commands
 */

/**
 * Registers with the DSU Wizard the provided endpoints for the various DSU types
 * @param server: the server object
 * @param endpoint: the endpoint to be registered
 * @param factoryMethod: the method that receives a data object with the parameters required to generate the keyssi, and is responsible for the creation of the DSU
 * @param methodName: the name of the method to be registered in the DSU Wizard? - Should match the method name that is calling it?
 * @param domain: (optional) domain where to anchor the DSU - defaults to 'default'
 */
function setSSI(server, endpoint, factoryMethod, methodName, domain){
    domain = domain || "default";
    const dsu_wizard = require("dsu-wizard");
    const commandRegistry = dsu_wizard.getCommandRegistry(server);
    const utils = dsu_wizard.utils;

    commandRegistry.register("/" + endpoint, "post", (req, callback) => {
        const transactionManager = dsu_wizard.getTransactionManager();

        utils.bodyParser(req, err => {
            if(err)
                return OpenDSUSafeCallback(callback)(createOpenDSUErrorWrapper(`Failed to parse body`, err));

            const data = JSON.parse(req.body);
            const elemSSI = factoryMethod(data, domain);

            transactionManager.getTransaction(req.params.transactionId, (err, transaction) => {
                transaction.context.keySSI = elemSSI.getIdentifier();
                transaction.context.forceNewDSU = true;                 // TODO: Why? could not find documentation
                transaction.context.options.useSSIAsIdentifier = true;  // TODO: Why? could not find documentation
                transactionManager.persistTransaction(transaction, err => {
                    if(err)
                        return callback(err);

                    const command = dsu_wizard.getDummyCommand().create(methodName);  // TODO: why?
                    return callback(undefined, command);
                });
            });
        });
    });
}

module.exports = setSSI;

},{"dsu-wizard":false}],"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/constants.js":[function(require,module,exports){
const INFO_PATH = '/info';
const PARTICIPANT_MOUNT_PATH = "/participant";

module.exports = {
    INFO_PATH,
    PARTICIPANT_MOUNT_PATH
}
},{}],"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/managers/Manager.js":[function(require,module,exports){
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
},{"opendsu":false}],"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/managers/ParticipantManager.js":[function(require,module,exports){
/**
 * @module pdm-dsu-toolkit.managers
 */

const {INFO_PATH, PARTICIPANT_MOUNT_PATH} = require('../constants');

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
 * @param {string} domain the anchoring domain
 */
class ParticipantManager{
    constructor(dsuStorage, domain) {
        this.DSUStorage = dsuStorage;
        this.participantService = new (require('../services').ParticipantService)(domain);
        this.resolver = undefined;
        this.participantDSU = undefined;
    };

    getParticipantDSU(){
        if (!this.participantDSU)
            throw new Error("ParticipantDSU not cached");
        return this.participantDSU;
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
        if (this.participantDSU)
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
                    self.participantDSU = dsu;
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

let participantManager;

/**
 * @param {DSUStorage} [dsuStorage]
 * @param {string} [domain]
 * @returns {ParticipantManager}
 */
const getParticipantManager = function (dsuStorage, domain) {
    if (!participantManager) {
        if (!dsuStorage)
            throw new Error("No DSUStorage provided");
        if (!domain)
            throw new Error("No domain provided");
        participantManager = new ParticipantManager(dsuStorage, domain);
    }
    return participantManager;
}

module.exports = getParticipantManager;
},{"../constants":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/constants.js","../services":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/services/index.js","opendsu":false}],"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/managers/index.js":[function(require,module,exports){
/**
 * @module fgt-dsu-wizard.managers
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
 */
module.exports = {
    Manager: require('./Manager'),
    getParticipantManager: require('./ParticipantManager').getParticipantManager
}
},{"./Manager":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/managers/Manager.js","./ParticipantManager":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/managers/ParticipantManager.js"}],"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/model/Utils.js":[function(require,module,exports){
/**
 * @module fgt-dsu-wizard.model
 */
function generate(charactersSet, length){
    let result = '';
    const charactersLength = charactersSet.length;
    for (let i = 0; i < length; i++) {
        result += charactersSet.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

module.exports = {
    generateID(length) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        return generate(characters, length);
    },

    generateNumericID(length) {
        const characters = '0123456789';
        return generate(characters, length);
    },

    generateSerialNumber(length){
        let char = generate("ABCDEFGHIJKLMNOPQRSTUVWXYZ", 2);
        let number = this.generateNumericID(length-char.length);
        return char+number;
    }
}
},{}],"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/model/Validations.js":[function(require,module,exports){
/**
 * @module fgt-dsu-wizard.model
 */

/**
 * Supported ion-input element types
 */
const ION_TYPES = {
    EMAIL: "email",
    NUMBER: "number",
    TEXT: "text",
    DATE: "date"
}

/**
 * Supported ion-input element sub-types (under the {@link ION_CONST#name_key})
 */
const SUB_TYPES = {
    TIN: "tin"
}

const QUERY_ROOTS = {
    controller: "controller",
    parent: "parent",
    self: "self"
}
/**
 * Html attribute name constants
 *
 * mostly straightforward with the notable exceptions:
 *  - {@link ION_CONST#error#append} variable append strategy - que root of the css query
 *  - {@link ION_CONST#error#queries}:
 *    - {@link ION_CONST#error#queries#query} the media query that while be made via {@link HTMLElement#querySelectorAll}
 *    - {@link ION_CONST#error#queries#variables} variables that will be set/unset:
 *       the keys will be concatenated with '--' eg: key => element.style.setProperty('--' + key, variables[key].set)
 *
 *       The placeholder ${name} can be used to mark the field's name
 */
const ION_CONST = {
    name_key: "name",
    type_key: "type",
    required_key: "required",
    max_length: "maxlength",
    min_length: "minlength",
    max_value: "max",
    min_value: "min",
    input_tag: "ion-input",
    error: {
        queries: [
            {
                query: "ion-input",
                root: "parent",
                variables: [
                    {
                        variable: "--color",
                        set: "var(--ion-color-danger)",
                        unset: "var(--ion-color)"
                    }
                ]
            },
            {
                query: "",
                root: "parent",
                variables: [
                    {
                        variable: "--border-color",
                        set: "var(--ion-color-danger)",
                        unset: "var(--ion-color)"
                    }
                ]
            }
        ]
    }
}

/**
 * Maps prop names to their custom validation
 * @param {string} prop
 * @param {*} value
 * @returns {string|undefined} undefined if ok, the error otherwise
 */
const propToError = function(prop, value){
    switch (prop){
        case SUB_TYPES.TIN:
            return tinHasErrors(value);
        default:
            break;
    }
}

/**
 * Validates a pattern
 * @param {string} text
 * @param {pattern} pattern in the '//' notation
 * @returns {string|undefined} undefined if ok, the error otherwise
 */
const patternHasErrors = function(text, pattern){
    if (!text) return;
    if (!pattern.test(text))
        return "Field does not match pattern";
}

/**
 * @param {string} email
 * @returns {string|undefined} undefined if ok, the error otherwise
 */
const emailHasErrors = function(email){
    if (patternHasErrors(email, /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/))
        return "Invalid email";
}

/**
 * Validates a tin number
 * @param {string|number} tin
 * @returns {string|undefined} undefined if ok, the error otherwise
 */
const tinHasErrors = function(tin){
    if (!tin) return;
    tin = tin + '';
    if (patternHasErrors(tin,/^\d{9}$/))
        return "Not a valid Tin";
}

/**
 * Validates a number Field (only integers supported)
 * @param {number} value
 * @param props
 */
const numberHasErrors = function(value, props){
    if (props[ION_CONST.name_key] === SUB_TYPES.TIN)
        return tinHasErrors(value);
    let {max, min} = props;
    if (value > max)
        return `The maximum is ${max}`;
    if (value < min)
        return `The minimum is ${min}`;
}

/**
 * Validates a date value
 * @param {Date} date
 * @param props
 */
const dateHasErrors = function(date, props){
    throw new Error("Not implemented date validation");
}

/**
 * Validates a text value
 * @param {string} text
 * @param props
 */
const textHasErrors = function(text, props){
    if (props[ION_CONST.name_key] === SUB_TYPES.TIN)
        return tinHasErrors(text);
}

/**
 * parses the numeric values
 * @param props
 */
const parseNumeric = function(props){
    let prop;
    try{
        for (prop in props)
            if (props.hasOwnProperty(prop) && props[prop])
                if ([ION_CONST.max_length, ION_CONST.max_value, ION_CONST.min_length, ION_CONST.min_value].indexOf(prop) !== -1)
                    props[prop] = parseInt(props[prop]);
    } catch (e){
        throw new Error(`Could not parse numeric validations attributes for field ${props.name} prop: ${prop}`);
    }
    return props;
}

/**
 * Parses the supported attributes in the element
 * @param {HTMLElement} element
 * @return the object of existing supported attributes
 */
const getValidationAttributes = function(element){
    return {
        type: element[ION_CONST.type_key],
        name: element[ION_CONST.name_key],
        required: element[ION_CONST.required_key],
        max: element[ION_CONST.max_value],
        maxlength: element[ION_CONST.max_length],
        min: element[ION_CONST.min_value],
        minlength: element[ION_CONST.max_length]
    };
}

/**
 * Validates a ion-input element for required & max/min length.
 * @param {HTMLElement} element
 * @param {object} props
 * @returns {string|undefined} undefined if ok, the error otherwise
 */
const hasRequiredAndLengthErrors = function(element, props){
    let {required, maxLength, minLength} = props;
    let value = element.value;
    value = value ? value.trim() : value;
    if (required && !value)
        return "Field is required";
    if (!value) return;
    if (minLength && value.length < minLength)
        return `The minimum length is ${minLength}`;
    if (maxLength && value.length > maxLength)
        return `The maximum length is ${minLength}`;
}

const testInputEligibility = function(props, prefix){
    return !(!props[ION_CONST.name_key] || !props[ION_CONST.type_key] || props[ION_CONST.name_key].indexOf(prefix) === -1);
}

/**
 * Test a specific type of Ionic input field for errors
 *
 * should (+/-) match the ion-input type property
 *
 * supported types:
 *  - email;
 *  - tin
 *  - text
 *  - number
 *
 * @param {HTMLElement} element the ion-input field
 * @param {string} prefix the prefix for the ion-input to be validated
 */
const hasIonErrors = function(element, prefix){
    let props = getValidationAttributes(element);
    if (!testInputEligibility(props, prefix))
        throw new Error(`input field ${element} with props ${props} does not meet criteria for validation`);
    props[ION_CONST.name_key] = props[ION_CONST.name_key].substring(prefix.length);
    let errors = hasRequiredAndLengthErrors(element, props);
    if (errors)
        return errors;

    let value = element.value;
    switch (props[ION_CONST.type_key]){
        case ION_TYPES.EMAIL:
            errors = emailHasErrors(value);
            break;
        case ION_TYPES.DATE:
            errors = dateHasErrors(value, props);
            break;
        case ION_TYPES.NUMBER:
            props = parseNumeric(props);
            errors = numberHasErrors(value, props);
            break;
        case ION_TYPES.TEXT:
            errors = textHasErrors(value, props);
            break;
        default:
            errors = undefined;
    }

    return errors;
}

/**
 * Until I get 2way data binding to work on ionic components, this solves it.
 *
 * It validates the fields via their ion-input supported properties for easy integration if they ever work natively
 *
 * If the input's value has changed, an event called 'input-has-changed' with the input name as data
 *
 * @param {WebcController} controller
 * @param {HTMLElement} element the ion-input element
 * @param {string} prefix prefix to the name of the input elements
 * @returns {string|undefined} undefined if ok, the error otherwise
 */
const updateModelAndGetErrors = function(controller, element, prefix){
    if (!controller.model)
        return;
    let name = element.name.substring(prefix.length);
    if (typeof controller.model[name] === 'object') {
        let valueChanged = controller.model[name].value !== element.value;
        controller.model[name].value = element.value;
        if (valueChanged){
            const hasErrors = hasIonErrors(element, prefix);
            controller.model[name].error = hasErrors;
            updateStyleVariables(controller, element, hasErrors);
            controller.send('input-has-changed', name);
            return hasErrors;
        }
        return controller.model[name].error;
    }
}

/**
 * Manages the inclusion/exclusion of the error variables according to {@link ION_CONST#error#variables} in the element according to the selected {@link ION_CONST#error#append}
 * @param {WebcController} controller
 * @param {HTMLElement} element
 * @param {string} hasErrors
 */
const updateStyleVariables = function(controller, element, hasErrors){
    let el, selected, q;
    const getRoot = function(root) {
        let elem;
        switch (root) {
            case QUERY_ROOTS.parent:
                elem = element.parentElement;
                break;
            case QUERY_ROOTS.self:
                elem = element;
                break;
            case QUERY_ROOTS.controller:
                elem = controller.element;
                break;
            default:
                throw new Error("Unsupported Error style strategy");
        }
        return elem;
    }
    const queries = ION_CONST.error.queries;

    queries.forEach(query => {
        q = query.query.replace('${name}', element.name);
        el = getRoot(query.root);
        selected = q ? el.querySelectorAll(q) : [el];
        selected.forEach(s => {
            query.variables.forEach(v => {
                s.style.setProperty(v.variable, hasErrors ? v.set : v.unset)
            });
        });
    });
}

/**
 * iterates through all supported inputs and calls {@link updateModelAndGetErrors} on each.
 *
 * sends controller validation event
 * @param {WebcController} controller
 * @param {string} prefix
 * @return {boolean} if there are any errors in the model
 */
const controllerHasErrors = function(controller, prefix){
    let inputs = controller.element.querySelectorAll(`${ION_CONST.input_tag}[name^="${prefix}"]`);
    let errors = [];
    let error;
    inputs.forEach(el => {
        error = updateModelAndGetErrors(controller, el, prefix);
        if (error)
            errors.push(error);
    });
    let hasErrors = errors.length > 0;
    controller.send(hasErrors ? 'ion-model-is-invalid' : 'ion-model-is-valid');
    return hasErrors;
}

/**
 * When using ionic input components, this binds the controller for validation purposes.
 *
 * Inputs to be eligible for validation need to be named '${prefix}${propName}' where the propName must
 * match the type param in {@link hasErrors} via {@link updateModelAndGetErrors}
 *
 * Gives access to the validateIonic method on the controller via:
 * <pre>
 *     controller.hasErrors();
 * </pre>
 * (returns true or false)
 *
 * where all the inputs are validated
 *
 * call this only after the setModel call for safety
 * @param {WebcController} controller
 * @param {function()} [onValidModel] the function to be called when the whole Controller model is valid
 * @param {function()} [onInvalidModel] the function to be called when any part of the model is invalid
 * @param {string} [prefix] the prefix for the ion-input to be validated. defaults to 'input-'
 */
const bindIonicValidation = function(controller, onValidModel, onInvalidModel, prefix){
    if (typeof onInvalidModel === 'string' || !onInvalidModel){
        prefix = onInvalidModel
        onInvalidModel = () => {
            const submitButton = controller.element.querySelector('ion-button[type="submit"]');
            if (submitButton)
                submitButton.disabled = true;
        }
    }
    if (typeof onValidModel === 'string' || !onValidModel){
        prefix = onValidModel
        onValidModel = () => {
            const submitButton = controller.element.querySelector('ion-button[type="submit"]');
            if (submitButton)
                submitButton.disabled = false;
        }
    }

    prefix = prefix || 'input-';
    controller.on('ionChange', (evt) => {
        evt.preventDefault();
        evt.stopImmediatePropagation();
        let element = evt.srcElement;
        if (!element.name) return;
        let errors = updateModelAndGetErrors(controller, element, prefix);
        if (errors)     // one fails, all fail
            controller.send('ion-model-is-invalid');
        else            // Now we have to check all of them
            controllerHasErrors(controller, prefix);
    });

    controller.hasErrors = () => controllerHasErrors(controller, prefix);

    controller.on('ion-model-is-valid', (evt) => {
        evt.preventDefault();
        evt.stopImmediatePropagation();
        if (onValidModel)
            onValidModel.apply(controller);
    });

    controller.on('ion-model-is-invalid', (evt) => {
        evt.preventDefault();
        evt.stopImmediatePropagation();
        if (onInvalidModel)
            onInvalidModel.apply(controller);
    });
}

/**
 * Validates a Model element according to prop names
 * *Does not validate 'required' or more complex attributes yet*
 * TODO use annotations to accomplish that
 * @returns {string|undefined} undefined if ok, the error otherwise
 */
const modelHasErrors = function(model){
    let error;
    for (let prop in model)
        if (model.hasOwnProperty(prop)){
            if (prop in Object.values(ION_TYPES) || prop in Object.values(SUB_TYPES))
                error = propToError(prop, model[prop]);
            if (error)
                return error;
        }
}

/**
 * Provides the implementation for the Model to be validatable alongside Ionic components
 * via the {@link hasErrors} method
 */
class Validatable{
    /**
     * @see {modelHasErrors}
     */
    hasErrors(){
        return modelHasErrors(this);
    }
}

module.exports = {
    Validatable,
    bindIonicValidation,
    emailHasErrors,
    tinHasErrors,
    textHasErrors,
    numberHasErrors
};
},{}],"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/model/index.js":[function(require,module,exports){
/**
 * @module pdm-dsu-toolkit.model
 */
module.exports = {
    Validations: require('./Validations'),
    Utils: require('./Utils')
}

},{"./Utils":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/model/Utils.js","./Validations":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/model/Validations.js"}],"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/services/DSUService.js":[function(require,module,exports){
/**
 * @module fgt-dsu-wizard.services
 */
const utils = require("./utils.js");
//const scriptUtils = require('../utils.js');
const doPost = utils.getPostHandlerFor("dsu-wizard");

function getEnv(){
    return $$.environmentType;
}

if (getEnv() === 'nodejs')
    FormData = require('form-data');    // needed because nodejs does not have FormData. we can remove it after testing

class DSUService {
    constructor() {
        let openDSU = require('opendsu');
        let crypto = openDSU.loadApi("crypto");
        let http = openDSU.loadApi("http");
        this.keyssiSpace = openDSU.loadApi('keyssi');

        // http.registerInterceptor((data, callback)=>{
        //     let {url, headers} = data;
        //     let scope = "";
        //
        //     if(typeof this.holderInfo != "undefined"){
        //         crypto.createPresentationToken(this.holderInfo.ssi, scope, this.credential, (err, presentationToken)=>{
        //             if(err){
        //                 return callback(err);
        //             }
        //
        //             headers["Authorization"] = presentationToken;
        //             return callback(undefined, {url, headers});
        //         });
        //     }else {
        //         console.log("Unexpected case");
        //         return callback(undefined, {url, headers});
        //     }
        //
        // });
    }

    // ensureHolderInfo(callback) {
    //     function getJSON(pth, callback){
    //         scriptUtils.fetch(pth).then((response) => {
    //             return response.json();
    //         }).then((json) => {
    //             return callback(undefined, json)
    //         }).catch(callback);
    //     }
    //
    //     if (typeof this.holderInfo === "undefined" || typeof this.credential === "undefined") {
    //         getJSON("/download/myKeys/holder.json", (err, holderInfo) => {
    //             if (err) {
    //                 return callback(Error("No holder info available!"));
    //             }
    //             this.holderInfo = holderInfo;
    //
    //             getJSON("/download/myKeys/credential.json", (err, result) => {
    //                 if (err) {
    //                     return callback(Error("No credentials available!"));
    //                 }
    //                 this.credential = result.credential;
    //                 return callback(undefined, holderInfo);
    //             });
    //         });
    //     } else {
    //         callback(undefined, this.holderInfo);
    //     }
    // }

    /**
     * This callback is displayed as part of the DSUService class.
     * @callback DSUService~callback
     * @param {string|object|undefined} error
     * @param {string|undefined} [keySSI]: not in human readable form
     */

    /**
     * This function is called by DSUService class to initialize/update DSU Structure.
     * @callback DSUService~modifier
     * @param {DSUBuilder} dsuBuilder
     * @param {DSUService~callback} callback
     */

    /**
     * Creates a DSU and initializes it via the provided initializer
     * @param {string} domain: the domain where the DSU is meant to be stored
     * @param {string|object} keySSIOrEndpoint: the keySSI string or endpoint object {endpoint: 'gtin', data: 'data'}
     * @param {DSUService~modifier} initializer: a method with arguments (dsuBuilder, callback)
     * <ul><li>the dsuBuilder provides the api to all operations on the DSU</li></ul>
     * @param {DSUService~callback} callback: the callback function
     */
    create(domain, keySSIOrEndpoint, initializer, callback){
        let self = this;
        let simpleKeySSI = typeof keySSIOrEndpoint === 'string';

        self.getTransactionId(domain, (err, transactionId) => {
            if (err)
                return callback(err);

            let afterKeyCb = function(err){
                if (err)
                    return callback(err);

                initializer(self.bindToTransaction(domain, transactionId), err => {
                    if (err)
                        return callback(err);
                    self.buildDossier(transactionId, domain, (err, keySSI) => {
                        if (err)
                            return callback(err);
                        callback(undefined, self.keyssiSpace.parse(keySSI));
                    });
                });
            };

            if (simpleKeySSI){
                self.setKeySSI(transactionId, domain, keySSIOrEndpoint, afterKeyCb);
            } else {
                self.setCustomSSI(transactionId, domain, keySSIOrEndpoint.endpoint, keySSIOrEndpoint.data, afterKeyCb);
            }
        });
    }

    /**
     * Creates a DSU and initializes it via the provided initializer
     * @param {string} domain: the domain where the DSU is meant to be stored
     * @param {keySSI} keySSI:
     * @param {DSUService~modifier} modifier: a method with arguments (dsuBuilder, callback)
     * <ul><li>the dsuBuilder provides the api to all operations on the DSU</li></ul>
     * @param {DSUService~callback} callback: the callback function
     */
    update(domain, keySSI, modifier, callback){
        let self = this;
        self.getTransactionId(domain, (err, transactionId) => {
           if (err)
               return callback(err);
           self.setKeySSI(transactionId, domain, keySSI, err =>{
               if (err)
                   return callback(err);
               modifier(self.bindToTransaction(domain, transactionId), (err, keySSI) => {
                    if (err)
                        return callback(err);
                    callback(undefined, keySSI);
               });
           });
        });
    }

    /**
     * Binds the DSU<service to the transaction and outputs a DSUBuilder
     * @param {string} domain
     * @param {string} transactionId
     * @returns {DSUBuilder} the dsu builder
     */
    bindToTransaction(domain, transactionId){
        let self = this;
        /**
         * Wrapper class around DSUService with binded transactionId and domain
         */
        return new class DSUBuilder {
            /**
             * @see {@link DSUService.addFileDataToDossier} with already filled transactionId and domain
             */
            addFileDataToDossier(fileName, fileData, callback){
                self.addFileDataToDossier(transactionId, domain, fileName, fileData, callback);
            };
            /**
             * @see {@link DSUService.mount} with already filled transactionId and domain
             */
            mount(path, seed, callback){
                self.mount(transactionId, domain, path, seed, callback);
            };
        }
    }

    getTransactionId(domain, callback) {

        let obtainTransaction = ()=>{
            doPost(`/${domain}/begin`, '',(err, transactionId) => {
                if (err)
                    return callback(err);

                return callback(undefined, transactionId);
            });
        }

        // this.ensureHolderInfo( (err)=>{
        //     if(err){
        //         return OpenDSUSafeCallback(callback)(createOpenDSUErrorWrapper("Holder missconfiguration in the wallet", err));
        //     }
            obtainTransaction();
        // });
    }

    setKeySSI(transactionId, domain, keyssi, callback) {
        const url = `/${domain}/setKeySSI/${transactionId}`;
        doPost(url, keyssi, callback);
    }

    setCustomSSI(transactionId, domain, endpoint, data, callback){
        const url = `/${domain}/${endpoint}/${transactionId}`;
        doPost(url, JSON.stringify(data), callback);
    }

    addFileDataToDossier(transactionId, domain, fileName, fileData, callback) {
        const url = `/${domain}/addFile/${transactionId}`;

        if (fileData instanceof ArrayBuffer) {
            fileData = new Blob([new Uint8Array(fileData)], {type: "application/octet-stream"});
        }
        let body = new FormData();
        let inputType = "file";
        body.append(inputType, fileData);

        doPost(url, body, {headers: {"x-dossier-path": fileName}}, callback);
    }

    mount(transactionId, domain, path, seed, callback) {
        const url = `/${domain}/mount/${transactionId}`;
        doPost(url, "", {
            headers: {
                'x-mount-path': path,
                'x-mounted-dossier-seed': seed
            }
        }, callback);
    }

    buildDossier(transactionId, domain, callback) {
        const url = `/${domain}/build/${transactionId}`;
        doPost(url, "", callback);
    }
}

module.exports = DSUService;

},{"./utils.js":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/services/utils.js","form-data":false,"opendsu":false}],"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/services/ParticipantService.js":[function(require,module,exports){
/**
 * @module fgt-dsu-wizard.services
 */
 const {INBOX_MOUNT_PATH, INFO_PATH, PUBLIC_ID_MOUNT_PATH} = require('../constants');
 const utils = require('./utils');

/**
 * @param {string} domain: anchoring domain. defaults to 'default'
 * @param {strategy} strategy
 */
function ParticipantService(domain, strategy){
    const strategies = require('./strategy');

    let isSimple = strategies.SIMPLE === (strategy || strategies.SIMPLE);
    domain = domain || "default";

    /**
     * Creates an Participant's DSU, including the const and MQ.
     * @param {Participant} participant
     * @param {function(err, participantKeySSI)} callback
     */
    this.create = function(participant, callback){
        if (typeof callback != "function")
            throw new Error("callback must be a function!");
        if (isSimple){
            createSimple(participant, inbox, callback);
        } else {
            throw new Error("Not implemented"); // createAuthorized(order, callback);
        }
    }

    let createSimple = function (participant, inbox, callback) {

    };

    /**
     * Locate the const DSU of a participant, given the id.
     * @param {string} id - a Participant.id
     * @param {function(err, participantConstDsu)} callback
     */
    this.locateConstDSU = function(id, callback) {
        const opendsu = require("opendsu");
        const resolver = opendsu.loadApi("resolver");
        const participantConstKeyGenFunction = require('../commands/setParticipantConstSSI').createParticipantConstSSI;
        const participantConstKeySSI = participantConstKeyGenFunction({id: id}, domain);
        resolver.loadDSU(participantConstKeySSI, (err, participantConstDsu) => {
            if (err)
                return callback(err);
            callback(undefined, participantConstDsu);
        });
    };
}

module.exports = ParticipantService;
},{"../commands/setParticipantConstSSI":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/commands/setParticipantConstSSI.js","../constants":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/constants.js","./strategy":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/services/strategy.js","./utils":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/services/utils.js","opendsu":false}],"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/services/WebcLocaleService.js":[function(require,module,exports){
/**
 * @module fgt-dsu-wizard.services
 */

/**
 * Integrates with {@link WebCardinal}'s translation model, and natively integrates into controllers
 */
function LocaleService(){
    if (!WebCardinal)
        throw new Error("Could not find WebCardinal");

    const supported = [];

    const getLocale = () => WebCardinal.language;

    const setLocale = (locale) => {
        if (!(locale in supported))
            throw new Error("Provided locale not supported");
        WebCardinal.language = locale;
        this.loadLocale();
    }

    const _genSupported = () => {
        Object.keys(WebCardinal.translations).forEach(a => {
            supported.push(a);
        })
    };

    _genSupported();

    /**
     * Loads the current locale
     */
    this._loadLocale = function(){
        return WebCardinal.translations[getLocale()];
    }

    /**
     * Retrieves the translation information from WebCardinal
     * @param {string} pageName if contains '.' it will be translated into hierarchy in json object (just one level currently supported)
     * @returns {object} the translation object for the provided page in the current language
     */
    this.getByPage = function(pageName){
        let locale = this._loadLocale();
        if (!locale){
            console.log("no locale set");
            return {};
        }

        if (pageName[0] !== "/")
            pageName = "/" + pageName;
        if (pageName.includes(".")){
            let temp = pageName.split(".");
            return locale[temp[0]][temp[1]];
        }
        return locale[pageName];
    }
}

const merge = function(target, source){
    for (const key of Object.keys(source))
        if (source[key] instanceof Object)
            Object.assign(source[key], merge(target[key] ? target[key] : {}, source[key]))
    Object.assign(target || {}, source)
    return target;
}

const bindToController = function(controller, page){
    if (!controller.localized) {
        let getter = controller.getModel;
        controller.getModel = () => {
            let locale = localeService.getByPage(page);
            if (!locale){
                console.log(`No translations found for page ${page}`);
                return getter();
            }
            locale = JSON.parse(JSON.stringify(locale));
            let model = getter();
            return merge(locale, model);
        };
        controller.localized = true;
    }
}

let localeService;

module.exports = {
    /**
     * Returns the instance of the LocaleService and binds the locale info to the controller via {@link bindToController}
     * @param {WebcController} controller: the current controller
     * @param {string} page: the name of the view. Must match an existing key in {@link WebCardinal#translations}
     * @returns {LocaleService}
     */
    bindToLocale: function (controller, page){
        if (!localeService)
            localeService = new LocaleService();
        bindToController(controller, page);
        return localeService;
    }
}
},{}],"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/services/dt/AppBuilderService.js":[function(require,module,exports){
/**
 * @module pdm-dsu-toolkit.services
 */
'use strict';

const FileService = require("./FileService");

const DSU_SPECIFIC_FILES = ["dsu-metadata.log", "manifest"]

const OPTIONS = {
    anchoring: "default",
    publicSecretsKey: '$Identity',
    basePath: "",
    hostsKey: require('opendsu').constants.BDNS_ROOT_HOSTS,
    hint: undefined,
    vault: "vault",
    seedFileName: "seed",
    appsFolderName: "apps",
    codeFolderName: "code",
    initFile: "init.file",
    environment: {},
    slots:{
        primary: "wallet-patch",
        secondary: "apps-patch"
    }
}

const envToOptions = function(env){
    let options = Object.assign({}, OPTIONS);
    options.environemnt = env;
    options.vault = env.vault;
    options.anchoring = env.domain;
    options.basePath = env.basePath;
    return options;
}

/**
 * @param {object} environment defaults to {@link OPTIONS}. is Overridden by provided values
 */
function AppBuilderService(environment) {
    const options = envToOptions(environment);
    let keyssi = require('opendsu').loadApi('keyssi')

    const dossierBuilder = new (require("./DossierBuilder").DossierBuilder);
    const resolver = require('opendsu').loadApi('resolver');

    const fileService = new FileService(options);

    const contentToCommands = function(files, mounts){
        let commands = [];
        files.forEach(f => {
            commands.push(`addfile ${f} ${f}`);
        });
        mounts.forEach(m => {
            commands.push(`mount ${m.identifier} ${m.path}`);
        });
        return commands;
    }

    /**
     * Lists a DSUs content
     * @param {Archive} dsu
     * @param {function(err, files, mounts)} callback
     * @private
     */
    const getDSUContent = function (keySSI, callback) {
        resolver.loadDSU(keySSI, (err, dsu) => {
            dsu.listFiles("/", {ignoreMounts: true}, (err, files) => {
                if (err)
                    return callback(`Could not retrieve DSU content: ${err}`);
                dsu.listMountedDSUs("/", (err, mounts) => {
                    if (err)
                        return callback(`Could not retrieve DSU mounts: ${err}`);
                    callback(undefined, files.filter(f => {
                        return DSU_SPECIFIC_FILES.indexOf(f) === -1;
                    }), mounts, dsu);
                });
            });
        });
    }

    /**
     * Creates an Arrays SSI off a secret list
     *
     * Adds options.hint to hit if available
     * @param {string[]} secrets
     * @param {function(err, ArraySSI)} callback
     */
    const createArraySSI = function(secrets, callback){
        const key = keyssi.createArraySSI(options.anchoring, secrets, 'v0', options.hint ? JSON.stringify(options.hint) : undefined);
        callback(undefined, key);
    }

    /**
     * Creates a Wallet SSI off a secret list
     *
     * Adds options.hint to hit if available
     * @param {string[]} secrets
     * @param {function(err, ArraySSI)} callback
     */
    const createWalletSSI = function(secrets, callback){
        const key = keyssi.createTemplateWalletSSI(options.anchoring, secrets, 'v0', options.hint ? JSON.stringify(options.hint) : undefined);
        callback(undefined, key);
    }

    /**
     * Creates an Arrays SSI off a secret list
     *
     * Adds options.hint to hit if available
     * @param {string} specificString
     * @param {function(err, TemplateSeedSSI)} callback
     */
    const createSSI = function(specificString, callback){
        const key = keyssi.createTemplateSeedSSI(options.anchoring, specificString, undefined, 'v0', options.hint ? JSON.stringify(options.hint) : undefined);
        callback(undefined, key);
    }

    /**
     * Converts The contents of the dsuToClone to Commands, recognizable by OpenDSU's DossierBuilder,
     * and using those commands copies all contents into the destinationDSU
     * @param {Archive} dsuToClone
     * @param {Archive} destinationDSU
     * @param {string[]} files
     * @param {object[]} mounts
     * @param {object} [cfg] optional. if passed will be write to /cfg in DSU
     * @param {function(err, KeySSI)} callback
     */
    const doClone = function(dsuToClone, destinationDSU, files, mounts, cfg, callback){
        if (typeof cfg === 'function'){
            callback = cfg;
            cfg = undefined;
        }
        const commands = contentToCommands(files, mounts);
        if (cfg)
            commands.push("createfile cfg " + JSON.stringify(cfg));
        const dossierBuilder = new DossierBuilder(dsuToClone);
        dossierBuilder.buildDossier(destinationDSU, commands, callback);
    }

    /**
     * Creates a DSU of an ArraySSI
     * @param {string[]} secrets
     * @param {function(err, Archive)} callback
     */
    const createWalletDSU = function(secrets, callback){
        createWalletSSI(secrets, (err, keySSI) => {
            resolver.createDSUForExistingSSI(keySSI, (err, dsu) => {
                if (err)
                    return callback(`Could not create const DSU ${err}`);
                callback(undefined, dsu);
            });
        });
    }

    /**
     * Creates a DSU of an ArraySSI
     * @param {string} specific String for Seed SSI
     * @param {function(err, Archive)} callback
     */
    const createDSU = function(specific, callback){
        createSSI(specific, (err, keySSI) => {
            resolver.createDSU(keySSI, (err, dsu) => {
                if (err)
                    return callback(`Could not create const DSU ${err}`);
                callback(undefined, dsu);
            });
        });
    }

    /**
     * Creates a DSU of an ArraySSI
     * @param {string[]} secrets
     * @param {function(err, Archive)} callback
     */
    const createConstDSU = function(secrets, callback){
        createArraySSI(secrets, (err, keySSI) => {
            resolver.createDSUForExistingSSI(keySSI, (err, dsu) => {
                if (err)
                    return callback(`Could not create const DSU ${err}`);
                callback(undefined, dsu);
            });
        });
    }

    const getDSUFactory = function(isConst, isWallet){
        return isConst ? (isWallet ? createWalletDSU : createConstDSU) : createDSU;
    }

    /**
     * Creates a new DSU (Const or not) and clones the content another DSU into it
     * @param {object|string} arg can be a secrets object or a string depending on if it's a const DSU or not. A secrets object is like:
     * <pre>
     *     {
     *         secretName: {
     *             secret: "...",
     *             public: (defaults to false. If true will be made available to the created DSU for use of initialization Scripts)
     *         },
     *         (...)
     *     }
     * </pre>
     * @param {KeySSI} keyForDSUToClone
     * @param {boolean} [isConst] decides if the Created DSU is Const or not. defaults to true
     * @param {function(err, KeySSI)} callback
     */
    this.clone = function (arg, keyForDSUToClone, isConst, callback) {
        if (typeof isConst === 'function'){
            callback = isConst;
            isConst = true;
        }

        getDSUContent(keyForDSUToClone, (err, files, mounts, dsuToClone) => {
            if (err)
                return callback(err);
            console.log(`Loaded Template DSU with key ${keyForDSUToClone}:\nmounts: ${mounts}`);

            let specificArg = arg;
            let publicSecrets = undefined;
            if (isConst){
                specificArg = [];
                publicSecrets = {};
                Object.entries(arg).forEach(e => {
                    if (e[1].public)
                        publicSecrets[e[0]] = e[1].secret;
                    specificArg.push(e[1].secret);
                });
            }

            getDSUFactory(isConst)(specificArg, (err, destinationDSU) => {
                if (err)
                    return callback(err);
                doClone(dsuToClone, destinationDSU, files, mounts,  publicSecrets,(err, keySSI) => {
                    if (err)
                        return callback(err);
                    console.log(`DSU ${keySSI} as a clone of ${keyForDSUToClone} was created`);
                    // if (publicSecrets)
                    //     return writeToCfg(destinationDSU, publicSecrets, err => callback(err, keySSI));
                    callback(undefined, keySSI);
                });
            });
        });
    }

    const _getPatchContent = function(appName, callback){
        fileService.getFolderContentAsJSON(appName, (err, content) => {
           if (err)
               return callback(err);
           try {
               content = JSON.parse(content);
           } catch (e) {
               return callback(`Could not parse content`);
           }
            content['/'][options.seedFileName] = undefined;
            delete content['/'][options.seedFileName];

           callback(undefined, content);
        });
    }

    const filesToCommands = (content) => {
        let commands = [];
        for (let directory in content){
            let directoryFiles = content[directory];
            for (let fileName in directoryFiles)
                commands.push(`createfile ${directory}/${fileName} ${directoryFiles[fileName]}`);

        }
        return commands;
    }

    /**
     * Copies the patch files from the path folder onto the DSU
     * @param {Archive} dsu
     * @param {string} slotPath should be '{@link OPTIONS.slots}[/appName]' when appName is required
     * @param {function(err, Archive, KeySSI)} callback
     */
    const patch = function(dsu, slotPath, callback) {
        // Copy any files found in the RESPECTIVE PATCH FOLDER on the local file system
        // into the app's folder
        _getPatchContent(slotPath, (err, files) => {
            if (err)
                return callback(err);
            let commands = filesToCommands(files);
            if (!commands || commands.length === 0){
                console.log(`Application ${slotPath} does not require patching`);
                return callback(undefined, dsu);
            }

            dossierBuilder.buildDossier(dsu, commands, (err, keySSI) => {
                if (err)
                    return callback(err);
                console.log(`Application ${slotPath} successfully patched`);
                callback(undefined, dsu, keySSI);
            });
        });
    }

    /**
     * Reads from {@link OPTIONS.initFile} and executes the commands founds there via {@link DossierBuilder#buildDossier}
     * @param {Archive} instance
     * @param {object} publicSecrets what elements of the registration elements should be passed onto the SSApp
     * @param {function(err, Archive)} callback
     */
    const initializeInstance = function(instance, publicSecrets, callback){
        instance.readFile(`${options.codeFolderName}/${options.initFile}`, (err, data) => {
            if (err) {
                console.log(`No init file found. Initialization complete`);
                return callback(undefined, instance);
            }
            let commands = (publicSecrets
                    ? data.toString().replace(options.publicSecretsKey, JSON.stringify(publicSecrets))
                    : data.toString())
                .split('\\n\\r?');
            dossierBuilder.buildDossier(instance, commands, (err, keySSI) => {
                if (err)
                   return callback(`Could not initialize SSApp instance: ${err}`);
                console.log(`Instance successfully initialized: ${keySSI}`);
                callback(undefined, instance);
            });
        });
    }

    /**
     * Parser the secrets object according to if its a wallet or not
     * @param {boolean} isWallet
     * @param {object|string} secrets can be a secrets object or a string depending on if it's a wallet or not. A secrets object is like:
     * <pre>
     *     {
     *         secretName: {
     *             secret: "...",
     *             public: (defaults to false. If true will be made available to the created DSU for use of initialization Scripts)
     *         },
     *         (...)
     *     }
     * </pre>
     * @param {function(err, keyGenArgs, publicSecrets)} callback
     */
    const parseSecrets = function(isWallet, secrets, callback){
        let specificArg = secrets;
        let publicSecrets = undefined;
        if (isWallet && typeof secrets === 'object'){
            specificArg = [];
            publicSecrets = {};
            Object.entries(secrets).forEach(e => {
                if (e[1].public)
                    publicSecrets[e[0]] = e[1].secret;
                specificArg.push(e[1].secret);
            });
        }
        callback(undefined, specificArg, publicSecrets);
    }

    /**
     * Builds an SSApp
     * @param {boolean} isWallet
     * @param {object|string} secrets according to {@link parseSecrets}
     * @param {string} seed
     * @param {string} [name]
     * @param {function(err, KeySSI, Archive)} callback
     */
    const buildApp = function(isWallet, secrets, seed, name, callback){
        if (typeof name === 'function'){
            if (!isWallet)
                return callback(`No SSApp name provided`);
            callback = name;
            name = undefined;
        }

        parseSecrets(isWallet, secrets, (err, keyArgs, publicSecrets) => {
            if (err)
                return callback(err);
            getDSUFactory(isWallet, isWallet)(keyArgs, (err, instance) => {
                if (err)
                    return callback(`Could not create instance`);
                instance.mount(`/${options.codeFolderName}`, seed, (err) => {
                    if (err)
                        return callback(`Could not mount Application code in instance: ${err}`);

                    const patchPath = isWallet ? `${options.slots.primary}` : `${options.slots.secondary}/${name}`;

                    patch(instance, patchPath, (err) => {
                        if (err)
                            return callback(`Error patching SSApp ${name}: ${err}`);
                        initializeInstance(instance, publicSecrets, (err) => {
                            if (err)
                                return callback(err);
                            instance.getKeySSIAsString((err, keySSI) => {
                                if (err)
                                    return callback(err);
                                callback(undefined, keySSI, instance);
                            });
                        });
                    });
                });
            });
        });
    }

    /**
     * Retrieves the list of Applications to be installed
     * @param {function(err, object)} callback
     */
    const getListOfAppsForInstallation = (callback) => {
        fileService.getFolderContentAsJSON(options.slots.secondary, function (err, data) {
            if (err){
                console.log(`No Apps found`)
                return callback(undefined, {});
            }

            let apps;

            try {
                apps = JSON.parse(data);
            } catch (e) {
                return callback(`Could not parse App list`);
            }

            callback(undefined, apps);
        });
    };

    /**
     * Installs all aps in the apps folder in the wallet
     * @param {Archive} wallet
     * @param {function(err, object)} callback returns the apps details
     */
    const installApps = function(wallet, callback){
        const performInstallation = function(wallet, apps, appList, callback){
            if (!appList.length)
                return callback(undefined, apps);
            let appName = appList.pop();
            const appInfo = apps[appName];

            if (appName[0] === '/')
                appName = appName.replace('/', '');

            const mountApp = (newAppSeed) => {
                wallet.mount(`/${options.appFolderName}/${appName}`, newAppSeed, (err) => {
                    if (err)
                        return callback("Failed to mount in folder" + `/apps/${appName}: ${err}`);

                    performInstallation(wallet, apps, appList, callback);
                });
            };

            // If new instance is not demanded just mount (leftover code from privatesky.. when is it not a new instance?)
            if (appInfo.newInstance === false)
                return mountApp(appInfo.seed);

            buildApp(false, undefined, appInfo.seed, appName, (err, keySSI) => {
                if (err)
                    return callback(`Failed to build app ${appName}: ${err}`);
                mountApp(keySSI);
            });
        }

        getListOfAppsForInstallation((err, apps) => {
            if (err)
                return callback(err);
            apps = apps || {};
            let appList = Object.keys(apps).filter(n => n !== '/');
            performInstallation(wallet, apps, appList, (err) => {
                if (err)
                    return callback(`Could not complete installations: ${err}`);
                callback(undefined, wallet);
            });
        });
    }

    /**
     * Builds a new SSApp from the provided secrets
     * @param {KeySSI} seed the SSApp's keySSI
     * @param {string} name the SSApp's name
     * @param {function(err, KeySSI, Archive)} callback
     */
    this.buildSSApp = function(seed, name, callback){
        return buildApp(false, seed, name, callback);
    }

    /**
     * Builds a new Wallet from the provided secrets
     * @param {object|string} secrets according to {@link parseSecrets}
     * @param {function(err, KeySSI, Archive)} callback
     */
    this.buildWallet = function(secrets, callback){
        fileService.getWalletSeed((err, seed) => {
            if (err)
                return callback(`Could not retrieve template wallet SSI: ${err}`);
            buildApp(true, secrets, seed, (err, keySSI, wallet) => {
                if (err)
                    return callback(`Could not build wallet: ${err}`);
                console.log(`Wallet built with SSI ${keySSI}`);
                installApps(wallet, (err, apps) => {
                    if (err)
                        return callback(err);
                    if (Object.keys(apps).length)
                        console.log(`Applications installed successfully`);
                    callback(undefined, keySSI, wallet);
                })
            });
        });
    }
}
module.exports = AppBuilderService;
},{"./DossierBuilder":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/services/dt/DossierBuilder.js","./FileService":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/services/dt/FileService.js","opendsu":false}],"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/services/dt/DossierBuilder.js":[function(require,module,exports){
const OPERATIONS = {
    DELETE: "delete",
    ADD_FOLDER: "addfolder",
    ADD_FILE: "addfile",
    CREATE_FILE: "createfile",
    MOUNT: "mount",
    CREATE_AND_MOUNT: "createandmount"
}

const KEY_TYPE = {
    CONST: "const",
    SEED: "seed"
}

/**
 * Automates the Dossier Building process
 * Call via
 * <pre>
 *     builder.buildDossier(config, commands, callback)
 * </pre>
 * where the config is as follows (this config is generated by the buildDossier script in octopus given the proper commands):
 * <pre>
 *     {
 *          "seed": "./seed",
 *          "domain": "default",
 *     }
 * </pre>
 * For a Simple SSApp (with only mounting of cardinal/themes and creation of code folder) the commands would be like:
 * <pre>
 *     delete /
 *     addfolder code
 *     mount ../cardinal/seed /cardinal
 *     mount ../themes/'*'/seed /themes/'*'
 * </pre>
 * @param {Archive} [sourceDSU] if provided will perform all OPERATIONS from the sourceDSU as source and not the fs
 */
const DossierBuilder = function(sourceDSU){
    let fs;

    const getFS = function(){
        if (!fs)
            fs = require('fs');
        return fs;
    }

    const openDSU = require("opendsu");
    const keyssi = openDSU.loadApi("keyssi");
    const resolver = openDSU.loadApi("resolver");

    /**
     * recursively executes the provided func with the dossier and each of the provided arguments
     * @param {Archive} dossier: The DSU instance
     * @param {function} func: function that accepts the dossier and one param as arguments
     * @param {any} arguments: a list of arguments to be consumed by the func param
     * @param {function} callback: callback function. The first argument must be err
     */
    let execute = function (dossier, func, arguments, callback) {
        let arg = arguments.pop();
        if (! arg)
            return callback();
        let options = typeof arg === 'object' && arg.options ? arg.options : undefined;
        func(dossier, arg, options, (err, result) => {
            if (err)
                return callback(err);

            if (arguments.length !== 0) {
                execute(dossier, func, arguments, callback);
            } else {
                callback(undefined, result);
            }
        });
    };

    let del = function (bar, path, options, callback) {
        if (typeof options === 'function'){
            callback = options;
            options = {}
        }
        options = options || {ignoreMounts: false};
        console.log("Deleting " + path);
        bar.delete(path, options, err => callback(err, bar));
    };

    let addFolder = function (folder_root = "/") {
        return function (bar, arg, options, callback){
            if (sourceDSU){
                console.log("The addFolder Method is not supported when cloning from a DSU");
                callback();
            }

            if (typeof options === 'function'){
                callback = options;
                options = {}
            }
            options = options || {batch: false, encrypt: false};
            console.log("Adding Folder " + folder_root + arg)
            bar.addFolder(arg, folder_root, options, err => callback(err, bar));
        };
    };

    /**
     * Creates a file with
     * @param bar
     * @param {object} arg:
     * <pre>
     *     {
     *         path: (...),
     *         content: (..)
     *     }
     * </pre>
     * @param options
     * @param callback
     */
    let createFile = function(bar, arg, options, callback){
        if (typeof options === 'function'){
            callback = options;
            options = {}
        }
        options = options || {encrypt: true, ignoreMounts: false};
        bar.writeFile(arg.path, arg.content, options, (err) => {
            if (err)
                return callback(`Could not create file at ${arg.path}: ${err}`);
            callback(undefined, bar);
        })
    }

    /**
     * Creates a dsu (const or not) and mounts it to the specified path
     * @param bar
     * @param {KEY_TYPE} type
     * @param {string} domain
     * @param {string} path
     * @param {object} args:
     * <pre>
     *     {
     *         forKey: (key gen args)
     *         commands: [
     *             (commands to run on created dsu)
     *         ]
     *     }
     * </pre>
     * @param {function(err, keySSI)} callback
     */
    let createAndMount = function(bar, type, domain, path, args, callback){
        let keyGenFunc, dsuFactory;
        switch(type){
            case KEY_TYPE.CONST:
                keyGenFunc = keyssi.createArraySSI;
                dsuFactory = resolver.createDSUForExistingSSI;
                break;
            case KEY_TYPE.SEED:
                keyGenFunc = keyssi.buildTemplateSeedSSI;
                dsuFactory = resolver.createDSU;
                break;
            default:
                throw new Error("Invalid type");
        }

        let keySSI = keyGenFunc(domain, args.forKey);
        dsuFactory(keySSI, (err, dsu) => {
           if (err)
               return callback(`Could not create dsu with keyssi ${keySSI}: ${err}`);

           const mountFunc = function(bar, key, callback){
               console.log(`DSU created with key ${key}`);
               bar.mount(path, key, (err) => {
                   if (err)
                       return callback(`Could not mount DSU: ${err}`);
                   callback(undefined, bar);
               });
           }

           if (args.commands && args.commands.length > 0){
               const dossierBuilder = new DossierBuilder();
               dossierBuilder.buildDossier(dsu, args.commands, (err, key) => {
                   if (err)
                       return callback(`Could not build Dossier: ${err}`)
                   mountFunc(bar, key, callback);
               })
           } else {
               dsu.getKeySSIAsString((err, key) => {
                   if (err)
                       return callback(err);
                   mountFunc(bar, key, callback);
               });
           }
        });
    }

    /**
     * Copies a file, from disk or another DSU
     * @param bar
     * @param arg
     * @param options
     * @param callback
     * @return {*}
     */
    let addFile = function (bar, arg, options, callback) {
        if (typeof options === 'function'){
            callback = options;
            options = {}
        }
        options = options || {encrypt: true, ignoreMounts: false}
        console.log("Copying file " + arg.from + (sourceDSU ? " from sourceDSU" : "") + " to " + arg.to);

        if (!sourceDSU)
            return bar.addFile(arg.from, arg.to, options, err => callback(err, bar));

        sourceDSU.readFile(arg.from, (err, data) => {
            if (err)
                return callback(err);
            bar.writeFile(arg.to, data, err =>{
                if (err)
                    return callback(`Could not write to ${arg.to}: ${err}`);
                callback(undefined, bar);
            });
        });
    };

    let mount = function (bar, arg, options, callback) {
        if (typeof options === 'function'){
            callback = options;
            options = undefined
        }

        const doMount = function(seed, callback){
            console.log("Mounting " + arg.seed_path + " with seed " + seed + " to " + arg.mount_point);
            bar.mount(arg.mount_point, seed, err => {
                if (err)
                    return callback(`Could not perform mount of ${seed} at ${arg.seed_path}: ${err}`);
                callback(undefined, bar)
            });
        };

        if (sourceDSU)
            return doMount(arg.seed_path, callback);

        readFile(arg.seed_path, (err, data) => {
            if (err)
                return callback(err);
            let seed = data.toString();
            doMount(seed, callback);
        });
    };

    /**
     * handles the difference between the mount arguments in the 2 cases (with/without sourceDSU)
     * @param arg
     * @param arguments
     * @return {*}
     * @private
     */
    let _transform_mount_arguments = function(arg, arguments){
        return sourceDSU
            ? arguments.map(m => {
                return {
                    "seed_path": m.identifier,
                    "mount_point": m.path
                }
            })
            : arguments.map(n => {
                return {
                    "seed_path": arg.seed_path.replace("*", n),
                    "mount_point": arg.mount_point.replace("*", n)
                };
            });
    }

    /**
     * Calls mount recursively
     * @param bar
     * @param arg
     * @param callback
     */
    let mount_folders = function (bar, arg, callback) {
        let base_path = arg.seed_path.split("*");
        const listFunc = sourceDSU ? sourceDSU.listMountedDSUs : getFS().readdir;
        listFunc(base_path[0], (err, arguments) => {
            if (err)
                return callback(`Could not list mounts: ${err}`);
            arguments = _transform_mount_arguments(arg, arguments);
            execute(bar, mount, arguments, callback);
        });
    };

    /**
     * Looks for the '*' pattern
     * @param bar
     * @param cmd
     * @param callback
     */
    let evaluate_mount = function(bar, cmd, callback){
        let arguments = {
            "seed_path": cmd[0],
            "mount_point": cmd[1]
        };

        if (!arguments.seed_path.match(/[\\/]\*[\\/]/))
            mount(bar, arguments, callback);             // single mount
        else
            mount_folders(bar, arguments, callback);     // folder mount
    };

    let createDossier = function (conf, commands, callback) {
        console.log("creating a new dossier...")
        resolver.createDSU(keyssi.createTemplateSeedSSI(conf.domain), (err, bar) => {
            if (err)
                return callback(err);
            updateDossier(bar, conf, commands, callback);
        });
    };

    /**
     * Reads from fs or dsu depending on the existence of a sourceDSU
     * @param {string} filePath
     * @param callback
     */
    let readFile = function (filePath, callback) {
        const readMethod = sourceDSU ? sourceDSU.readFile : getFS().readFile;
        readMethod(filePath, (err, data) => {
            if (err)
                return callback(`Could not read file at ${filePath}: ${err}`);
            return callback(undefined, sourceDSU ? data : data.toString());
        });
    };

    /**
     * Writes to a file on the filesystem
     * @param filePath
     * @param data
     * @param callback
     */
    let writeFile = function (filePath, data, callback) {
        if (sourceDSU)
            throw new Error("This method is not meant to be used here");

        getFS().writeFile(filePath, data, (err) => {
            if (err)
                return callback(err);
            callback(undefined, data.toString());
        });
    };

    /**
     * Stores the keySSI to the SEED file when no sourceDSU is provided
     * @param {string} seed_path the path to store in
     * @param {string} keySSI
     * @param {function(err, KeySSI)} callback
     */
    let storeKeySSI = function (seed_path, keySSI, callback) {
        writeFile(seed_path, keySSI, callback);
    };

    /**
     * Runs an operation
     * @param {Archive} bar
     * @param {string} command
     * @param {function(err, keySSI)} callback
     */
    let runCommand = function(bar, command, callback){
        let cmd = command.split(/\s+/);
        switch (cmd.shift().toLowerCase()){
            case OPERATIONS.DELETE:
                return execute(bar, del, cmd, callback);
            case OPERATIONS.ADD_FOLDER:
                return execute(bar, addFolder(), cmd, callback);
            case OPERATIONS.ADD_FILE:
                let arg = {
                    "from": cmd[0],
                    "to": cmd[1]
                }
                return addFile(bar, arg, callback);
            case OPERATIONS.MOUNT:
                return evaluate_mount(bar, cmd, callback);
            case OPERATIONS.CREATE_FILE:
                let cArg = {
                    path: cmd.shift(),
                    content: cmd.join(' ')
                }
                return createFile(bar, cArg, callback);
            case OPERATIONS.CREATE_AND_MOUNT:
                let type = cmd.shift();
                let domain = cmd.shift();
                let path = cmd.shift();
                let args = JSON.parse(cmd.join(' '));
                return createAndMount(bar, type, domain, path, args, callback);
            default:
                return callback(new Error("Invalid operation requested: " + command));
        }
    };

    /**
     * Retrieves the KeysSSi after save (when applicable)
     * @param {Archive} bar
     * @param {object} cfg is no sourceDSU is provided must contain a seed field
     * @param {function(err, KeySSI)} callback
     */
    let saveDSU = function(bar, cfg, callback){
        bar.getKeySSIAsString((err, barKeySSI) => {
            if (err)
                return callback(err);
            if(sourceDSU || cfg.skipFsWrite)
                return callback(undefined, barKeySSI);
            storeKeySSI(cfg.seed, barKeySSI, callback);
        });
    };

    /**
     * Run a sequence of {@link OPERATIONS} on the DSU
     * @param {Archive} bar
     * @param {object} cfg
     * @param {string[]} commands
     * @param {function(err, KeySSI)} callback
     */
    let updateDossier = function(bar, cfg, commands, callback) {
        if (commands.length === 0)
            return saveDSU(bar, cfg, callback);
        let cmd = commands.shift();
        runCommand(bar, cmd, (err, updated_bar) => {
            if (err)
                return callback(err);
            updateDossier(updated_bar, cfg, commands, callback);
        });
    };

    /**
     * Builds s DSU according to it's building instructions
     * @param {object|Archive} configOrDSU: can be a config file form octopus or the destination DSU when cloning.
     *
     *
     * Example of config file:
     * <pre>
     *     {
     *         seed: path to SEED file in fs
     *     }
     * </pre>
     * @param {string[]|object[]} [commands]
     * @param {function(err, KeySSI)} callback
     */
    this.buildDossier = function(configOrDSU, commands, callback){
        if (typeof commands === 'function'){
            callback = commands;
            commands = [];
        }

        let builder = function(keySSI){
            try {
                keySSI = keyssi.parse(keySSI);
            } catch (err) {
                console.log("Invalid keySSI");
                return createDossier(configOrDSU, commands, callback);
            }

            if (keySSI.getDLDomain() !== configOrDSU.domain) {
                console.log("Domain change detected.");
                return createDossier(configOrDSU, commands, callback);
            }

            resolver.loadDSU(keySSI, (err, bar) => {
                if (err){
                    console.log("DSU not available. Creating a new DSU for", keySSI);
                    return resolver.createDSU(keySII, {useSSIAsIdentifier: true}, (err, bar)=>{
                        if(err)
                            return callback(err);
                        updateDossier(bar, configOrDSU, commands, callback);
                    });
                }
                console.log("Dossier updating...");
                updateDossier(bar, configOrDSU, commands, callback);
            });
        }

        if (configOrDSU.constructor && configOrDSU.constructor.name === 'Archive')
            return updateDossier(configOrDSU, {skipFsWrite: true}, commands, callback);

        readFile(configOrDSU.seed, (err, content) => {
            if (err || content.length === 0)
                return createDossier(configOrDSU, commands, callback);
            builder(content.toString());
        });
    };
};

module.exports = {
    DossierBuilder,
    OPERATIONS
};

},{"fs":false,"opendsu":false}],"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/services/dt/FileService.js":[function(require,module,exports){
/**
 * @module pdm-dsu-toolkit.services
 */
function FileService(options) {
    let isBrowser;
    try{
        isBrowser = !!window;
    } catch (e){
        isBrowser = false;
    }

    function constructUrlBase(prefix){
        let url, protocol, host;
        prefix = prefix || "";
        let appName = '';
        if (isBrowser){
            let location = window.location;
            const paths = location.pathname.split("/");
            while (paths.length > 0) {
                if (paths[0] === "") {
                    paths.shift();
                } else {
                    break;
                }
            }
            appName = paths[0];
            protocol = location.protocol;
            host = location.host;
            url = `${protocol}//${host}/${prefix}${appName}`;
            return url;
        } else {
            return `${options.BDNS_ROOT_HOSTS}/${prefix}${appName}`;
        }
    }

    this.getWalletSeed = function(callback){
        this.getAppSeed(options.slots.primary, callback);
    }

    this.getAppSeed = function(appName, callback){
        this.getFile(appName, options.seedFileName, (err, data) => {
            if (err)
                return callback(err);
           Utf8ArrayToStr(data, callback);
        });
    }

    function doGet(url, options, callback){
        if (typeof options === "function") {
            callback = options;
            options = {};
        }

        if (isBrowser){
            const http = require("opendsu").loadApi("http");
            http.fetch(url, {
                method: 'GET'
            }).then((response) => {
                return response.arrayBuffer().then((data) => {
                    if (!response.ok){
                        console.log("array buffer not ok");
                        return callback("array data failed")
                    }
                    callback(undefined, data);
                }).catch(e => {
                    return callback(e);
                });
            }).catch(err => {
                return callback(err);
            });
        } else {
            require('fs').readFile(url, (err, data) => {
                if (err)
                    return callback(err);
                callback(undefined, data);
            });
        }
    }

    /**
     * Returns the content of a file as a uintArray
     * @param {string} appName
     * @param {string} fileName
     * @param {function(err, UintArray)} callback
     */
    this.getFile = function(appName, fileName, callback){
        let url = constructUrlBase() + `/${appName}/${fileName}`;
        doGet(url, callback);
    };


    this.getFolderContentAsJSON = function(innerFolder, callback){
        if (typeof innerFolder === 'function'){
            callback = innerFolder;
            innerFolder = undefined;
        }
        let url = constructUrlBase("directory-summary/") + (innerFolder ? `/${innerFolder}` : '') ;
        doGet(url, (err, data) => {
            if (err)
                return callback(err);
            Utf8ArrayToStr(data, callback);
        });
    }

    /**
     * @param array
     * @param {function(err, string)} callback
     */
    function Utf8ArrayToStr(array, callback) {
        var bb = new Blob([array]);
        var f = new FileReader();
        f.onload = function(e) {
            callback(undefined, e.target.result);
        };
        f.readAsText(bb);
    }
}

module.exports = FileService;
},{"fs":false,"opendsu":false}],"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/services/dt/index.js":[function(require,module,exports){
/*
html API space
*/

/**
 * Returns a DossierBuilder Instance
 * @param {Archive} [sourceDSU]
 * @return {DossierBuilder}
 */
const getDossierBuilder = (sourceDSU) => {
    return new (require("./DossierBuilder").DossierBuilder)(sourceDSU)
}

module.exports = {
    getDossierBuilder,
    Operations: require("./DossierBuilder").OPERATIONS,
    AppBuilderService: require('./AppBuilderService')
}

},{"./AppBuilderService":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/services/dt/AppBuilderService.js","./DossierBuilder":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/services/dt/DossierBuilder.js"}],"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/services/index.js":[function(require,module,exports){
/**
 * @module fgt-dsu-wizard.services
 */
module.exports = {
    DSUService: require('./DSUService'),
    WebcLocaleService: require('./WebcLocaleService'),
    ParticipantService: require('./ParticipantService'),
    Strategy: require('./strategy'),
    dt: require('./dt')
}
},{"./DSUService":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/services/DSUService.js","./ParticipantService":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/services/ParticipantService.js","./WebcLocaleService":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/services/WebcLocaleService.js","./dt":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/services/dt/index.js","./strategy":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/services/strategy.js"}],"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/services/strategy.js":[function(require,module,exports){
/**
 * @module fgt-dsu-wizard.services
 */
const strategy = {
    AUTHORIZED: "authorized",
    SIMPLE: "simple"
}

module.exports = strategy;
},{}],"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/services/utils.js":[function(require,module,exports){
/**
 * @module fgt-dsu-wizard.services
 */
let resolver, DSUService;

/**
 * for singleton use
 * @returns {*}
 */
function getResolver(){
	if (!resolver)
		resolver = require('opendsu').loadApi('resolver');
	return resolver;
}

/**
 * for singleton use
 * @returns {DSUService}
 */
function getDSUService(){
	if (!DSUService)
		DSUService = new (require('./DSUService'));
	return DSUService;
}

/**
 * Convenience method to select the appropriate resolver method to use depending on the key
 * @param keySSI
 * @returns {function} the appropriate resolver method for creating dsus {@link resolver#createDSU}/{@link resolver#createDSUForExistingSSI}
 */
function selectMethod(keySSI){
	if (['array', 'const'].indexOf(keySSI.getTypeName()) > -1)
		return getResolver().createDSUForExistingSSI;
	return getResolver().createDSU;
}

/**
 * Util method to recursively create folders from a list.
 * Useful to create mount folders
 * @param {Archive} dsu
 * @param {string[]} folders
 * @param {function(err, string[])} callback the folders there where actually created (didn't already exist)
 */
function createDSUFolders(dsu, folders, callback){
	let created = [];
	let iterator = function(folderList){
		let folder = folderList.shift();
		if (!folder)
			return callback(undefined, created);
		dsu.readDir(folder, (err, files) => {
			if (!err) {
				console.log(`Found already existing folder at ${folder}. No need to create...`)
				return iterator(folderList);
			}
			dsu.createFolder(folder, (err) => {
				if (err)
					return callback(err);
				created.push(folder);
				iterator(folderList);
			});
		});
	}
	iterator(folders.slice());
}

/**
 * Util Method to select POST strategy per DSU api.
 * - Copied from PrivateSky
 * - refactored for server side use compatibility in <strong>tests</strong>
 * @param {string} apiname
 * @returns {doPost} postHandler
 */
function getPostHandlerFor(apiname){

	function getBaseURL() {
		let protocol, host, port;
		try {
			protocol = window.location.protocol;
			host = window.location.hostname;
			port = window.location.port;

		} catch (e){
			// Only used in tests
			if (process.env.BDNS_ROOT_HOSTS)
				return `${process.env.BDNS_ROOT_HOSTS}/${apiname}`;
			protocol = "http:";
			host = "localhost";
			port = "8080";
		}

		return `${protocol}//${host}:${port}/${apiname}`;
	}

	function doPost(url, data, options, callback) {
		const http = require("opendsu").loadApi("http");
		if (typeof options === "function") {
			callback = options;
			options = {};
		}

		if (typeof data === "function") {
			callback = data;
			options = {};
			data = undefined;
		}

		const baseURL = getBaseURL();
		url = `${baseURL}${url}#x-blockchain-domain-request`
		http.doPost(url, data, options, (err, response) => {
			if (err)
				return callback(err);
			callback(undefined, response);
		});
	}
	return doPost;
}

module.exports = {
	getResolver,
	getDSUService,
	getPostHandlerFor,
	selectMethod,
	createDSUFolders
}

},{"./DSUService":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/services/DSUService.js","opendsu":false}]},{},["/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/builds/tmp/toolkit_intermediar.js"])
                    ;(function(global) {
                        global.bundlePaths = {"toolkit":"build/bundles/toolkit.js"};
                    })(typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
                