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

},{"./Utils":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/model/Utils.js","./Validations":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/model/Validations.js"}],"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/services/AppBuilderService.js":[function(require,module,exports){
/**
 * @module pdm-dsu-toolkit.services
 */
'use strict';

const FileService = require("./FileService");

const SLOTS = {
    PRIMARY: {
        getPath: function (appName) {
            return "wallet-patch";
        }
    },
    SECONDARY: {
        getPath: function (appName) {
            return `apps-patch/${appName}`
        }
    }
}

const OPTIONS = {
    vault: "vault",
    codeFolderName: "code",
    buildFolderName: "bin",
    slots:{
        primary: "wa"
    }
}

/**
 * @param {object} options:
 * <pre>
 *     {
 *         vault: "${vaultDomain}"
 *         codeFolder: "codeFolderName"
 *         buildFolder: "buildFolder"
 *     }
 * </pre>
 * @param {string} options.codeFolderName
 * @param {string} options.walletTemplateFolderName
 * @param {string} options.appFolderName
 * @param {string} options.appsFolderName
 */
function AppBuilderService(options) {
    options = options || {};
    if (!options.codeFolderName)
        throw new Error('Code folder name is required');
    if (!options.walletTemplateFolderName)
        throw new Error('The wallet template folder name is required');
    if (!options.appFolderName)
        throw new Error('The app folder name is required');
    if (!options.vault)
        throw new Error('The vault name is required');
    const CODE_FOLDER = options.codeFolderName;
    const WALLET_TEMPLATE_FOLDER = options.walletTemplateFolderName;
    const APP_FOLDER = options.appFolderName;
    const APPS_FOLDER = options.appsFolderName;
    const SSI_FILE_NAME = options.ssiFileName;
    const VAULT_DOMAIN = options.environmentDomain;

    this.walletTypeSeed = null;
    this.fileService = new FileService();
    let keyssi = require('opendsu').loadApi('keyssi')

    const dossierBuilder = require('opendsu').loadApi('dt').getDossierBuilder();
    const resolver = require('opendsu').loadApi('resolver');

    /**
     * Lists a DSUs content
     * @param {Archive} dsu
     * @param {function(err, content)}callback
     * @private
     */
    const _getDSUContent = function (dsu, callback) {
        dsu.listFiles("/", {recursive: true, ignoreMounts: false}, (err, content) => {
            if (err)
                return callback(`Could not retrieve DSU content: ${err}`);
            callback(undefined, content);
        })
    }

    /**
     * Loads a DSU and list its content
     * @param {KeySSI} keySSI
     * @param {function(err, content, Archive, commands)} callback
     * @private
     */
    const _keySSIToContent = function(keySSI, callback){
        resolver.loadDSU(keySSI, (err, template) => {
            if (err)
                return callback(err);
            console.log(`Loaded template DSU`);
            _getDSUContent(template, (err, templateContent) => {
                if (err)
                    return callback(err);
                console.log(`Template DSU content: ${templateContent}`);
                callback(undefined, templateContent, template);
            });
        });
    }


    /**
     * Reads the keySSI from the seed file the the app folder while in the workspace
     * @param {string} name the application name (the folder name under the workspace)
     * @param {string} domain the anchoring domain
     * @param {function(err, KeySSI)} callback
     */
    const getSSIFromAppName = function (name, domain, callback) {
        const seed = this.fileService.getFile(name, "seed", (err, file) => {
            if (err)
                return callback(err);
            let keySSI = keyssi.parse(file.toString());
            if (keySSI.getDLDomain() !== domain)
                return callback("Invalid Domain");
            callback(undefined, keySSI);
        });
    }

    /**
     * Clones contents of the DSU of the given keySSI to a new WalletDSU (const) generated with the
     * provided keyGenArray
     *
     * cfg:
     * <pre>
     *     {
     *        "seed": "./seed",
     *        "domain": "default",
     *        "bundles": "./../../privatesky/psknode/bundles",
     *        "config": "./bin/build.file"
     *     }
     * </pre>
     * @param {string[]} keyGenArray
     * @param {KeySSI} keySSI
     * @param {string} domain anchoring domain;
     * @param {function(err, KeySSI)}callback
     */
    const installAsWallet = function (keyGenArray, keySSI, domain, callback) {
        _keySSIToContent(keySSI, (err, content, templateDSU, commands) => {
            if (err)
                return callback(err);
            const walletsSSI = keyssi.createArraySSI(domain, keyGenArray, 'v0', undefined);
            const walletBuilder = dossierBuilder.getDSUFactory(true);
            walletBuilder({domain: domain}, );
        });

    }

    const instantiateWallet = function(keySSI, callback){

    }



    const deployToDSU = function () {

    }

    const getTemplateContent = function(keySSI, callback){
        let self = this;
        resolver.loadDSU(keySSI, (err, dsu) => {
            if (err)
                return callback(`Could not load DSU: ${err}`);
            _getDSUContent(dsu, (err, content) => {
                if (err)
                    return callback(err);
            });
        });
    }

    const cloneToConst = function (secretsArray, keyForDSUToClone, callback) {
        let self = this;
        _keySSIToContent(keyForDSUToClone, (err, content, dsu, commands) => {
            if (err)
                return callback(err);
            console.log(content);
            callback();
        });
    }



}

module.exports = AppBuilderService;
},{"./FileService":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/services/FileService.js","opendsu":false}],"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/services/DSUService.js":[function(require,module,exports){
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

},{"./utils.js":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/services/utils.js","form-data":false,"opendsu":false}],"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/services/FileService.js":[function(require,module,exports){
/**
 * @module pdm-dsu-toolkit.services
 */
function FileService() {

    function constructUrlBase(appName, prefix){

        const env = process.environmentType;
        console.log("ENV: --------" + env);
        let url, protocol, host;
        prefix = prefix || "";
        try {
            let location = window.location;
            const paths = location.pathname.split("/");
            while (paths.length > 0) {
                if (paths[0] === "") {
                    paths.shift();
                } else {
                    break;
                }
            }
            appName = appName || paths[0];
            protocol = location.protocol;
            host = location.host;
        } catch (e)
        {
            // Only used in tests
            if (process.env.BDNS_ROOT_HOSTS)
                return `${process.env.BDNS_ROOT_HOSTS}/${prefix}${appName}`;
            protocol = "http:";
            host = "localhost:8080";
        }
        url = `${protocol}//${host}/${prefix}${appName}`;
        return url;
    }

    function doGet(url, options, callback){
        const http = require("opendsu").loadApi("http");
        if (typeof options === "function") {
            callback = options;
            options = {};
        }

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
    }

    this.getFile = function(appName, url, callback){
        url = constructUrlBase(appName)+"/"+url;
        doGet(url, callback);
    };

    this.getFolderContentAsJSON = function(appName, url, callback){
        url = constructUrlBase(appName,"directory-summary/")+"/"+url;
        doGet(url, callback);
    }
}

module.exports = FileService;
},{"opendsu":false}],"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/services/LocaleService.js":[function(require,module,exports){
/**
 * @module pdm-dsu-toolkit.services
 */
let SUPPORTED = {
    en_US: "en_US"
};

/**
 * This service needs a Global called LOCALE with the locale strings as such:
 * <pre>{
 *     "en_US": {
 *         "pageX": {
 *             "stringKey1": "...",
 *             "formComponent1": {
 *                 "title": "...",
 *                 "placeholder": "..."
 *             }
 *         },
 *         "pageY": {...}
 *     },
 *     "pt_PT": {
 *         "pageX": {
 *             "stringKey1": "...",
 *             "formComponent1": {
 *                 "title": "...",
 *                 "placeholder": "..."
 *             }
 *         },
 *         "pageY": {...}
 *     }
 * }</pre>
 * <strong>locale.js should be included in index.html via</strong>
 * <pre>
 *     <script src="resources/locale/locale.js"></script>
 * </pre>
 * And will provide access to the strings via '@locale.pageX.key1'
 * @param {SUPPORTED} lang
 */
function LocaleService(lang){
    let _genSupported = function(){
        if (!LOCALE)
            throw new Error("Could not find Locale Resource");
        let available = Object.keys(LOCALE);
        available.forEach(a => {
            SUPPORTED[a] = a;
        })
    };

    _genSupported();

    lang = lang || SUPPORTED.en_US;
    let localeObj;

    /**
     * Loads the selected locale
     * @param {SUPPORTED} locale
     */
    this.loadLocale = function(locale){
        if (!SUPPORTED.hasOwnProperty(locale))
            throw new Error("Unsupported Locale");
        localeObj = LOCALE[locale];
    }

    /**
     * binds the SetModel method of the controller to always include the locale info in one of two ways:
     *  <ul>
     *     <li>No page is provided: The model will have the whole locale object under the 'locale' key</li>
     *     <li>A page is provided: the entries under that key will be applied directly to the model, being overwritten by the provided model<br>
     *         Useful for forms</li>
     * </ul>
     * @param {Object} model
     * @param {string} [page]
     */
    this.bindToModel = function(model, page){
        if (!model || typeof model !== 'object')
            throw new Error("Model is not suitable for locale binding");
        if (!page)
            model.locale = JSON.parse(JSON.stringify(localeObj));
        else {
            let tempObj = JSON.parse(JSON.stringify(localeObj[page]));
            model = merge(tempObj, JSON.parse(JSON.stringify(model)));
        }
        return model;
    }

    this.loadLocale(lang);
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
        let func = controller.setModel;
        let m = controller.model;
        controller.setModel = function (model) {
            model = localeService.bindToModel(model, page);
            return func(model);
        };
        controller.setModel(m ? m : {});
        controller.localized = true;
    }
}

let localeService;

module.exports = {
    /**
     * Returns the instance of the LocaleService and binds the locale info to the controller via {@link LocaleService#bindToModel}
     * @param {ContainerController} controller: the current controller
     * @param {SUPPORTED} locale: the supported language to use
     * @param {string} [page]: the name of the view. Must match an existing key in LOCALE
     * @returns {LocaleService}
     */
    bindToLocale: function (controller,locale, page){
        if (!localeService)
            localeService = new LocaleService(locale);
        bindToController(controller, page);
        return localeService;
    },
    supported: {...SUPPORTED}
}
},{}],"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/services/ParticipantService.js":[function(require,module,exports){
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
},{"../commands/setParticipantConstSSI":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/commands/setParticipantConstSSI.js","../constants":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/constants.js","./strategy":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/services/strategy.js","./utils":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/services/utils.js","opendsu":false}],"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/services/WalletService.js":[function(require,module,exports){
/**
 * @module pdm-dsu-toolkit.services
 */
'use strict';

const FileService = require("./FileService");

/**
 * @param {RawDossier} wallet
 * @param {object} options
 * @param {string} options.codeFolderName
 * @param {string} options.walletTemplateFolderName
 * @param {string} options.appFolderName
 * @param {string} options.appsFolderName
 */
function WalletBuilderService(options) {
    options = options || {};


    if (!options.codeFolderName) {
        throw new Error('Code folder name is required');
    }

    if (!options.walletTemplateFolderName) {
        throw new Error('The wallet template folder name is required');
    }

    if (!options.appFolderName) {
        throw new Error('The app folder name is required');
    }

    if (!options.appsFolderName) {
        throw new Error('The apps folder name is required');
    }

    if (!options.vault) {
        throw new Error('The vault name is required');
    }

    const CODE_FOLDER = options.codeFolderName;
    const WALLET_TEMPLATE_FOLDER = options.walletTemplateFolderName;
    const APP_FOLDER = options.appFolderName;
    const APPS_FOLDER = options.appsFolderName;
    const SSI_FILE_NAME = options.ssiFileName;
    const VAULT_DOMAIN = options.environmentDomain;


    const fileService = new FileService();

    this.walletTypeSeed = null;
    this.dossierFactory = options.dossierFactory;
    this.dossierLoader = options.dossierLoader;


    /**
     * Get the list of file and their contents
     * from the wallet template folder
     *
     * @param {callback} callback
     */
    const getWalletTemplateContent = (appName, callback) => {
        fileService.getFolderContentAsJSON(appName, WALLET_TEMPLATE_FOLDER, (err, data) => {
            if (err) {
                return callback(err);
            }

            let content;
            try {
                content = JSON.parse(data.toString());
            } catch (e) {
                return callback(err);
            }

            callback(undefined, content);
        });
    };

    /**
     * @param {object} walletTemplateFolderName
     * @return {Array.Object}
     */
    const dirSummaryAsArray = (walletTemplateContent) => {
        let files = [];
        for (let directory in walletTemplateContent) {
            let directoryFiles = walletTemplateContent[directory];
            for (let fileName in directoryFiles) {
                files.push({
                    path: directory + "/" + fileName,
                    content: directoryFiles[fileName]
                });
            }
        }
        return files;
    };

    /**
     * Write the files into the DSU under /prefix
     *
     * @param {DSU} dsu
     * @param {Array.Object} files
     * @param {string} prefix
     * @param {callback} callback
     */
    const customizeDSU = (dsu, files, prefix, callback) => {
        if (typeof prefix === "function") {
            callback = prefix;
            prefix = undefined;
        }
        if (files.length === 0) {
            return callback();
        }
        let file = files.pop();
        let targetPath = file.path;

        if (typeof prefix !== 'undefined') {
            targetPath = `${prefix}/${targetPath}`;
        }

        let fileContent;
        if (Array.isArray(file.content)) {
            let Buffer = require("buffer").Buffer;

            let arrayBuffer = new Uint8Array(file.content).buffer;
            let buffer = new Buffer(arrayBuffer.byteLength);
            let view = new Uint8Array(arrayBuffer);
            for (let i = 0; i < buffer.length; ++i) {
                buffer[i] = view[i];
            }
            fileContent = buffer;
        } else {
            fileContent = file.content;
        }
        dsu.writeFile(targetPath, fileContent, (err) => {
            if (err) {
                return callback(err);
            }
            customizeDSU(dsu, files, prefix, callback);
        });
    };

    /**
     * @param {callback} callback
     */
    const getListOfAppsForInstallation = (callback) => {
        fileService.getFolderContentAsJSON(APPS_FOLDER, function (err, data) {
            if (err) {
                return callback(err);
            }

            let apps;

            try {
                apps = JSON.parse(data);
            } catch (e) {
                return callback(err);
            }

            callback(undefined, apps);
        });
    };

    /**
     * @param {string} appName
     * @param {string} seed
     * @param {Boolean} hasTemplate
     * @param {callback} callback
     */
    const buildApp = (appName, seed, hasTemplate, callback) => {
        if (typeof hasTemplate === "function") {
            callback = hasTemplate;
            hasTemplate = true;
        }

        const instantiateNewDossier = (files) => {
            let resolver = require("opendsu").loadApi("resolver");
            let keyssi = require("opendsu").loadApi("keyssi");
            resolver.createDSU(keyssi.createTemplateSeedSSI(VAULT_DOMAIN, undefined, undefined,undefined,VAULT_DOMAIN), (err, appDSU) => {
                if (err) {
                    return callback(err);
                }

                appDSU.mount('/' + CODE_FOLDER, seed, (err) => {
                    if (err) {
                        return callback(err);
                    }
                    customizeDSU(appDSU, files, `/${APP_FOLDER}`, (err) => {
                        if (err) {
                            return callback(err);
                        }
                        return appDSU.writeFile("/environment.json", JSON.stringify(LOADER_GLOBALS.environment), (err) => {
                            if (err) {
                                console.log("Could not write environment file into app", err);
                            }
                            appDSU.getKeySSIAsString(callback);
                        });
                        appDSU.getKeySSIAsString(callback);
                    })
                })
            });
        };

        if (hasTemplate) {
            return fileService.getFolderContentAsJSON(`apps-patch/${appName}`, (err, data) => {
                let files;

                try {
                    files = JSON.parse(data);
                } catch (e) {
                    return callback(e);
                }

                files = dirSummaryAsArray(files);
                instantiateNewDossier(files);
            })
        }
        instantiateNewDossier([]);


    };

    /**
     * @param {object} apps
     * @param {Array.String} appsList
     * @param {callback} callback
     */
    const performInstallation = (walletDSU, apps, appsList, callback) => {
        if (!appsList.length) {
            return callback();
        }
        let appName = appsList.pop();
        const appInfo = apps[appName];

        if (appName[0] === '/') {
            appName = appName.replace('/', '');
        }

        const mountApp = (newAppSeed) => {
            walletDSU.mount('/apps/' + appName, newAppSeed, (err) => {
                if (err) {
                    return callback(err);
                }

                performInstallation(walletDSU, apps, appsList, callback);
            })
        };

        //by default ssapps have a template
        let hasTemplate = appInfo.hasTemplate !== false;
        let newInstanceIsDemanded = appInfo.newInstance !== false;
        if (newInstanceIsDemanded) {
            return buildApp(appName, appInfo.seed, hasTemplate, (err, newAppSeed) => {
                if (err) {
                    return OpenDSUSafeCallback(callback)(createOpenDSUErrorWrapper("Failed to build app " + `${appName}`, err));
                }
                mountApp(newAppSeed);
            });
        }
        mountApp(appInfo.seed);

    };

    /**
     * @param {string} appName
     * @param {string} seed
     * @param {callback} callback
     */
    const rebuildApp = (appName, seed, callback) => {
        fileService.getFolderContentAsJSON(`apps-patch/${appName}`, (err, data) => {
            let files;

            try {
                files = JSON.parse(data);
            } catch (e) {
                return callback(e);
            }

            files = dirSummaryAsArray(files);

            const appDossier = this.dossierLoader(seed);
            customizeDSU(appDossier, files, `/${APP_FOLDER}`, (err) => {
                return OpenDSUSafeCallback(callback)(createOpenDSUErrorWrapper("Failed to customize DSU", err));
            })
        })

    };

    /**
     * @param {object} apps
     * @param {Array.String} appsList
     * @param {callback} callback
     */
    const performApplicationsRebuild = (apps, appsList, callback) => {
        if (!appsList.length) {
            return callback();
        }

        let appName = appsList.pop();
        const appInfo = apps[appName];

        if (appName[0] === '/') {
            appName = appName.replace('/', '');
        }

        rebuildApp(appName, appInfo.seed, (err) => {
            if (err) {
                return OpenDSUSafeCallback(callback)(createOpenDSUErrorWrapper("Failed to rebuild app" + `${appName}`, err));
            }

            performApplicationsRebuild(apps, appsList, callback);
        })
    };

    /**
     * Get list of installed applications
     * and rebuild them
     *
     * @param {callback} callback
     */
    const rebuildApplications = (callback) => {
        getListOfAppsForInstallation((err, apps) => {
            if (err) {
                return callback();
            }

            const appsList = [];

            wallet.listMountedDSUs('/', (err, data) => {
                const mountedApps = [];
                for (const mountPoint of data) {
                    const appName = '/' + mountPoint.path.split('/').pop();
                    const appSeed = mountPoint.dossierReference;

                    if (!apps[appName]) {
                        continue;
                    }

                    appsList.push(appName);
                    apps[appName].seed = appSeed;
                }

                if (!appsList) {
                    return;
                }

                performApplicationsRebuild(apps, appsList, callback);
            });

        })

    };

    const getSSAppsFromInstallationURL = (callback) => {
        let url = new URL(window.location.href);
        let searchParams = url.searchParams;
        let apps = {};

        searchParams.forEach((paramValue, paramKey) => {
            if (paramKey === "appName") {
                let seedKey = paramValue + "Seed";
                let appSeed = searchParams.get(seedKey);
                if (appSeed) {
                    apps[paramValue] = appSeed;
                }
            }
        });

        if (Object.keys(apps)) {
            return callback(apps);
        }

        callback();

    };


    /**
     * Install applications found in the /apps folder
     * into the wallet
     *
     * @param {DSU} walletDSU
     * @param {callback} callback
     */
    const installApplications = (walletDSU, callback) => {

        getListOfAppsForInstallation((err, apps) => {

            let appsToBeInstalled = apps || {};

            getSSAppsFromInstallationURL((apps) => {
                let externalAppsList = Object.keys(apps);
                if (externalAppsList.length > 0) {
                    externalAppsList.forEach(appName => {
                        appsToBeInstalled[appName] = {
                            hasTemplate: false,
                            newInstance: false,
                            seed: apps[appName]
                        };
                    });
                    let landingApp = {name: externalAppsList[0]};
                    walletDSU.writeFile("apps-patch/.landingApp", JSON.stringify(landingApp), () => {
                        console.log(`Written landingApp [${landingApp.name}]. `)
                    });
                }
            });

            const appsList = Object.keys(appsToBeInstalled);

            if (appsList.length === 0) {
                return callback();
            }
            console.log('Installing the following applications: ', appsToBeInstalled, appsList);

            performInstallation(walletDSU, appsToBeInstalled, appsList, callback);
        })
    }

    /**
     * Mount the wallet template code
     * and install necessary applications
     *
     * @param {object} files
     * @param {callback} callback
     */
    const install = (wallet, files, callback) => {
        // Copy any files found in the WALLET_TEMPLATE_FOLDER on the local file system
        // into the wallet's app folder
        files = dirSummaryAsArray(files);
        customizeDSU(wallet, files, `/${APP_FOLDER}`, (err) => {
            if (err) {
                return callback(err);
            }

            installApplications(wallet, callback);
        });
    }

    /**
     * @param {string[]} arrayWithSecrets
     * @param {callback} callback
     */
    this.build = function (arrayWithSecrets, callback) {
        let resolver = require("opendsu").loadApi("resolver");
        let keySSISpace = require("opendsu").loadApi("keyssi");
        let domain = options.environmentDomain;

        let _build = () => {
            fileService.getFile(options.appFolderName, WALLET_TEMPLATE_FOLDER + "/" + SSI_FILE_NAME, (err, dsuType) => {
                if (err) {
                    return OpenDSUSafeCallback(callback)(createOpenDSUErrorWrapper(`Failed to read wallet dsu type from ${WALLET_TEMPLATE_FOLDER + "/" + SSI_FILE_NAME}`,err));
                }
                resolver.createDSU(keySSISpace.createTemplateWalletSSI(domain, arrayWithSecrets, options.vault), {useSSIAsIdentifier:true, dsuTypeSSI: dsuType.toString()}, (err, walletDSU) => {
                    if (err) {
                        return OpenDSUSafeCallback(callback)(createOpenDSUErrorWrapper(`Failed to create wallet of type  ${dsuType}`,err));
                    }
                    console.log("ConstDSU Wallet has SSI:", walletDSU.getCreationSSI(true));
                    walletDSU = walletDSU.getWritableDSU();
                    callback(undefined, walletDSU);



                    getWalletTemplateContent(options.appFolderName,(err, files) => {
                        if (err) {
                            return OpenDSUSafeCallback(callback)(createOpenDSUErrorWrapper(`Failed to read wallet template`, err));
                        }

                        // we need to remove dsu type identifier from the file list
                        files['/'][SSI_FILE_NAME] = undefined;
                        delete files['/'][SSI_FILE_NAME];

                        install(walletDSU, files, (err) => {
                            if (err) {
                                return OpenDSUSafeCallback(callback)(createOpenDSUErrorWrapper(`Failed to install`, err));
                            }

                            return walletDSU.writeFile("/environment.json", JSON.stringify(LOADER_GLOBALS.environment), (err) => {
                                if (err) {
                                    return OpenDSUSafeCallback(callback)(createOpenDSUErrorWrapper("Could not write Environment file into wallet.", err));
                                }
                                callback(undefined, walletDSU);
                            });

                        });
                    });



                });
            });
        }

        resolver.loadDSU(keySSISpace.createTemplateWalletSSI(domain, arrayWithSecrets, options.vault), (err, walletDSU) => {
            if(err){
                _build();
            } else {
                console.log("Possible security issue. It is ok during development if you use the same credentials. Just do a npm run clean to remove APIHub cache in this case...");
                walletDSU = walletDSU.getWritableDSU();
                callback(err, walletDSU);
            }
        });
    };

    /**
     * @param {callback}
     */
    this.rebuild = function (callback) {
        getWalletTemplateContent((err, files) => {
            if (err) {
                return callback(err);
            }

            // Remove the seed file in order to prevent copying it into the new dossier
            delete files['/'].seed;

            // Copy any files found in the WALLET_TEMPLATE_FOLDER on the local file system
            // into the wallet's app folder
            files = dirSummaryAsArray(files);
            customizeDSU(wallet, files, `/${APP_FOLDER}`, (err) => {
                if (err)
                    return callback(err);

                console.trace('Rebuilding');
                rebuildApplications(callback);
            })
        })

    }
}

module.exports = WalletBuilderService;

},{"./FileService":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/services/FileService.js","buffer":false,"opendsu":false}],"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/services/WebcLocaleService.js":[function(require,module,exports){
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
},{}],"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/services/index.js":[function(require,module,exports){
/**
 * @module fgt-dsu-wizard.services
 */
module.exports = {
    DSUService: require('./DSUService'),
    WalletService: require('./WalletService'),
    FileService: require("./FileService"),
    LocaleService: require("./LocaleService"),
    WebcLocaleService: require('./WebcLocaleService'),
    AppBuilderService: require('./AppBuilderService'),
    ParticipantService: require('./ParticipantService'),
    Strategy: require('./strategy')
}
},{"./AppBuilderService":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/services/AppBuilderService.js","./DSUService":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/services/DSUService.js","./FileService":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/services/FileService.js","./LocaleService":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/services/LocaleService.js","./ParticipantService":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/services/ParticipantService.js","./WalletService":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/services/WalletService.js","./WebcLocaleService":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/services/WebcLocaleService.js","./strategy":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/services/strategy.js"}],"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/pdm-dsu-toolkit/services/strategy.js":[function(require,module,exports){
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