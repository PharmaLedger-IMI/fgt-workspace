wizardRequire=(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({"../../../fgt-dsu-wizard":[function(require,module,exports){
(function (__dirname){(function (){
/**
 * Extends the functionality and Architecture to the Use Case's specific Business needs
 * @module fgt-dsu-wizard
 */

/**
 * Handles interactions with OpenDSU's ApiHub Server
 * @namespace Server
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
	 * Exposes constants.
	 */
	Constants: require("./constants"),
	 /**
	 * Exposes the Model module
	 */
	Model: require("./model"),
	/**
	 * exposes the Commands module
	 */
	Commands: require("./commands"),
	/**
	 * instantiates a new DSUService
	 */
	DSUService: new (require('./services').DSUService),
	/**
	 * Exposes the Services Module
	 */
	Services: require("./services"),
	/**
	 * Exposes the Managers module
	 */
	Managers: require("./managers"),
    /**
	 * Exposes Version.
	 */
	Version: require("./version"),
};

}).call(this)}).call(this,"/")

},{"./commands":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/commands/index.js","./constants":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/constants.js","./managers":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/managers/index.js","./model":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/index.js","./services":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/services/index.js","./version":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/version.js","fs":false,"path":false}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/builds/tmp/wizard_intermediar.js":[function(require,module,exports){
(function (global){(function (){
global.wizardLoadModules = function(){ 

	if(typeof $$.__runtimeModules["wizard"] === "undefined"){
		$$.__runtimeModules["wizard"] = require("../../../fgt-dsu-wizard");
	}
};
if (true) {
	wizardLoadModules();
}
global.wizardRequire = require;
if (typeof $$ !== "undefined") {
	$$.requireBundle("wizard");
}

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../../fgt-dsu-wizard":"../../../fgt-dsu-wizard"}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/commands/index.js":[function(require,module,exports){
/**
 * Defines the strategies for the KeySSI's for each DSU Type
 * @namespace Commands
 */
module.exports = {
    setSSI: require('../../pdm-dsu-toolkit/commands/setSSI'),
    createParticipantSSI: require("./setParticipantSSI").createParticipantSSI,
    createOrderLineSSI: require("./setOrderLineSSI").createOrderLineSSI,
    createOrderSSI: require("./setOrderSSI").createOrderSSI,
    createStatusSSI: require('./setStatusSSI').createStatusSSI,
    createBatchSSI: require("./setBatchSSI").createBatchSSI,
    createProductSSI: require("./setProductSSI").createProductSSI,
    createShipmentLineSSI: require("./setShipmentLineSSI").createShipmentLineSSI,
    createShipmentSSI: require("./setShipmentSSI").createShipmentSSI,
    createSaleSSI: require('./setSaleSSI')
}
},{"../../pdm-dsu-toolkit/commands/setSSI":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/commands/setSSI.js","./setBatchSSI":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/commands/setBatchSSI.js","./setOrderLineSSI":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/commands/setOrderLineSSI.js","./setOrderSSI":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/commands/setOrderSSI.js","./setParticipantSSI":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/commands/setParticipantSSI.js","./setProductSSI":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/commands/setProductSSI.js","./setSaleSSI":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/commands/setSaleSSI.js","./setShipmentLineSSI":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/commands/setShipmentLineSSI.js","./setShipmentSSI":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/commands/setShipmentSSI.js","./setStatusSSI":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/commands/setStatusSSI.js"}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/commands/setBatchSSI.js":[function(require,module,exports){

/**
 * Defines how to create the keyssi for a batch dsu
 * @param {object} data necessary properties:
 * <ul>
 *     <li>gtin - the gtin of the batch</li>
 *     <li>batch - the batch number</li>
 *     <li>(optional) {@link openDSU#constants#BRICKS_DOMAIN_KEY} - the subDomain to store the bricks in. Will be concatenated like 'domain.subDomain'</li>
 * </ul>
 * @param {string} domain the anchoring domain
 * @returns {ArraySSI}
 * @memberOf Commands
 */
function createBatchSSI(data, domain) {
    console.log("New BATCH_SSI in domain", domain);
    const openDSU = require('opendsu');
    const keyssiSpace = openDSU.loadApi("keyssi");
    let hint;
    if (data[openDSU.constants.BRICKS_DOMAIN_KEY]) {
        hint = {};
        hint[openDSU.constants.BRICKS_DOMAIN_KEY] = [domain, data[openDSU.constants.BRICKS_DOMAIN_KEY]].join('.');
    }
    return keyssiSpace.createArraySSI(domain, [data.gtin, data.batch], 'v0', hint ? JSON.stringify(hint) : undefined);
}

/**
 * Registers the endpoint on the api-hub's dsu-wizard.
 * @param {HttpServer} server
 * @memberOf Server
 */
function command(server){
    const setSSI = require('../../pdm-dsu-toolkit/commands/setSSI');
    setSSI(server, "batch", createBatchSSI, "setBatchSSI", "traceability");
}

module.exports = {
    command,
    createBatchSSI
};

},{"../../pdm-dsu-toolkit/commands/setSSI":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/commands/setSSI.js","opendsu":false}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/commands/setIndividualProductSSI.js":[function(require,module,exports){
/**
 * Defines how to create the keyssi for a {@link Product} dsu
 * @param {object} data necessary properties:
 * <ul>
 *     <li>gtin - the gtin of the product</li>
 *     <li>(optional) {@link openDSU#constants#BRICKS_DOMAIN_KEY} - the subDomain to store the bricks in. Will be concatenated like 'domain.subDomain'</li>
 * </ul>
 * @param {string} domain the anchoring domain
 * @returns {ArraySSI}
 * @memberOf Commands
 */
function createIndividualProductSSI(data, domain) {
    console.log("New Individual PRODUCT_SSI in domain", domain);
    const openDSU = require('opendsu');
    const keyssiSpace = openDSU.loadApi("keyssi");
    let hint;
    if (data[openDSU.constants.BRICKS_DOMAIN_KEY]) {
        hint = {};
        hint[openDSU.constants.BRICKS_DOMAIN_KEY] = [domain, data[openDSU.constants.BRICKS_DOMAIN_KEY]].join('.');
    }
    return keyssiSpace.createArraySSI(domain, [data.gtin, data.batchNumber, data.serialNumber], 'v0', hint ? JSON.stringify(hint) : undefined);
}

/**
 * Registers the endpoint on the api-hub's dsu-wizard.
 * @param {HttpServer} server
 * @memberOf Server
 */
function command(server){
    const setSSI = require('../../pdm-dsu-toolkit/commands/setSSI');
    setSSI(server, "product", createIndividualProductSSI, "setProductSSI", "traceability");
}

module.exports = {
    command,
    createIndividualProductSSI
};

},{"../../pdm-dsu-toolkit/commands/setSSI":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/commands/setSSI.js","opendsu":false}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/commands/setOrderLineSSI.js":[function(require,module,exports){
/**
 * Defines how to create the keyssi for an orderLine dsu
 * @param {object} data necessary properties:
 * <ul>
 *     <li>data</li> the specific string to be used as input
 *     <li>(optional) {@link openDSU#constants#BRICKS_DOMAIN_KEY} - the subDomain to store the bricks in. Will be concatenated like 'domain.subDomain'</li>
 * </ul>
 * @param {string} domain the anchoring domain
 * @returns {ArraySSI}
 * @memberOf Commands
 */
function createOrderLineSSI(data, domain) {
    console.log("New ORDERLINE_SSI in domain ", domain);
    const openDSU = require('opendsu');
    const keyssiSpace = openDSU.loadApi("keyssi");
    let hint;
    if (data[openDSU.constants.BRICKS_DOMAIN_KEY]) {
        hint = {};
        hint[openDSU.constants.BRICKS_DOMAIN_KEY] = [domain, data[openDSU.constants.BRICKS_DOMAIN_KEY]].join('.');
    }
    return keyssiSpace.createTemplateSeedSSI(domain, data.data, 'v0', hint ? JSON.stringify(hint) : undefined);
}

/**
 * Registers the endpoint on the api-hub's dsu-wizard.
 * @param {HttpServer} server
 * @memberOf Server
 */
function command(server){
    const setSSI = require('../../pdm-dsu-toolkit/commands/setSSI');
    setSSI(server, "orderline", createOrderLineSSI, "setOrderLineSSI", "traceability");
}

module.exports = {
    command,
    createOrderLineSSI
};

},{"../../pdm-dsu-toolkit/commands/setSSI":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/commands/setSSI.js","opendsu":false}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/commands/setOrderSSI.js":[function(require,module,exports){
/**
 * Defines how to create the keyssi for an {@link Order} dsu
 * @param {object} data necessary properties:
 * <ul>
 *     <li>data</li> the specific string
 *     <li>(optional) {@link openDSU#constants#BRICKS_DOMAIN_KEY} - the subDomain to store the bricks in. Will be concatenated like 'domain.subDomain'</li>
 * </ul>
 * @param {string} domain the anchoring domain
 * @returns {ArraySSI}
 * @memberOf Commands
 */
function createOrderSSI(data, domain) {
    console.log("New ORDER_SSI in domain", domain);
    const openDSU = require('opendsu');
    const keyssiSpace = openDSU.loadApi("keyssi");
    let hint;
    if (data[openDSU.constants.BRICKS_DOMAIN_KEY]) {
        hint = {};
        hint[openDSU.constants.BRICKS_DOMAIN_KEY] = [domain, data[openDSU.constants.BRICKS_DOMAIN_KEY]].join('.');
    }
    return keyssiSpace.createTemplateSeedSSI(domain, data.data, 'v0', hint ? JSON.stringify(hint) : undefined);
}

/**
 * Registers the endpoint on the api-hub's dsu-wizard.
 * @param {HttpServer} server
 * @memberOf Server
 */
function command(server){
    const setSSI = require('../../pdm-dsu-toolkit/commands/setSSI');
    setSSI(server, "order", createOrderSSI, "setOrderSSI", "traceability");
}

module.exports = {
    command,
    createOrderSSI
};

},{"../../pdm-dsu-toolkit/commands/setSSI":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/commands/setSSI.js","opendsu":false}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/commands/setParticipantSSI.js":[function(require,module,exports){
/**
 * Creates a seedSSI meant to contain participant 'participant' data.
 * could be used as an identity
 * @param {Participant} participant
 * @param {string} domain: anchoring domain
 * @returns {SeedSSI} (template)
 * @memberOf Commands
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
 * @memberOf Server
 */
function command(server){
    const setSSI = require('../../pdm-dsu-toolkit/commands/setSSI');
    setSSI(server, "participant", createParticipantSSI, "setParticipantSSI", "traceability");
}

module.exports = {
    command,
    createParticipantSSI: createParticipantSSI
};

},{"../../pdm-dsu-toolkit/commands/setSSI":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/commands/setSSI.js","opendsu":false}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/commands/setProductSSI.js":[function(require,module,exports){
/**
 * Defines how to create the keyssi for a {@link Product} dsu
 * @param {object} data necessary properties:
 * <ul>
 *     <li>gtin - the gtin of the product</li>
 *     <li>(optional) {@link openDSU#constants#BRICKS_DOMAIN_KEY} - the subDomain to store the bricks in. Will be concatenated like 'domain.subDomain'</li>
 * </ul>
 * @param {string} domain the anchoring domain
 * @returns {ArraySSI}
 * @memberOf Commands
 */
function createProductSSI(data, domain) {
    console.log("New PRODUCT_SSI in domain", domain);
    const openDSU = require('opendsu');
    const keyssiSpace = openDSU.loadApi("keyssi");
    let hint;
    if (data[openDSU.constants.BRICKS_DOMAIN_KEY]) {
        hint = {};
        hint[openDSU.constants.BRICKS_DOMAIN_KEY] = [domain, data[openDSU.constants.BRICKS_DOMAIN_KEY]].join('.');
    }
    return keyssiSpace.createArraySSI(domain, [data.gtin], 'v0', hint ? JSON.stringify(hint) : undefined);
}

/**
 * Registers the endpoint on the api-hub's dsu-wizard.
 * @param {HttpServer} server
 * @memberOf Server
 */
function command(server){
    const setSSI = require('../../pdm-dsu-toolkit/commands/setSSI');
    setSSI(server, "product", createProductSSI, "setProductSSI", "traceability");
}

module.exports = {
    command,
    createProductSSI
};

},{"../../pdm-dsu-toolkit/commands/setSSI":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/commands/setSSI.js","opendsu":false}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/commands/setSaleSSI.js":[function(require,module,exports){
/**
 * Defines how to create the keyssi for a {@link Receipt} dsu
 * @param {object} data necessary properties:
 * <ul>
 *     <li>data</li> the specific string
 *     <li>(optional) {@link openDSU#constants#BRICKS_DOMAIN_KEY} - the subDomain to store the bricks in. Will be concatenated like 'domain.subDomain'</li>
 * </ul>
 * @param {string} domain the anchoring domain
 * @memberOf Commands
 */
function createSaleSSI(data, domain) {
    console.log("New Sale_SSI in domain", domain);
    const openDSU = require('opendsu');
    const keyssiSpace = openDSU.loadApi("keyssi");
    let hint;
    if (data[openDSU.constants.BRICKS_DOMAIN_KEY]) {
        hint = {};
        hint[openDSU.constants.BRICKS_DOMAIN_KEY] = [domain, data[openDSU.constants.BRICKS_DOMAIN_KEY]].join('.');
    }
    return keyssiSpace.createTemplateSeedSSI(domain, data.data.join(), 'v0', hint ? JSON.stringify(hint) : undefined);
}

/**
 * Registers the endpoint on the api-hub's dsu-wizard.
 * @memberOf Server
 */
function command(server){
    const setSSI = require('../../pdm-dsu-toolkit/commands/setSSI');
    setSSI(server, "sale", createSaleSSI, "setSaleSSI", "traceability");
}

module.exports = {
    command,
    createSaleSSI
};

},{"../../pdm-dsu-toolkit/commands/setSSI":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/commands/setSSI.js","opendsu":false}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/commands/setShipmentCodeSSI.js":[function(require,module,exports){
/**
 * Defines how to create the keyssi for a {@link ShipmentLine} dsu
 * @param {object} data necessary properties:
 * <ul>
 *     <li>data</li> the specific string
 *     <li>(optional) {@link openDSU#constants#BRICKS_DOMAIN_KEY} - the subDomain to store the bricks in. Will be concatenated like 'domain.subDomain'</li>
 * </ul>
 * @param {string} domain the anchoring domain
 * @memberOf Commands
 */
function createShipmentCodeSSI(data, domain) {
    console.log("New SHIPMENTCODE_SSI in domain", domain);
    const openDSU = require('opendsu');
    const keyssiSpace = openDSU.loadApi("keyssi");
    let hint;
    if (data[openDSU.constants.BRICKS_DOMAIN_KEY]) {
        hint = {};
        hint[openDSU.constants.BRICKS_DOMAIN_KEY] = [domain, data[openDSU.constants.BRICKS_DOMAIN_KEY]].join('.');
    }
    return keyssiSpace.createTemplateSeedSSI(domain, data.data, 'v0', hint ? JSON.stringify(hint) : undefined);
}

/**
 * Registers the endpoint on the api-hub's dsu-wizard.
 * @memberOf Server
 */
function command(server){
    const setSSI = require('../../pdm-dsu-toolkit/commands/setSSI');
    setSSI(server, "shipmentcode", createShipmentCodeSSI, "setShipmentCodeSSI", "traceability");
}

module.exports = {
    command,
    createShipmentCodeSSI
};

},{"../../pdm-dsu-toolkit/commands/setSSI":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/commands/setSSI.js","opendsu":false}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/commands/setShipmentLineSSI.js":[function(require,module,exports){
/**
 * Defines how to create the keyssi for a {@link ShipmentLine} dsu
 * @param {object} data necessary properties:
 * <ul>
 *     <li>data</li> the specific string
 *     <li>(optional) {@link openDSU#constants#BRICKS_DOMAIN_KEY} - the subDomain to store the bricks in. Will be concatenated like 'domain.subDomain'</li>
 * </ul>
 * @param {string} domain the anchoring domain
 * @memberOf Commands
 */
function createShipmentLineSSI(data, domain) {
    console.log("New SHIPMENTLINE_SSI in domain", domain);
    const openDSU = require('opendsu');
    const keyssiSpace = openDSU.loadApi("keyssi");
    let hint;
    if (data[openDSU.constants.BRICKS_DOMAIN_KEY]) {
        hint = {};
        hint[openDSU.constants.BRICKS_DOMAIN_KEY] = [domain, data[openDSU.constants.BRICKS_DOMAIN_KEY]].join('.');
    }
    return keyssiSpace.createTemplateSeedSSI(domain, data.data, 'v0', hint ? JSON.stringify(hint) : undefined);
}

/**
 * Registers the endpoint on the api-hub's dsu-wizard.
 * @memberOf Server
 */
function command(server){
    const setSSI = require('../../pdm-dsu-toolkit/commands/setSSI');
    setSSI(server, "shipmentline", createShipmentLineSSI, "setShipmentLineSSI", "traceability");
}

module.exports = {
    command,
    createShipmentLineSSI
};

},{"../../pdm-dsu-toolkit/commands/setSSI":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/commands/setSSI.js","opendsu":false}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/commands/setShipmentSSI.js":[function(require,module,exports){
/**
 * Defines how to create the keyssi for a {@link Shipment} dsu
 * @param {object} data necessary properties:
 * <ul>
 *     <li>data</li> the specific string
 *     <li>(optional) {@link openDSU#constants#BRICKS_DOMAIN_KEY} - the subDomain to store the bricks in. Will be concatenated like 'domain.subDomain'</li>
 * </ul>
 * @param {string} domain the anchoring domain
 * @memberOf Commands
 */
function createShipmentSSI(data, domain) {
    console.log("New SHIPMENT_SSI in domain", domain);
    const openDSU = require('opendsu');
    const keyssiSpace = openDSU.loadApi("keyssi");
    let hint;
    if (data[openDSU.constants.BRICKS_DOMAIN_KEY]) {
        hint = {};
        hint[openDSU.constants.BRICKS_DOMAIN_KEY] = [domain, data[openDSU.constants.BRICKS_DOMAIN_KEY]].join('.');
    }
    return keyssiSpace.createTemplateSeedSSI(domain, data.data, 'v0', hint ? JSON.stringify(hint) : undefined);
}

/**
 * Registers the endpoint on the api-hub's dsu-wizard.
 * @memberOf Server
 */
function command(server){
    const setSSI = require('../../pdm-dsu-toolkit/commands/setSSI');
    setSSI(server, "shipment", createShipmentSSI, "setShipmentSSI", "traceability");
}

module.exports = {
    command,
    createShipmentSSI
};

},{"../../pdm-dsu-toolkit/commands/setSSI":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/commands/setSSI.js","opendsu":false}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/commands/setStatusSSI.js":[function(require,module,exports){
/**
 * Defines how to create the keyssi for a orderLine dsu
 * @param {OrderStatus|ShipmentStatus} status. if status has the properties:
 * <ul>
 *     <li>(optional) {@link openDSU#constants#BRICKS_DOMAIN_KEY} - the subDomain to store the bricks in. Will be concatenated like 'domain.subDomain'</li>
 * </ul>
 * @param {string} domain the anchoring domain
 * @memberOf Commands
 */
function createStatusSSI(status, domain) {
    console.log("New Status_SSI in domain", domain);
    const openDSU = require('opendsu');
    const keyssiSpace = openDSU.loadApi("keyssi");
    let hint;
    if (status[openDSU.constants.BRICKS_DOMAIN_KEY]) {
        hint = {};
        hint[openDSU.constants.BRICKS_DOMAIN_KEY] = [domain, status[openDSU.constants.BRICKS_DOMAIN_KEY]].join('.');
    }
    return keyssiSpace.createTemplateSeedSSI(domain, status, undefined, 'v0', hint ? JSON.stringify(hint) : undefined);
}

/**
 * Registers the endpoint on the api-hub's dsu-wizard.
 * @memberOf Server
 */
function command(server){
    const setSSI = require('../../pdm-dsu-toolkit/commands/setSSI');
    setSSI(server, "status", createStatusSSI, "setStatusSSI", "traceability");
}

module.exports = {
    command,
    createStatusSSI
};
},{"../../pdm-dsu-toolkit/commands/setSSI":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/commands/setSSI.js","opendsu":false}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/constants.js":[function(require,module,exports){
/**
 * @namespace Constants
 */

/**
 * Anchoring domain
 * @type {string}
 * @memberOf Constants
 */
const ANCHORING_DOMAIN = "traceability";
/**
 * Batch mount path
 * @type {string}
 * @memberOf Constants
 */
const BATCH_MOUNT_PATH = "/batches";
const INBOX_MOUNT_PATH = '/inbox';
const INBOX_ORDER_LINES_PROP = 'orderLines';
const INBOX_SHIPMENT_LINES_PROP = 'shipmentLines';
const INBOX_RECEIVED_ORDERS_PROP = 'receivedOrders';
const INBOX_RECEIVED_SHIPMENTS_PROP = 'receivedShipments';
const INFO_PATH = require('../pdm-dsu-toolkit/constants').INFO_PATH;
const INPUT_FIELD_PREFIX = require('../pdm-dsu-toolkit/constants').INPUT_FIELD_PREFIX;
const LOG_PATH = '/log';
const EXTRA_INFO_PATH = '/extra';
const ISSUED_ORDERS_MOUNT_PATH = "/issuedOrders";
const INBOX_ORDER_LINES_PATH = '/orderLines';
const PARTICIPANT_MOUNT_PATH = require('../pdm-dsu-toolkit/constants').PARTICIPANT_MOUNT_PATH;
const PRODUCT_MOUNT_PATH = "/products";
const PUBLIC_ID_MOUNT_PATH = "/publicId";
const INBOX_RECEIVED_ORDERS_PATH = '/receivedOrders';
const INBOX_RECEIVED_SHIPMENTS_PATH = '/receivedShipments';
const INBOX_SHIPMENT_LINES_PATH = '/shipmentLines';
const STOCK_PATH = '/stock';
const LINES_PATH = '/lines';
const SHIPMENT_PATH = '/shipment';

const STATUS_MOUNT_PATH = '/status';
const ORDER_MOUNT_PATH = '/order';

/**
 * @deprecated
 * @type {{}}
 * @memberOf Constants
 */
const INBOX_PATHS_AND_PROPS = [
    {path: INBOX_ORDER_LINES_PATH, prop: INBOX_ORDER_LINES_PROP},
    {path: INBOX_SHIPMENT_LINES_PATH, prop: INBOX_SHIPMENT_LINES_PROP},
    {path: INBOX_RECEIVED_ORDERS_PATH, prop: INBOX_RECEIVED_ORDERS_PROP},
    {path: INBOX_RECEIVED_SHIPMENTS_PATH, prop: INBOX_RECEIVED_SHIPMENTS_PROP},
];

/**
 * Database paths
 * @type {{}}
 * @memberOf Constants
 */
const DB = {
    batches: 'batches',
    issuedOrders: 'issuedOrders',
    issuedShipments: 'issuedShipments',
    products: 'products',
    receivedOrders: 'receivedOrders',
    receivedShipments: 'receivedShipments',
    stock: 'stock',
    orderLines: 'orderLines',
    shipmentLines: 'shipmentLines',
    individualProduct: 'individualProduct',
    directory: 'directory',
    sales: 'sales',
    receipts: 'receipts',
    traceability: 'traceability',
    notifications: 'notifications',
    simpleShipments: 'simpleShipments',
    receivedSimpleShipments: 'receivedSimpleShipments'
}

/**
 * Database Querying options
 * @type {{}}
 * @memberOf Constants
 */
const DEFAULT_QUERY_OPTIONS = require('../pdm-dsu-toolkit/constants').DEFAULT_QUERY_OPTIONS;

const EVENTS = {
    TRACK: {
        REQUEST: 'fgt-track-request',
        RESPONSE: 'fgt-track-response'
    },
    STOCK_TRACE: 'fgt-request-stock-trace'
}

module.exports = {
    STATUS_MOUNT_PATH,
    DB,
    DEFAULT_QUERY_OPTIONS,
    ANCHORING_DOMAIN,
    BATCH_MOUNT_PATH,
    INBOX_ORDER_LINES_PROP,
    INBOX_MOUNT_PATH,
    INBOX_PATHS_AND_PROPS,
    INBOX_RECEIVED_ORDERS_PROP,
    INBOX_RECEIVED_SHIPMENTS_PROP,
    INBOX_SHIPMENT_LINES_PROP,
    INFO_PATH,
    LOG_PATH,
    EXTRA_INFO_PATH,
    ISSUED_ORDERS_MOUNT_PATH,
    INBOX_ORDER_LINES_PATH,
    PARTICIPANT_MOUNT_PATH,
    PRODUCT_MOUNT_PATH,
    PUBLIC_ID_MOUNT_PATH,
    INBOX_RECEIVED_ORDERS_PATH,
    INBOX_RECEIVED_SHIPMENTS_PATH,
    INBOX_SHIPMENT_LINES_PATH,
    STOCK_PATH,
    LINES_PATH,
    ORDER_MOUNT_PATH,
    INPUT_FIELD_PREFIX,
    EVENTS,
    SHIPMENT_PATH
}
},{"../pdm-dsu-toolkit/constants":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/constants.js"}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/managers/BatchManager.js":[function(require,module,exports){
const {ANCHORING_DOMAIN, DB} = require('../constants');
const Manager = require("../../pdm-dsu-toolkit/managers/Manager");
const {Batch, Notification} = require('../model');
const getStockManager = require('./StockManager');
const getNotificationManager = require('./NotificationManager');
const {toPage, paginate} = require("../../pdm-dsu-toolkit/managers/Page");

/**
 * Batch Manager Class
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
 * @param {ParticipantManager} participantManager
 * @param {function(err, Manager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @class BatchManager
 * @extends Manager
 * @memberOf Managers
 */
class BatchManager extends Manager{
    constructor(participantManager, callback) {
        super(participantManager, DB.batches, ['gtin', 'batchNumber', 'expiry'], callback);
        this.stockManager = getStockManager(participantManager);
        this.notificationManager = getNotificationManager(participantManager);
        this.productService = new (require('../services/ProductService'))(ANCHORING_DOMAIN);
        this.batchService = new (require('../services/BatchService'))(ANCHORING_DOMAIN);
        this.participantManager = participantManager;
    }

    /**
     * generates the db's key for the batch
     * @param {string|number} gtin
     * @param {string|number} batchNumber
     * @return {string}
     * @private
     */
    _genCompostKey(gtin, batchNumber){
        return `${gtin}-${batchNumber}`;
    }

    /**
     * Must wrap the entry in an object like:
     * <pre>
     *     {
     *         index1: ...
     *         index2: ...
     *         value: item
     *     }
     * </pre>
     * so the DB can be queried by each of the indexes and still allow for lazy loading
     * @param {string} key
     * @param {Batch} item
     * @param {string|object} record
     * @return {object} the indexed object to be stored in the db
     * @protected
     * @override
     */
    _indexItem(key, item, record){
        return {
            gtin: key,
            batchNumber: item.batchNumber,
            expiry: item.expiry,
            status: item.batchStatus.status,
            value: record
        }
    };

    /**
     * Util function that loads a BatchDSU and reads its information
     * @param {string|KeySSI} keySSI
     * @param {function(err, Batch, Archive)} callback
     * @protected
     * @override
     */
    _getDSUInfo(keySSI, callback){
        return this.batchService.get(keySSI, callback);
    }

    /**
     * Creates a {@link Batch} dsu
     * @param {Product} product
     * @param {Batch} batch
     * @param {function(err, keySSI, string)} callback first keySSI if for the batch, the second for its' product dsu
     * @override
     */
    create(product, batch, callback) {
        let self = this;

        const gtin = product.gtin;

        self.batchService.create(gtin, batch, (err, keySSI) => {
            if (err)
                return callback(err);
            const record = keySSI.getIdentifier();
            const dbKey = self._genCompostKey(gtin, batch.batchNumber);

            const dbAction = function(dbKey, record, gtin, batch, product, callback){

                const cb = function(err, ...results){
                    if (err)
                        return self.cancelBatch(err2 => {
                            callback(err);
                        });
                    callback(undefined, ...results);
                }

                try {
                    self.beginBatch();
                } catch (e){ 
                    return self.batchSchedule(() => dbAction(dbKey, record, gtin, batch, product, callback));
                    //return callback(e);
                }

                self.insertRecord(dbKey, self._indexItem(gtin, batch, record), (err) => {
                    if(err){
                        console.log(`Could not inset record with gtin ${gtin} and batch ${batch.batchNumber} on table ${self.tableName}`);
                        return cb(err);
                    }
                    const path =`${self.tableName}/${dbKey}`;
                    console.log(`batch ${batch.batchNumber} created stored at '${path}'`);
    
                    self.batchAllow(self.stockManager);
    
                    self.stockManager.manage(product, batch, (err) => {   
                        self.batchDisallow(self.stockManager);

                        if(err){
                            console.log(`Error Updating Stock for ${product.gtin} batch ${batch.batchNumber}: ${err.message}`);
                            return cb(err);
                        }
                        console.log(`Stock for ${product.gtin} batch ${batch.batchNumber} updated`);
                        self.commitBatch((err) => {
                            if(err)
                                return cb(err);
                            callback(undefined, keySSI, path);
                        });                
                    });
                });
            }

            dbAction(dbKey, record, gtin, batch, product, callback);

        });
    }

    /**
     * reads the specific Batch information from a given gtin (if exists and is registered to the mah)
     *
     * @param {string|number} gtin
     * @param {string|number} batchNumber
     * @param {boolean} [readDSU] defaults to true. decides if the manager loads and reads from the dsu or not
     * @param {function(err, Batch|KeySSI, Archive)} callback returns the batch if readDSU, the keySSI otherwise
     * @override
     */
    getOne(gtin, batchNumber, readDSU, callback){
        let key;
        if (!callback){
            if (typeof batchNumber === 'boolean'){
                key = gtin;
                callback = readDSU;
                readDSU = batchNumber;
            } else {
                callback = readDSU;
                readDSU = true;
                key = this._genCompostKey(gtin, batchNumber)
            }
        } else {
            key = this._genCompostKey(gtin, batchNumber);
        }
        super.getOne(key, readDSU, callback);
    }

    /**
     * Removes a product from the list (does not delete/invalidate DSU, simply 'forgets' the reference)
     * @param {string|number} gtin
     * @param {string|number} batchNumber
     * @param {function(err)} callback
     * @override
     */
    remove(gtin, batchNumber, callback) {
        super.remove(this._genCompostKey(gtin, batchNumber), callback);
    }

    /**
     *
     * @param model
     * @returns {Batch}
     * @override
     */
    fromModel(model){
        return new Batch(super.fromModel(model));
    }

    /**
     * updates a Batch from the list
     * @param {string|number} gtin
     * @param {Batch} newBatch
     * @param {function(err, Batch?, Archive?)} callback
     * @override
     */
    update(gtin, newBatch, callback){
        if (!callback)
            return callback(`No gtin Provided...`);

        const self = this;
        const key = this._genCompostKey(gtin, newBatch.batchNumber);
        self.getRecord(key, (err, record) => {
            if (err)
                return self._err(`Unable to retrieve record with key ${key} from table ${self._getTableName()}`, err, callback);
            self.batchService.update(gtin, record.value, newBatch, (err, updatedBatch, batchDsu) => {
                if (err)
                    return self._err(`Could not Update Batch DSU`, err, callback);

                const cb = function(err, ...results){
                    if (err)
                        return self.cancelBatch((err2) => {
                            callback(err);
                        });
                    callback(undefined, ...results);
                }

                const dbOperation = function (gtin, updatedBatch, record, callback){
                    try {
                        self.beginBatch();
                    } catch(e) {
                        return self.batchSchedule(() => dbOperation(gtin, updatedBatch, record, callback));
                    }

                    self.updateRecord(key, self._indexItem(gtin, updatedBatch, record.value), (err) => {
                        if (err)
                            return cb(err);
                        // callback(undefined, updatedBatch, batchDsu);

                        self.stockManager.getOne(gtin, true, (err, stock) => {
                            if (err)
                                return cb(err); //TODO: if not in stock, it must be in transit. handle shipments.
                            const batch = stock.batches.find(b => b.batchNumber === updatedBatch.batchNumber);
                            if (!batch)
                                return cb(`could not find batch`)  //TODO: if not in stock, it must be in transit. handle shipments.
                            batch.batchStatus = updatedBatch.batchStatus;
                            self.batchAllow(self.stockManager);
                            self.stockManager.update(gtin, stock, (err) => {
                                self.batchDisallow(self.stockManager);
                                if (err)
                                    return cb(err);
                                self.commitBatch((err) => {
                                    if (err)
                                        return cb(err);
                                    self.stockManager.refreshController();
                                    const productManager = self.participantManager.getManager('ProductManager');

                                    productManager.refreshController();

                                    self.stockManager.getStockTraceability(gtin, {manufName: self.getIdentity().id, batch: batch.batchNumber}, (err, results) => {
                                        if (err || !results){
                                            console.log(`Could not calculate partners with batch to send`, err, results);
                                            return callback(undefined, updatedBatch, batchDsu);
                                        }

                                        const {partnersStock} = results;
                                        if (!partnersStock){
                                            console.log(`No Notification required. No stock found outside the producer for gtin ${gtin}, batch ${batch.batchNumber}`);
                                            return callback(undefined, updatedBatch, batchDsu);
                                        }


                                        const toBeNotified = Object.keys(partnersStock);

                                        const batchNotification = new Notification({
                                            subject: self.tableName,
                                            body: {
                                                gtin: gtin,
                                                batch: {
                                                    batchNumber: batch.batchNumber,
                                                    expiry: batch.expiry,
                                                    batchStatus: batch.batchStatus
                                                }
                                            }
                                        });

                                        self.notificationManager.pushToAll(toBeNotified, batchNotification, (err) => {
                                            if (err)
                                                console.log(`Could not send notifications to partners`, err);
                                            callback(undefined, updatedBatch);
                                        });
                                    });
                                });
                            });
                        });
                    });
                }

                dbOperation(gtin, updatedBatch, record, callback);
            });
        });
    }

}

/**
 * @param {BaseManager} participantManager
 * @param {function(err, Manager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @returns {BatchManager}
 * @memberOf Managers
 */
const getBatchManager = function (participantManager, callback) {
    let manager;
    try {
       manager = participantManager.getManager(BatchManager);
        if (callback)
            return callback(undefined, manager);
    } catch (e){
       manager = new BatchManager(participantManager, callback);
    }

    return manager;
}

module.exports = getBatchManager;

},{"../../pdm-dsu-toolkit/managers/Manager":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/managers/Manager.js","../../pdm-dsu-toolkit/managers/Page":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/managers/Page.js","../constants":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/constants.js","../model":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/index.js","../services/BatchService":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/services/BatchService.js","../services/ProductService":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/services/ProductService.js","./NotificationManager":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/managers/NotificationManager.js","./StockManager":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/managers/StockManager.js"}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/managers/DirectoryManager.js":[function(require,module,exports){
const { DB, DEFAULT_QUERY_OPTIONS } = require('../constants');
const Manager = require("../../pdm-dsu-toolkit/managers/Manager");
const {DirectoryEntry, ROLE } = require('../model/DirectoryEntry');

/**
 * Stores references to some entities for quicker lookup on the front end (eg, products, suppliers, etc)
 *
 * @param {ParticipantManager} participantManager the top-level manager for this participant, which knows other managers.
 * @param {string} tableName the default table name for this manager eg: MessageManager will write to the messages table
 * @module managers
 * @class DirectoryManager
 * @extends Manager
 * @memberOf Managers
 */
class DirectoryManager extends Manager {
    constructor(participantManager, callback) {
        super(participantManager, DB.directory, ['role', 'id'], callback);
    }

    _testRoles(role){
        return Object.values(ROLE).indexOf(role) !== -1;
    }

    saveEntry(role, id, callback){
        if (!this._testRoles(role))
            return callback(`invalid role provided`);
        const entry = new DirectoryEntry({
            id: id,
            role: role
        });
        return this.create(entry, callback)
    }

    /**
     * generates the db's key for the Directory entry
     * @param {string|number} role
     * @param {string|number} id
     * @return {string}
     * @protected
     */
    _genCompostKey(role, id){
        return `${role}-${id}`;
    }

    /**
     * Creates a {@link DirectoryEntry}
     * @param {string} key the readSSI to the order that generates the shipment
     * @param {string|number} [key] the table key
     * @param {DirectoryEntry} entry
     * @param {function(err, sReadSSI, dbPath)} callback where the dbPath follows a "tableName/shipmentId" template.
     * @override
     */
    create(key, entry, callback) {
        let self = this;
        if (!callback){
            callback = entry;
            entry = key;
            key = self._genCompostKey(entry.role, entry.id);
        }

        const matchEntries = function(fromDb){
            try{
                return entry.role === fromDb.role && entry.id === fromDb.id;
            } catch(e){
                return false;
            }
        }

        self.getOne(key, (err, existing) => {
            if (!err && !!existing){
                if (matchEntries(existing)) {
                    console.log(`Entry already exists in directory. skipping`);
                    return callback(undefined, existing);
                } else
                    return callback(`Provided directory entry does not match existing.`);
            }

            self.insertRecord(key, entry, (err) => {
                if (err)
                    return self._err(`Could not insert directory entry ${entry.id} on table ${self.tableName}`, err, callback);
                const path = `${self.tableName}/${key}`;
                console.log(`Directory entry for ${entry.id} as a ${entry.role} created stored at DB '${path}'`);
                callback(undefined, entry, path);
            });
        });
    }

    /**
     * Loads the Directory entry for the provided key
     * @param {string} key
     * @param {boolean} [readDSU] does nothing in this manager
     * @param {function(err, DirectoryEntry)} callback returns the Entry
     * @override
     */
    getOne(key, readDSU,  callback) {
        if (!callback){
            callback = readDSU;
            readDSU = true;
        }
        let self = this;
        self.getRecord(key, (err, entry) => {
            if (err)
                return self._err(`Could not load record with key ${key} on table ${self._getTableName()}`, err, callback);
            callback(undefined, entry);
        });
    }

    /**
     * @protected
     * @override
     */
    _keywordToQuery(keyword) {
        keyword = keyword || '.*';
        return [[`role like /${keyword}/g`]];
    }

    /**
     * Lists all registered items according to query options provided
     * @param {boolean} [readDSU] defaults to true. decides if the manager loads and reads from the dsu's {@link INFO_PATH} or not
     * @param {object} [options] query options. defaults to {@link DEFAULT_QUERY_OPTIONS}
     * @param {function(err, object[])} callback
     * @override
     */
    getAll(readDSU, options, callback){
        const defaultOptions = () => Object.assign({}, DEFAULT_QUERY_OPTIONS, {
            query: ['role like /.*/g']
        });

        if (!callback){
            if (!options){
                callback = readDSU;
                options = defaultOptions();
                readDSU = true;
            }
            if (typeof readDSU === 'boolean'){
                callback = options;
                options = defaultOptions();
            }
            if (typeof readDSU === 'object'){
                callback = options;
                options = readDSU;
                readDSU = true;
            }
        }

        options = options || defaultOptions();

        let self = this;
        console.log(`Db lock status for ${self.tableName}`, self.dbLock.isLocked())
        self.query(options.query, options.sort, options.limit, (err, records) => {
            if (err)
                return self._err(`Could not perform query`, err, callback);
            if (!readDSU)
                return callback(undefined, records.map(r => r.id));
            callback(undefined, records);
        });
    }

}

/**
 * @param {ParticipantManager} participantManager
 * @param {function(err, Manager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @returns {DirectoryManager}
 * @memberOf Managers
 */
const getDirectoryManager = function (participantManager, callback) {
    let manager;
    try {
        manager = participantManager.getManager(DirectoryManager);
        if (callback)
            return callback(undefined, manager);
    } catch (e){
        manager = new DirectoryManager(participantManager, callback);
    }

    return manager;
}

module.exports = getDirectoryManager;
},{"../../pdm-dsu-toolkit/managers/Manager":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/managers/Manager.js","../constants":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/constants.js","../model/DirectoryEntry":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/DirectoryEntry.js"}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/managers/IndividualProductManager.js":[function(require,module,exports){
const {INFO_PATH, ANCHORING_DOMAIN, DB, DEFAULT_QUERY_OPTIONS} = require('../constants');
const Manager = require("../../pdm-dsu-toolkit/managers/Manager");
const IndividualProduct = require('../model/IndividualProduct');
const {toPage, paginate} = require("../../pdm-dsu-toolkit/managers/Page");

/**
 * IndividualProduct Manager Class
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
 * @param {ParticipantManager} participantManager
 * @param {function(err, IndividualProductManager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @class IndividualProductManager
 * @extends Manager
 * @memberOf Managers
 */
class IndividualProductManager extends Manager {
    constructor(participantManager, callback) {
        super(participantManager, DB.individualProduct, ['gtin', 'batchNumber', 'serialNumber', 'status'], callback);
        this.individualProductService = new (require('../services/IndividualProductService'))(ANCHORING_DOMAIN);
        this.participantManager = participantManager;
    }

    /**
     * Processes the received messages, saves them to the the table and deletes the message
     * @param {*} message
     * @param {function(err)} callback
     * @protected
     * @override
     */
    _processMessageRecord(message, callback) {
        let self = this;
        if (!message || typeof message !== "string")
            return callback(`Message ${message} does not have  non-empty string with keySSI. Skipping record.`);
        self._getDSUInfo(message, (err, product) => {
            if (err)
                return self._err(`Could not read DSU from message keySSI in record ${message}. Skipping record.`, err, callback);
            console.log(`Received IndividualProduct`, product);
            const key = self._genCompostKey(product.gtin, product.batchNumber, product.serialNumber);
            self.insertRecord(key, self._indexItem(key, product, message), callback);
        });
    };

    /**
     * generates the db's key for the batch
     * @param {string|number} gtin
     * @param {string|number} batchNumber
     * @param {string|number} serialNumber
     * @return {string}
     * @private
     */
    _genCompostKey(gtin, batchNumber, serialNumber){
        return `${gtin}-${batchNumber}-${serialNumber}`;
    }

    /**
     * Must wrap the entry in an object like:
     * <pre>
     *     {
     *         index1: ...
     *         index2: ...
     *         value: item
     *     }
     * </pre>
     * so the DB can be queried by each of the indexes and still allow for lazy loading
     * @param {string} key
     * @param {IndividualProduct} item
     * @param {string|object} record
     * @return {object} the indexed object to be stored in the db
     * @protected
     * @override
     */
    _indexItem(key, item, record){
        if (!record){
            record = item;
            item = key;
            key = undefined;
        }
        return {
            gtin: item.gtin,
            batchNumber: item.batchNumber,
            serialNumber: item.serialNumber,
            status: item.status,
            value: record
        }
    };

    /**
     * Util function that loads a ProductDSU and reads its information
     * @param {string|KeySSI} keySSI
     * @param {function(err, IndividualProduct, Archive)} callback
     * @protected
     * @override
     */
    _getDSUInfo(keySSI, callback){
        return this.individualProductService.get(keySSI, callback);
    }

    /**
     * Creates a {@link Product} dsu
     * @param {IndividualProduct} product
     * @param {function(err, keySSI, string)} callback where the string is the mount path relative to the main DSU
     * @override
     */
    create(product, callback) {
        let self = this;
        self.individualProductService.create(product, (err, keySSI) => {
            if (err)
                return self._err(`Could not create individual product DSU for ${product}`, err, callback);
            const record = keySSI.getIdentifier();
            const key = self._genCompostKey(product.gtin, product.batchNumber, product.serialNumber);
            self.insertRecord(key, self._indexItem(key, product, record), (err) => {
                if (err)
                    return self._err(`Could not insert record with gtin ${product.gtin} on table ${self.tableName}`, err, callback);
                const path =`${self.tableName}/${product.gtin}`;
                console.log(`IndividualProduct ${key} created & stored at '${path}'`);
                callback(undefined, keySSI, path);
            });
        });
    }

    /**
     * reads ssi for that gtin in the db. loads is and reads the info at '/info'
     * @param {string} gtin
     * @param {boolean} [readDSU] defaults to true. decides if the manager loads and reads from the dsu or not
     * @param {function(err, Product|KeySSI, Archive)} callback returns the Product if readDSU and the dsu, the keySSI otherwise
     * @override
     */
    getOne(gtin, readDSU,  callback) {
        super.getOne(gtin, readDSU, callback);
    }

    /**
     * Removes a product from the list (does not delete/invalidate DSU, simply 'forgets' the reference)
     * @param {string|number} gtin
     * @param {function(err)} callback
     * @override
     */
    remove(gtin, callback) {
        super.remove(gtin, callback);
    }

    /**
     * updates a product from the list
     * @param {string|number} [gtin] the table key
     * @param {Product} newProduct
     * @param {function(err, Product, Archive)} callback
     * @override
     */
    update(gtin, newProduct, callback){
        return callback(`Functionality not available`);
    }


    /**
     * Lists all registered items according to query options provided
     * @param {boolean} [readDSU] defaults to true. decides if the manager loads and reads from the dsu's {@link INFO_PATH} or not
     * @param {object} [options] query options. defaults to {@link DEFAULT_QUERY_OPTIONS}
     * @param {function(err, object[])} callback
     * @override
     */
    getAll(readDSU, options, callback){
        const defaultOptions = () => Object.assign({}, DEFAULT_QUERY_OPTIONS, {
            query: ['__timestamp > 0'],
            sort: "dsc"
        });

        if (!callback){
            if (!options){
                callback = readDSU;
                options = defaultOptions();
                readDSU = true;
            }
            if (typeof readDSU === 'boolean'){
                callback = options;
                options = defaultOptions();
            }
            if (typeof readDSU === 'object'){
                callback = options;
                options = readDSU;
                readDSU = true;
            }
        }

        options = options || defaultOptions();

        super.getAll(readDSU, options, callback);
    }

    /**
     *
     * @param model
     * @returns {IndividualProduct}
     * @override
     */
    fromModel(model){
        return new IndividualProduct(super.fromModel(model));
    }
}

/**
 * @param {ParticipantManager} [participantManager] only required the first time, if not forced
 * @param {function(err, IndividualProductManager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @returns {IndividualProductManager}
 * @memberOf Managers
 */
const getIndividualProductManager = function (participantManager, callback) {
    let manager;
    try {
        manager = participantManager.getManager(IndividualProductManager);
        if (callback)
            return callback(undefined, manager);
    } catch (e){
        manager = new IndividualProductManager(participantManager, callback);
    }

    return manager;
}

module.exports = getIndividualProductManager;
},{"../../pdm-dsu-toolkit/managers/Manager":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/managers/Manager.js","../../pdm-dsu-toolkit/managers/Page":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/managers/Page.js","../constants":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/constants.js","../model/IndividualProduct":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/IndividualProduct.js","../services/IndividualProductService":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/services/IndividualProductService.js"}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/managers/IssuedOrderManager.js":[function(require,module,exports){
const { DB, DEFAULT_QUERY_OPTIONS, SHIPMENT_PATH, INFO_PATH } = require('../constants');
const OrderManager = require("./OrderManager");
const {Order, OrderStatus, ShipmentStatus, Batch} = require('../model');
const Manager = require("../../pdm-dsu-toolkit/managers/Manager");
const {toPage, paginate} = require("../../pdm-dsu-toolkit/managers/Page");
const utils = require('../services').utils

/**
 * Issued Order Manager Class - concrete OrderManager for issuedOrders.
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
 * @param {ParticipantManager} participantManager
 * @param {function(err, Manager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @class IssuedOrderManager
 * @extends Manager
 * @memberOf Managers
 */
class IssuedOrderManager extends OrderManager {
    constructor(participantManager, callback) {
        super(participantManager, DB.issuedOrders, ['senderId', 'shipmentId'], callback);
        this.stockManager = participantManager.stockManager;
    }

    /**
     * Must wrap the DB entry in an object like:
     * <pre>
     *     {
     *         index1: ...
     *         index2: ...
     *         value: item
     *     }
     * </pre>
     * so the DB can be queried by each of the indexes and still allow for lazy loading
     * @param {string} key
     * @param {Order} item
     * @param {string|object} record
     * @return {object} the indexed object to be stored in the db
     * @protected
     * @override
     */
    _indexItem(key, item, record) {
        return {...super._indexItem(key, item, record), senderId: item.senderId};
    }

    /**
     * Creates a {@link Order} dsu
     * @param {string|number} [orderId] the table key
     * @param {Order} order
     * @param {function(err, sReadSSI, dbPath)} callback where the dbPath follows a "tableName/orderId" template.
     */
    create(orderId, order, callback) {
        if (!callback){
            callback = order;
            order = orderId;
            orderId = order.orderId;
        }
        let self = this;

        self.orderService.create(order, (err, keySSI, orderLinesSSIs) => {
            if (err)
                return self._err(`Could not create product DSU for ${order}`, err, callback);                
            const keySSIStr = keySSI.getIdentifier();
            const sReadSSI = keySSI.derive();
            const sReadSSIStr = sReadSSI.getIdentifier();
            console.log("Order seedSSI="+keySSIStr+" sReadSSI="+sReadSSIStr);
            // storing the sReadSSI in base58
            self.insertRecord(super._genCompostKey(order.senderId, order.orderId), self._indexItem(orderId, order, keySSIStr), (err) => {
                if (err)
                    return self._err(`Could not insert record with orderId ${orderId} on table ${self.tableName}`, err, callback);
                const path = `${self.tableName}/${orderId}`;
                console.log(`Order ${orderId} created stored at DB '${path}'`);
                // send a message to senderId
                // TODO send the message before inserting record ? The message gives error if senderId does not exist/not listening.
                // TODO derive sReadSSI from keySSI
                this.sendMessage(order.senderId, DB.receivedOrders, sReadSSIStr, (err) => {
                    if (err)
                        return self._err(`Could not sent message to ${order.senderId} ${order.orderId} with ${DB.receivedOrders}`, err, callback);
                    console.log("Message sent to "+order.senderId+", "+DB.receivedOrders+", "+sReadSSIStr);
                    callback(undefined, keySSI, path);
                });
            });
        });
    }

    /**
     * Lists all issued orders.
     * @param {boolean} [readDSU] defaults to true. decides if the manager loads and reads from the dsu's {@link INFO_PATH} or not
     * @param {object} [options] query options. defaults to {@link DEFAULT_QUERY_OPTIONS}
     * @param {function(err, Order[])} callback
     */
    getAll(readDSU, options, callback) {
        const defaultOptions = () => Object.assign({}, DEFAULT_QUERY_OPTIONS);

        if (!callback) {
            if (!options) {
                callback = readDSU;
                options = defaultOptions();
                readDSU = true;
            }
            if (typeof readDSU === 'boolean') {
                callback = options;
                options = defaultOptions();
            }
            if (typeof readDSU === 'object') {
                callback = options;
                options = readDSU;
                readDSU = true;
            }
        }

        options = options || defaultOptions();

        let self = this;
        super.getAll(readDSU, options, (err, result) => {
            if (err)
                return self._err(`Could not parse IssuedOrders ${JSON.stringify(result)}`, err, callback);
            console.log(`Parsed ${result.length} orders`);
            callback(undefined, result);
        });
    }

    /**
     *
     * @param [order]
     * @override
     */
    refreshController(order) {
        const props = order ? {
                mode: 'issued',
                order: order
            } : undefined;
        super.refreshController(props);
    }

    updateOrderByShipment(orderId, shipmentSSI, shipment, callback){
        const getOrderStatusByShipment = function(shipmentStatus){
            switch (shipmentStatus){
                case ShipmentStatus.CREATED:
                    return OrderStatus.ACKNOWLEDGED;
                default:
                    return shipmentStatus;
            }
        }

        /**
         * Message/ExtraInfo by default follows the model: `{SENDER_ID} {TIMESTAMP} {MESSAGE}`,
         * so need to be sanitized to remove {SENDER_ID} and {TIMESTAMP}, because {REQUESTER_ID}
         * just needs the message
         * @param {Status} status
         * @param {{}} extraInfo
         * @returns {string}
         */
        const getExtraInfoMsg = function (status, extraInfo) {
            if (!extraInfo)
                return '';

            const statusStr = status.status;
            if (!extraInfo.hasOwnProperty(statusStr))
                return '';

            const lastLog = status.log[status.log.length - 1]
            const extraInfoUpdated = extraInfo[statusStr].filter(_extraInfo => {
                // verify if extraInfo.timestamp ===log.timestamp
                return _extraInfo.split(' ')[1].trim() === lastLog.split(' ')[1].trim()
            })
            if (extraInfoUpdated.length > 0) {
                return extraInfoUpdated[0].split(' ').slice(2).join(' ').trim(); // sanitized
            } else {
                return '';
            }
        }

        const update = super.update.bind(this);

        console.log(`Updating order ${orderId} with shipment ${shipment.shipmentId}`);

        const self = this;
        const key = this._genCompostKey(shipment.senderId, orderId);
        self.getOne(key, true, (err, order) => {
            if (err)
                return self._err(`Could not load Order`, err, callback);
            order.status['status'] = getOrderStatusByShipment(shipment.status.status);
            order.status['extraInfo'] = getExtraInfoMsg(shipment.status, shipment.status.extraInfo);
            console.log(`Order Status for Issued Order ${key} to be updated to ${order.status.status}`);
            order.shipmentSSI = shipmentSSI;

            const dbAction = function(key, order, callback){

                try {
                    self.beginBatch();
                } catch (e){
                    return self.batchSchedule(() => dbAction(key, order, callback));
                    //return callback(e);
                }

                const cb = function(err, ...results){
                    if (err)
                        return self.cancelBatch(err2 => {
                            callback(err);
                        });
                    callback(undefined, ...results);
                }

                update(key, order, (err) => {
                    if (err)
                        return cb(`Could not update Order:\n${err.message}`);
                    self.commitBatch((err) => {
                        if(err)
                            return cb(err);

                        console.log(`Order Status for Issued Order ${key} updated to ${order.status}`);
                        self.refreshController(order);
                        return callback();
                    });         
                });
            }

            dbAction(key, order, callback);
        });
    }

    /**
     * updates an item
     *
     * @param {string} [key] key is optional so child classes can override them
     * @param {Order} order
     * @param {function(err, Order?, Archive?)} callback
     */
    update(key, order, callback){
        if (!callback){
            callback = order;
            order = key;
            key = this._genCompostKey(order.senderId, order.orderId);
        }

        const update = super.update.bind(this);

        const self = this;

        self.getOne(key, false,(err, record) => {
            if (err)
                return callback(err);
                
            const dbAction = function(key, order, record, callback){
                const cb = function(err, ...results){
                    if (err)
                        return self.cancelBatch(err2 => {
                            callback(err);
                        });
                    callback(undefined, ...results);
                }
                
                try {
                    self.beginBatch();
                } catch (e){
                    return self.batchSchedule(() => dbAction(key, order, record, callback));
                    //return callback(e);
                }

                update(key, order, (err, updatedOrder, dsu) => {
                    if (err)
                        return cb(err);

                    const sendMessages = function(){
                        const sReadSSIStr = utils.getKeySSISpace().parse(record).derive().getIdentifier();
                        self.sendMessagesAsync(order, sReadSSIStr);
                        callback(undefined, updatedOrder, dsu);
                    }

                    if (order.status.status !== OrderStatus.CONFIRMED)
                        return self.commitBatch((err) => {
                            if(err)
                                return cb(err);
                            sendMessages();
                        });

                    // Get all the shipmentLines from the shipment so we can add it to the stock
                    dsu.readFile(`${SHIPMENT_PATH}${INFO_PATH}`, (err, data) => {
                        if (err)
                            return cb(`Could not get ShipmentLines SSI`);

                        let shipment;
                        try {
                            shipment = JSON.parse(data);
                        } catch (e) {
                            return cb(e);
                        }
                        const gtins = shipment.shipmentLines.map(sl => sl.gtin);
                        const batchesToAdd = shipment.shipmentLines.reduce((accum, sl) => {
                            accum[sl.gtin] = accum[sl.gtin] || [];
                            accum[sl.gtin].push(new Batch({
                                batchNumber: sl.batch,
                                quantity: sl.quantity,
                                serialNumbers: sl.serialNumbers
                            }))
                            return accum;
                        }, {});

                        const result = {};

                        const gtinIterator = function(gtins, batchObj, callback){
                            const gtin = gtins.shift();
                            if (!gtin)
                                return callback(undefined, result);
                            const batches = batchObj[gtin];
                            self.batchAllow(self.stockManager);
                            self.stockManager.manageAll(gtin, batches, (err, newStocks) => {
                                self.batchDisallow(self.stockManager);
                                if (err)
                                    return callback(err);
                                result[gtin] = result[gtin] || [];
                                result[gtin].push(newStocks);
                                gtinIterator(gtins, batchObj, callback);
                            });
                        }

                        gtinIterator(gtins.slice(), batchesToAdd, (err, result) => {
                            if (err)
                                return cb(`Could not update Stock`);

                            self.commitBatch((err) => {
                                if(err)
                                    return cb(err);

                                console.log(`Stocks updated`, result);
                                sendMessages();
                            });
                        })
                    });
                });
            }

            dbAction(key, order, record, callback);
        });
    }

    sendMessagesAsync(order, orderSSI){
        const self = this;
        self.sendMessage(order.senderId, DB.receivedOrders, orderSSI, (err) =>
            self._messageCallback(err ?
                `Could not sent message to ${order.orderId} with ${DB.receivedOrders}` :
                "Message sent to "+order.senderId+", "+DB.receivedOrders+", "+orderSSI));
    }

    /**
     * Creates a blank {@link Order} with some specific initializations.
     * Uses the participantManager to obtain some data.
     * @param {function(err, order)} callback
     */
    newBlank(callback) {
        let self = this;
        self.getIdentity((err, participant) => {
            if (err) {
                return callback(err);
            }
            let orderId = Date.now(); // TODO sequential unique numbering ? It should comes from the ERP anyway.
            let requesterId = participant.id;
            let senderId = '';
            let shipToAddress = participant.address;
            let order = new Order(orderId, requesterId, senderId, shipToAddress, OrderStatus.CREATED, []);
            callback(undefined, order);
        });
    }

    /**
     * Convert an Order into a OrderControler view model. 
     * The order.orderLines are converted to a special format. See locale.js
     * @param {Order} object the business model object
     * @param model the Controller's model object
     * @returns {{}}
     */
    toModel(object, model) {
        model = model || {};
        for (let prop in object) {
            //console.log("prop", prop, "=='orderLines'", prop=="orderLines");
            if (object.hasOwnProperty(prop)) {
                if (!model[prop])
                    model[prop] = {};
                if (prop == "orderLines") {
                    model[prop].value = "";
                    let sep = "";
                    object[prop].forEach((orderLine) => {
                        model[prop].value += sep + orderLine.gtin + "," + orderLine.quantity;
                        sep = ";";
                    });
                } else {
                    model[prop].value = object[prop];
                }
            }
        }
        return model;
    }
}

/**
 * @param {ParticipantManager} participantManager
 * @param {function(err, Manager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @returns {IssuedOrderManager}
 * @memberOf Managers
 */
const getIssuedOrderManager = function (participantManager, callback) {
    let manager;
    try {
        manager = participantManager.getManager(IssuedOrderManager);
        if (callback)
            return callback(undefined, manager);
    } catch (e){
        manager = new IssuedOrderManager(participantManager, callback);
    }

    return manager;
}

module.exports = getIssuedOrderManager;

},{"../../pdm-dsu-toolkit/managers/Manager":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/managers/Manager.js","../../pdm-dsu-toolkit/managers/Page":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/managers/Page.js","../constants":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/constants.js","../model":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/index.js","../services":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/services/index.js","./OrderManager":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/managers/OrderManager.js"}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/managers/IssuedShipmentManager.js":[function(require,module,exports){
const { DB, DEFAULT_QUERY_OPTIONS } = require('../constants');
const ShipmentManager = require("./ShipmentManager");
const getReceivedOrderManager = require("./ReceivedOrderManager");
const {Shipment, Order, OrderStatus, ShipmentStatus, Wholesaler, Batch} = require('../model');
const {toPage, paginate} = require("../../pdm-dsu-toolkit/managers/Page");


/**
 * Issued Shipment Manager Class - concrete ShipmentManager for issuedShipments.
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
 * @param {ParticipantManager} participantManager
 * @param {function(err, Manager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @class IssuedShipmentManager
 * @extends Manager
 * @memberOf Managers
 */
class IssuedShipmentManager extends ShipmentManager {
    constructor(participantManager, callback) {
        super(participantManager, DB.issuedShipments, ['senderId', 'requesterId'], callback);
        this.participantManager = participantManager;
        this.stockManager = participantManager.stockManager;
    }

    /**
     * Must wrap the DB entry in an object like:
     * <pre>
     *     {
     *         index1: ...
     *         index2: ...
     *         value: item
     *     }
     * </pre>
     * so the DB can be queried by each of the indexes and still allow for lazy loading
     * @param {string} [key]
     * @param {Shipment} item
     * @param {string|object} record
     * @return {object} the indexed object to be stored in the db
     * @protected
     * @override
     */
    _indexItem(key, item, record) {
        if (!record){
            record = item;
            item = key;
            key = undefined;
        }
        return {...super._indexItem(key, item, record), requesterId: item.requesterId};
    }

    /**
     * Binds the {@link Shipment#shipmentId} to the shipment and fills in participant details;
     * @param {Shipment} shipment
     * @param {function(err, Shipment)} callback
     * @private
     */
    _bindParticipant(shipment, callback){
        shipment.shipmentId = shipment.shipmentId || Date.now();

        let self = this;
        self.getIdentity((err, wholesaler) => {
            if (err)
                return self._err(`Could not retrieve identity`, err, callback);
            wholesaler = new Wholesaler(wholesaler);
            shipment.senderId = wholesaler.id;
            shipment.shipFromAddress = wholesaler.originAddress || wholesaler.address;
            shipment.shipmentLines = shipment.shipmentLines.map(sl => {
                sl.senderId = wholesaler.id;
                sl.status = shipment.status;
                return sl;
            })
            callback(undefined, shipment);
        });
    }


    /**
     * Creates a {@link Shipment} dsu
     * @param {string} orderId the id to the received order that generates the shipment
     * @param {Shipment} shipment
     * @param {function(err, KeySSI, dbPath)} callback where the dbPath follows a "tableName/shipmentId" template.
     * @override
     */
    create(orderId, shipment, callback) {
        let self = this;

        const cb = function(err, ...results){
            if (err)
                return self.cancelBatch(err2 => {
                    callback(err);
                });
            callback(undefined, ...results);
        }

        const createInner = function(callback){
            const receivedOrderManager = getReceivedOrderManager(self.participantManager);
                const receivedOrderKey = receivedOrderManager._genCompostKey(shipment.requesterId, orderId);

            receivedOrderManager.getOne(receivedOrderKey, true, (err, order, orderDSU, orderSSI) => {
                if(err)
                    return cb(`Could not retrieve received order ${orderId}`);
                self.shipmentService.create(shipment, orderSSI, (err, keySSI, shipmentLinesSSIs) => {
                    if(err)
                        return cb(`Could not create product DSU for ${shipment}`);
                    const record = keySSI.getIdentifier();
                    console.log("Shipment SSI=" + record);
                    self.insertRecord(self._genCompostKey(shipment.requesterId, shipment.shipmentId), self._indexItem(shipment, record), (err) => {
                        if(err)
                            return cb(`Could not insert record with shipmentId ${shipment.shipmentId} on table ${self.tableName}`);

                        const path = `${self.tableName}/${shipment.shipmentId}`;
                        console.log(`Shipment ${shipment.shipmentId} created stored at DB '${path}'`);
                        const aKey = keySSI.getIdentifier();
                        self.sendMessagesAsync(shipment, shipmentLinesSSIs, aKey);
                        callback(undefined, keySSI, path);
                    });
                });
            });
        }

        const gtinIterator = function(gtins, batchesObj, callback){
            const gtin = gtins.shift();
            if (!gtin)
                return callback();
            if (!(gtin in batchesObj))
                return callback(`gtins not found in batches`);
            const batches = batchesObj[gtin];
            //console.log("Going to self.stockManager.manageAll(", gtin, batches);
            self.batchAllow(self.stockManager);
            self.stockManager.manageAll(gtin,  batches, (err, removed) => {
                self.batchDisallow(self.stockManager);

                if(err) {
                    console.log(err);
                    return cb(`Could not update Stock for orderId=${orderId} because of ${err}`);
                }
                if (self.stockManager.serialization && self.stockManager.aggregation)
                    shipment.shipmentLines.filter(sl => sl.gtin === gtin && Object.keys(removed).indexOf(sl.batch) !== -1).forEach(sl => {
                        sl.serialNumbers = removed[sl.batch];
                    });
                else
                    shipment.shipmentLines = shipment.shipmentLines.map(sl => {
                        sl.serialNumbers = undefined;
                        return sl;
                    });
                gtinIterator(gtins, batchesObj, callback);
            })
        }

        const gtins = shipment.shipmentLines.map(sl => sl.gtin);
        const batchesObj = shipment.shipmentLines.reduce((accum, sl) => {
            accum[sl.gtin] = accum[sl.gtin] || [];
            accum[sl.gtin].push(new Batch({
                batchNumber: sl.batch,
                quantity: (-1) * sl.quantity
            }))
            return accum;
        }, {});

        const dbAction = function (gtins, batchesObj, callback){
            //console.log(`dbAction for orderId=${orderId}`, gtins, batchesObj, shipment);

            try {
                self.beginBatch();
            } catch (e){
                return self.batchSchedule(() => dbAction(gtins, batchesObj, callback));
                //return callback(e);
            }

            gtinIterator(gtins, batchesObj, (err) => {
                if(err)
                    return cb(`Could not retrieve info from stock for orderId=${orderId} because of ${err}`);
                console.log(`Shipment updated after Stock confirmation for orderId=${orderId}`);
                createInner((err, keySSI, path) => {
                    if(err)
                        return cb(`Could not create Shipment for orderId=${orderId} because of ${err}`);
                    self.commitBatch((err) => {
                        if(err)
                            return cb(err);
                        console.log(`Shipment ${shipment.shipmentId} created!`);
                        callback(undefined, keySSI, path);
                    });
                })
            });
        }

        dbAction(gtins, batchesObj, callback);
    }

    sendMessagesAsync(shipment, shipmentLinesSSIs, aKey){
        if (!aKey){
            aKey = shipmentLinesSSIs;
            shipmentLinesSSIs = undefined;
        }

        const self = this;
        self.sendMessage(shipment.requesterId, DB.receivedShipments, aKey, (err) =>
            self._messageCallback(err ? `Could not sent message to ${shipment.shipmentId} with ${DB.receivedShipments}: ${err}` : err,
                `Message sent to ${shipment.requesterId}, ${DB.receivedShipments}, ${aKey}`));
        if (shipmentLinesSSIs)
            self.sendShipmentLinesToMAH([...shipment.shipmentLines], [...shipmentLinesSSIs], (err) =>
                self._messageCallback( err ? `Could not transmit shipmentLines to The manufacturers` : 'Lines Notice sent to Manufacturers'));
    }

    /**
     *
     * @param err
     * @param message
     * @protected
     * @override
     */
    _messageCallback(err, message) {
        super._messageCallback(err, message);
    }

    /**
     * Lists all issued orders.
     * @param {boolean} [readDSU] defaults to true. decides if the manager loads and reads from the dsu's {@link INFO_PATH} or not
     * @param {object} [options] query options. defaults to {@link DEFAULT_QUERY_OPTIONS}
     * @param {function(err, Order[])} callback
     */
    getAll(readDSU, options, callback) {
        const defaultOptions = () => Object.assign({}, DEFAULT_QUERY_OPTIONS);

        if (!callback) {
            if (!options) {
                callback = readDSU;
                options = defaultOptions();
                readDSU = true;
            }
            if (typeof readDSU === 'boolean') {
                callback = options;
                options = defaultOptions();
            }
            if (typeof readDSU === 'object') {
                callback = options;
                options = readDSU;
                readDSU = true;
            }
        }

        options = options || defaultOptions();

        let self = this;
        super.getAll(readDSU, options, (err, result) => {
            if (err)
                return self._err(`Could not parse IssuedShipments ${JSON.stringify(result)}`, err, callback);
            console.log(`Parsed ${result.length} shipments`);
            callback(undefined, result);
        });
    }

    /**
     * updates an Issued Shipment
     *
     * @param {string} [key] key is optional so child classes can override them
     * @param {Shipment} shipment
     * @param {function(err, Shipment?, Archive?)} callback
     */
    update(key, shipment, callback){
        if (!callback){
            callback = shipment;
            shipment = key;
            key = this._genCompostKey(shipment.requesterId, shipment.shipmentId);
        }
        const self = this;
        super.update(key, shipment, (err, updatedShipment, keySSI, orderId, linesSSIs) => {
            if (err)
                return self._err(`Could not update Shipment`, err, callback);
            try {
                self.sendMessagesAsync(updatedShipment, linesSSIs, keySSI);
            } catch (e) {
                console.log(e);
            }
            callback(undefined, updatedShipment, keySSI);
        });
    }

    updateByOrder(shipmentId, order, callback){
        const shipmentKey = this._genCompostKey(order.requesterId, shipmentId);
        const self = this;
        self.getOne(shipmentKey, false, (err, record) => {
            if (err)
                return self._err(`Could not get Shipment to update`, err, callback);
            self._getDSUInfo(record, (err, shipment) => {
                if (err)
                    return self._err(`Unable to read shipment DSU`, err, callback);
                shipment.status = order.status
                self.shipmentService.update(record, shipment, (err, updatedShipment, dsu, orderId, shipmentLinesSSIs) => {
                    if (err)
                        return self._err(`Could not update shipment dsu`, err, callback);
                    self.updateRecord(shipmentKey, self._indexItem(shipmentKey, updatedShipment, record), (err) => {
                        if (err)
                            return self._err(`Could not update shipment record`, err, callback);
                        self.sendShipmentLinesToMAH([...shipment.shipmentLines], [...shipmentLinesSSIs], (err) =>
                            self._messageCallback( err ? `Could not transmit shipmentLines to The manufacturers` : 'Lines Notice sent to Manufacturers'));
                        self.refreshController({
                            mode: 'issued',
                            shipment: updatedShipment
                        });
                        callback();
                    });
                });
            });
        });
    }
}

/**
 * @param {ParticipantManager} participantManager
 * @param {function(err, Manager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @returns {IssuedShipmentManager}
 * @memberOf Managers
 */
const getIssuedShipmentManager = function (participantManager,  callback) {
    let manager;
    try {
        manager = participantManager.getManager(IssuedShipmentManager);
        if (callback)
            return callback(undefined, manager);
    } catch (e){
        manager = new IssuedShipmentManager(participantManager, callback);
    }

    return manager;
}

module.exports = {
    getIssuedShipmentManager,
    IssuedShipmentManager
};

},{"../../pdm-dsu-toolkit/managers/Page":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/managers/Page.js","../constants":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/constants.js","../model":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/index.js","./ReceivedOrderManager":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/managers/ReceivedOrderManager.js","./ShipmentManager":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/managers/ShipmentManager.js"}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/managers/NotificationManager.js":[function(require,module,exports){
const {DB, DEFAULT_QUERY_OPTIONS} = require('../constants');
const Manager = require("../../pdm-dsu-toolkit/managers/Manager");
const {Notification, Batch, Stock} = require('../model');
const getStockManager = require('./StockManager');
const {functionCallIterator} = require('../services').utils;

/**
 * Batch Manager Class
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
 * @param {ParticipantManager} participantManager
 * @param {function(err, Manager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @class NotificationManager
 * @extends Manager
 * @memberOf Managers
 */
class NotificationManager extends Manager{
    constructor(participantManager, callback) {
        super(participantManager, DB.notifications, ['senderId', 'subject'], (err, manager) => {
            if (err)
                return callback ? callback(err) : console.log(err);
            manager.registerMessageListener((message, cb) => {
                manager.processMessageRecord(message, (err) => {
                    manager.refreshController(message.message);
                    cb(err);
                });
            });

            manager.stockManager = manager.stockManager || getStockManager(participantManager);

            if (callback)
                callback(undefined, manager);
        });
        this.stockManager = this.stockManager || getStockManager(participantManager);
    }

    /**
     * generates the db's key for the batch
     * @param {string} senderId
     * @param {string} subject
     * @return {string}
     * @private
     */
    _genCompostKey(senderId, subject){
        return `${senderId}-${subject}-${Date.now()}`;
    }

    /**
     * Must wrap the entry in an object like:
     * <pre>
     *     {
     *         index1: ...
     *         index2: ...
     *         value: item
     *     }
     * </pre>
     * so the DB can be queried by each of the indexes and still allow for lazy loading
     * @param {string} key
     * @param {Notification} item
     * @param {string|object} record
     * @return {object} the indexed object to be stored in the db
     * @protected
     * @override
     */
    _indexItem(key, item, record){
        return {
            senderId: item.senderId,
            subject: item.subject,
            body: item.body
        }
    };

    /**
     * Processes the received messages, saves them to the the table and deletes the message
     * @param {*} message
     * @param {function(err)} callback
     * @protected
     * @override
     */
    _processMessageRecord(message, callback) {
        let self = this;
        if (!message || typeof message !== 'object')
            return callback(`Invalid Message:  ${message} does not have a valid notification`);

        const notification = new Notification(message);
        const err = notification.validate()
        if (err)
            return callback(err);

        const key = self._genCompostKey(notification.senderId, notification.subject);
        self.insertRecord(key, notification, (err, record) => {
            if (err)
                return callback(err);
            self._handleNotification(notification, (err) => {
                if (err)
                    console.log(`Could not process notification`, err);
                callback(undefined);
            })
        });
    };

    _handleBatch(body, callback){
        const {gtin, batch} = body;

        const {batchNumber, batchStatus, expiry} = batch;

        const self = this;
        self.stockManager.getOne(gtin, true, (err, stock) => {
            if (err)
                return callback(err);
            const batch = stock.batches.find(b => b.batchNumber === batchNumber);
            if (!batch)
                return callback(`No stock of such batch... why were we notified of this??`);

            if (batch.expiry !== expiry){
                console.log(`Updating batch expiry to ${expiry}`);
                batch.expiry = expiry;
            }

            if (batch.batchStatus !== batchStatus){
                console.log(`Updating batch status to ${batchStatus}`);
                batch.batchStatus = batchStatus;
            }
            self.stockManager.update(gtin, stock, (err) => {
                if (err)
                    return callback(err);
                self.stockManager.refreshController();
                callback();
            });
        });
    }

    _handleNotification(notification, callback){
        switch (notification.subject){
            case DB.batches:
                return this._handleBatch(notification.body, callback);
            default:
                return callback(`Cannot handle such notification - ${notification}`);
        }
    }

    /**
     * Sends a {@link Notification}
     * @param {string} receiverId
     * @param {Notification} notification
     * @param {function(err, keySSI, string)} callback first keySSI if for the batch, the second for its' product dsu
     * @override
     */
    push(receiverId, notification, callback){
        if (!notification.senderId)
            notification.senderId = this.getIdentity().id;
        this.sendMessage(receiverId, this.tableName, notification, err =>
            this._messageCallback(err, `Notification sent to ${receiverId} regarding ${notification.subject}`));
        callback(undefined);
    }

    pushToAll(receivers, notification, callback){
        const self = this;

        const func = function(receiver, callback){
            self.push.call(self, receiver, notification, callback)
        }

        functionCallIterator(func, receivers, (err, ...results) => {
            if (err)
                return callback(err);
            console.log(`All notifications regarding ${notification.subject} sent`);
            callback(undefined, ...results)
        })
    }

    /**
     * Creates a {@link Notification}
     * @param {Notification} notification
     * @param {function(err, keySSI, string)} callback first keySSI if for the batch, the second for its' product dsu
     * @override
     */
    create(notification, callback) {
        callback(`Notification cannot be created`);    }

    /**
     * reads the specific Notification
     *
     * @param {string} key
     * @param {boolean} [readDSU] defaults to true. decides if the manager loads and reads from the dsu or not
     * @param {function(err, Notification|KeySSI, Archive)} callback returns the batch if readDSU, the keySSI otherwise
     * @override
     */
    getOne(key, readDSU, callback){
        if (!callback){
            callback = readDSU;
            readDSU = true;
        }
        let self = this;
        self.getRecord(key, (err, notification) => {
            if (err)
                return self._err(`Could not load record with key ${key} on table ${self._getTableName()}`, err, callback);
            callback(undefined, new Notification(notification));
        });
    }

    /**
     * Lists all registered items according to query options provided
     * @param {boolean} [readDSU] defaults to true. decides if the manager loads and reads from the dsu's {@link INFO_PATH} or not
     * @param {object} [options] query options. defaults to {@link DEFAULT_QUERY_OPTIONS}
     * @param {function(err, object[])} callback
     * @override
     */
     getAll(readDSU, options, callback){
        const defaultOptions = () => Object.assign({}, DEFAULT_QUERY_OPTIONS, {
            query: ['__timestamp > 0']
        });

        if (!callback){
            if (!options){
                callback = readDSU;
                options = defaultOptions();
                readDSU = true;
            }
            if (typeof readDSU === 'boolean'){
                callback = options;
                options = defaultOptions();
            }
            if (typeof readDSU === 'object'){
                callback = options;
                options = readDSU;
                readDSU = true;
            }
        }

        options = options || defaultOptions();

        let self = this;
        self.query(options.query, options.sort, options.limit, (err, records) => {
            if (err)
                return self._err(`Could not perform query`, err, callback);
            if (!readDSU)
                return callback(undefined, records.map(r => r.pk));
            callback(undefined, records.map(r => new Notification(r)));
        });
    }

    /**
     * Removes a Notification from the list (does not delete/invalidate DSU, simply 'forgets' the reference)
     * @param {string|number} key
     * @param {function(err)} callback
     * @override
     */
    remove(key, callback) {
        super.remove(key, callback);
    }

    /**
     * updates a Batch from the list
     * @param {string|number} gtin
     * @param {Notification} newBatch
     * @param {function(err, Batch, Archive)} callback
     * @override
     */
    update(gtin, newBatch, callback){
        return callback(`Notification cannot be updated`);
    }
}

/**
 * @param {BaseManager} participantManager
 * @param {function(err, Manager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @returns {NotificationManager}
 * @memberOf Managers
 */
const getNotificationManager = function (participantManager, callback) {
    let manager;
    try {
        manager = participantManager.getManager(NotificationManager);
        if (callback)
            return callback(undefined, manager);
    } catch (e){
        manager = new NotificationManager(participantManager, callback);
    }

    return manager;
}

module.exports = getNotificationManager;

},{"../../pdm-dsu-toolkit/managers/Manager":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/managers/Manager.js","../constants":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/constants.js","../model":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/index.js","../services":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/services/index.js","./StockManager":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/managers/StockManager.js"}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/managers/OrderManager.js":[function(require,module,exports){
const { DB, ANCHORING_DOMAIN } = require('../constants');
const Manager = require("../../pdm-dsu-toolkit/managers/Manager");
const Order = require('../model').Order;
const OrderLine = require('../model').OrderLine;
const OrderStatus = require('../model').OrderStatus;

/**
 * Order Manager Class
 *
 * Abstract class.
 * Use only concrete subclasses {@link IssuedOrderManager} or {@link ReceivedOrderManager}.
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
 * @param {ParticipantManager} participantManager
 * @param {function(err, Manager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @class OrderManager
 * @abstract
 * @extends Manager
 * @memberOf Managers
 */
class OrderManager extends Manager {
    constructor(participantManager, tableName, indexes, callback) {
        super(participantManager, tableName, ['orderId', 'products', 'status', ...indexes], callback);
        this.orderService = new (require('../services').OrderService)(ANCHORING_DOMAIN);
    }

    /**
     * generates the db's key for the Order
     * @param {string|number} otherActorId
     * @param {string|number} orderId
     * @return {string}
     * @protected
     */
    _genCompostKey(otherActorId, orderId){
        return `${otherActorId}-${orderId}`;
    }

    /**
     * Util function that loads a OrderDSU and reads its information
     * @param {string|KeySSI} keySSI
     * @param {function(err, Order, Archive, KeySSI)} callback
     * @protected
     * @override
     */
    _getDSUInfo(keySSI, callback){
        return this.orderService.get(keySSI, callback);
    }

    /**
     * Must wrap the entry in an object like:
     * <pre>
     *     {
     *         index1: ...
     *         index2: ...
     *         value: item
     *     }
     * </pre>
     * so the DB can be queried by each of the indexes and still allow for lazy loading
     * @param {string} key
     * @param {Order} item
     * @param {string|object} record
     * @return {object} the indexed object to be stored in the db
     * @protected
     * @override
     */
    _indexItem(key, item, record) {
        return {
            orderId: item.orderId,
            status: item.status.status,
            products: item.orderLines.map(ol => ol.gtin).join(','),
            value: record
        }
    }

    /**
     * updates an item
     *
     * @param {string} [key] key is optional so child classes can override them
     * @param {object} newOrder
     * @param {function(err, Order?, Archive?)} callback
     */
    update(key, newOrder, callback){
        if (!callback)
            return callback(`No key Provided...`);

        let self = this;
        self.getRecord(key, (err, record) => {
            if (err)
                return self._err(`Unable to retrieve record with key ${key} from table ${self._getTableName()}`, err, callback);
            self.orderService.update(record.value, newOrder, (err, updatedOrder, orderDsu) => {
                if (err)
                    return self._err(`Could not Update Order DSU`, err, callback);
                self.updateRecord(key, self._indexItem(key, updatedOrder, record.value), (err) => {
                    if (err)
                        return callback(err);
                    callback(undefined, updatedOrder, orderDsu);
                });
            });
        });
    }

    // messages to all MAHs.
    // the order is the same for the orderlines and their ssis because of the way the code is written
    sendOrderLinesToMAH(orderLines, orderLinesSSIs, callback) {
        const self = this;
        const orderLine = orderLines.shift();
        let ssi = orderLinesSSIs.shift();
        //console.log("Handling rest of orderLines ", orderLines);
        if (!orderLine){
            console.log(`All orderlines transmited to MAH`)
            return callback();
        }
        self.orderService.resolveMAH(orderLine, (err, mahId) => {
            if (err)
                return self._err(`Could not resolve MAH for ${orderLine}`, err, callback);
            if (typeof ssi !== 'string')
                ssi = ssi.getIdentifier();
            self.sendMessage(mahId, DB.orderLines, ssi, (err) => {
                if (err)
                    return self._err(`Could not send message to MAH ${mahId} for orderLine ${JSON.stringify(orderLine)} with ssi ${ssi}`, err, callback);
                console.log(`Orderline ${JSON.stringify(orderLine)} transmitted to MAH ${mahId}`);
            })
        });

        self.sendOrderLinesToMAH(orderLines, orderLinesSSIs, callback);
    }

    /**
     * Convert the OrderController view model into an Order.
     * @param model
     * @returns {Order}
     */
    fromModel(model) {
        // convert orderLines into an array of OrderLines
        let orderLines = [];
        let orderLinesStr = model.orderLines.value;
        if (orderLinesStr) {
            orderLinesStr.split(";").forEach((gtinCommaQuant) => {
                let gtinAndQuant = gtinCommaQuant.split(",");
                if (gtinAndQuant.length === 2) {
                    let gtin = gtinAndQuant[0];
                    let quantity = parseInt(gtinAndQuant[1]);
                    if (gtin && quantity) {
                        orderLines.push(new OrderLine(gtin, quantity, model.requesterId.value, model.senderId.value));
                    }
                }
            });
        }
        const order = new Order(model.orderId.value, model.requesterId.value, model.senderId.value, model.shipToAddress.value, OrderStatus.CREATED, orderLines);
        console.log("model ", model, "order ", order);
        return order;
    }

    /**
     * Convert an Order into a OrderControler view model. 
     * The order.orderLines are converted to a special format. See locale.js
     * @param {Order} object the business model object
     * @param model the Controller's model object
     * @returns {{}}
     */
    toModel(object, model) {
        model = model || {};
        for (let prop in object) {
            //console.log("prop", prop, "=='orderLines'", prop=="orderLines");
            if (object.hasOwnProperty(prop)) {
                if (!model[prop])
                    model[prop] = {};
                if (prop == "orderLines") {
                    model[prop].value = "";
                    let sep = "";
                    object[prop].forEach((orderLine) => {
                        model[prop].value += sep + orderLine.gtin + "," + orderLine.quantity;
                        sep = ";";
                    });
                } else {
                    model[prop].value = object[prop];
                }
            }
        }
        return model;
    }
}

module.exports = OrderManager;
},{"../../pdm-dsu-toolkit/managers/Manager":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/managers/Manager.js","../constants":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/constants.js","../model":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/index.js","../services":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/services/index.js"}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/managers/ParticipantManager.js":[function(require,module,exports){
const BaseManager = require('../../pdm-dsu-toolkit/managers/BaseManager');
const {EVENTS} = require('../constants');

/**
 * Participant Manager Class - Extension of Base Manager
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
 * @param {DSUStorage} DSUStorage
 * @param {function(err, Manager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @class ParticipantManager
 * @extends BaseManager
 * @memberOf Managers
 * @see BaseManager
 */
class ParticipantManager extends BaseManager{
    constructor(dsuStorage, callback) {
        super(dsuStorage, (err, manager) => {
            if (err)
                return callback(err);
            require('./DirectoryManager')(this, (err, directoryManager) => {
                if (err)
                    return callback(err);
                manager.directoryManager = directoryManager;
                require('./StockManager')(this, true, (err, stockManager) => {
                    if (err)
                        return callback(err);
                    manager.stockManager = stockManager;
                    require('./TraceabilityManager')(this, (err, traceabilityManager) => {
                        if (err)
                            return callback(err);
                        manager.traceabilityManager = traceabilityManager;
                        require('./NotificationManager')(this, (err, notificationManager) => {
                            if (err)
                                return callback(err);
                            manager.notificationManager = notificationManager;
                            callback(undefined, manager);
                        });
                    });
                });
            });
        });
        this.directoryManager = this.directoryManager || undefined;
        this.stockManager = this.stockManager || undefined;
        this.traceabilityManager = this.traceabilityManager || undefined;
        this.notificationManager = this.notificationManager || undefined;
    };

    setController(controller) {
        const self = this;
        super.setController(controller);

        // We use the body because popovers are attached to the doc, not the element
        const listenerElement = controller.element.closest('body');

        listenerElement.addEventListener(EVENTS.STOCK_TRACE, async (evt) => {
            const sendError = async function(msg, err){
                await loader.dismiss();
                controller.showErrorToast(msg, err);
            }
            const { gtin, batch, manufName } = evt.detail;
            const loader = controller._getLoader(`Requesting stock from Partners for ${gtin} Batch: ${batch}`);
            await loader.present();
            self.stockManager.getStockTraceability(gtin, {manufName, batch}, async (err, stockTrace) => {
                if (err)
                    return await sendError(err)
                await loader.dismiss();
                console.log('# StockManagement stockTrace=', stockTrace)
            })
        })

        listenerElement.addEventListener(EVENTS.TRACK.REQUEST, async (evt) => {
            evt.preventDefault();
            evt.stopImmediatePropagation();

            const product = evt.detail;

            const serialNumberMsg = !!product.serialNumber ? controller.translate('tracking.serial', product.serialNumber) : '';
            const loader = controller._getLoader(controller.translate('tracking.loading', product.gtin + serialNumberMsg));

            await loader.present();

            const sendError = async function(msg, err){
                await loader.dismiss();
                controller.showErrorToast(controller.translate('loading.error', err), err);
            }

            self.traceabilityManager.getOne(product, async (err, startNode, endNode, nodeList) => {
                if (err)
                    return await sendError(`Could not perform tracking...`, err);
                controller.showToast(controller.translate('tracking.success'));
                const event = new Event(EVENTS.TRACK.RESPONSE, {
                    bubbles: true,
                    cancelable: true
                });
                event.detail = {
                    title: controller.translate(
                        'tracking.title',
                        product.gtin,
                        product.batchNumber,
                        serialNumberMsg
                    ), // controller.translate("tracking.serial", product.serialNumber) || ""),
                    startNode: startNode,
                    endNode: endNode,
                    nodeList: nodeList
                }
                await loader.dismiss();
                evt.target.dispatchEvent(event);
            });
        });

        listenerElement.addEventListener(EVENTS.TRACK.RESPONSE, async (evt) => {
            evt.preventDefault();
            evt.stopImmediatePropagation();
            const popOver = controller.element.querySelector('tracking-pop-over');
            if (!popOver)
                return console.log(`Could not find display element for traceability tree`);
            await popOver.present(evt.detail);
        });
        //
        // controller.on(EVENTS.TRACK.REQUEST, async (evt) => {
        //     evt.preventDefault();
        //     evt.stopImmediatePropagation();
        //
        //     const product = evt.detail;
        //
        //     const loader = controller._getLoader(controller.translate('tracking.loading',
        //         product.gtin + controller.translate('tracking.serial', product.serialNumber)));
        //
        //     await loader.present();
        //
        //     const sendError = async function(msg, err){
        //         await loader.dismiss();
        //         controller.showErrorToast(controller.translate('loading.error', err), err);
        //     }
        //
        //     self.traceabilityManager.getOne(product, async (err, startNode, endNode, nodeList) => {
        //         if (err)
        //             return await sendError(`Could not perform tracking...`, err);
        //         controller.showToast(controller.translate('tracking.success'));
        //         const event = new Event(EVENTS.TRACK.RESPONSE, {
        //             bubbles: true,
        //             cancelable: true
        //         });
        //         event.detail = {
        //             title: controller.translate('tracking.title',
        //                 product.gtin,
        //                 product.batchNumber,
        //                 controller.translate("tracking.serial", product.serialNumber) || ""),
        //             startNode: startNode,
        //             endNode: endNode,
        //             nodeList: nodeList
        //         }
        //         await loader.dismiss();
        //         evt.target.dispatchEvent(event);
        //     });
        // });
        // controller.on(EVENTS.TRACK.RESPONSE, async (evt) => {
        //     evt.preventDefault();
        //     evt.stopImmediatePropagation();
        //     const popOver = controller.element.querySelector('tracking-pop-over');
        //     if (!popOver)
        //         return console.log(`Could not find display element for traceability tree`);
        //     await popOver.present(evt.detail);
        // });
    }

    /**
     * Must return the string to be used to generate the DID
     * @param {object} identity
     * @param {string} participantConstSSI
     * @param {function(err, string)}callback
     * @protected
     * @override
     */
    _getDIDString(identity, participantConstSSI, callback){
        callback(undefined, identity.id + '');
    }
}

let participantManager;

/**
 * @param {DSUStorage} [dsuStorage] only required the first time, if not forced
 * @param {boolean} [force] defaults to false. overrides the singleton behaviour and forces a new instance.
 * Makes DSU Storage required again!
 * @param {function(err, ParticipantManager)} [callback]
 * @returns {ParticipantManager}
 * @memberOf Managers
 */
const getParticipantManager = function (dsuStorage, force, callback) {
    if (!callback){
        if (typeof force === 'function'){
            callback = force;
            force = false;
        }
    }
    if (!participantManager || force) {
        if (!dsuStorage)
            throw new Error("No DSUStorage provided");
        participantManager = new ParticipantManager(dsuStorage, callback);
    }
    return participantManager;
}

module.exports = getParticipantManager;
},{"../../pdm-dsu-toolkit/managers/BaseManager":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/managers/BaseManager.js","../constants":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/constants.js","./DirectoryManager":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/managers/DirectoryManager.js","./NotificationManager":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/managers/NotificationManager.js","./StockManager":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/managers/StockManager.js","./TraceabilityManager":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/managers/TraceabilityManager.js"}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/managers/ProductManager.js":[function(require,module,exports){
const {INFO_PATH, ANCHORING_DOMAIN, DB, DEFAULT_QUERY_OPTIONS} = require('../constants');
const Manager = require("../../pdm-dsu-toolkit/managers/Manager");
const Product = require('../model/Product');


/**
 * Product Manager Class
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
 * @param {ParticipantManager} participantManager
 * @param {function(err, Manager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @class ProductManager
 * @extends Manager
 * @memberOf Managers
 */
class ProductManager extends Manager {
    constructor(participantManager, callback) {
        super(participantManager, DB.products, ['gtin', 'name', 'manufName'], callback);
        this.productService = new (require('../services/ProductService'))(ANCHORING_DOMAIN);
    }

    /**
     * Binds the {@link Product#manufName} to the Product
     * @param {Product} product
     * @param {function(err, Product)} callback
     * @private
     */
    _bindParticipant(product, callback){
        let self = this;
        self.getIdentity((err, mah) => {
            if (err)
                return self._err(`Could not retrieve identity`, err, callback);
            product.manufName = mah.id;
            callback(undefined, product);
        });
    }

    /**
     * Must wrap the entry in an object like:
     * <pre>
     *     {
     *         index1: ...
     *         index2: ...
     *         value: item
     *     }
     * </pre>
     * so the DB can be queried by each of the indexes and still allow for lazy loading
     * @param {string} key
     * @param {Product} item
     * @param {string|object} record
     * @return {object} the indexed object to be stored in the db
     * @protected
     * @override
     */
    _indexItem(key, item, record){
        return {
            gtin: key,
            name: item.name,
            value: record
        }
    };

    /**
     * Util function that loads a ProductDSU and reads its information
     * @param {string|KeySSI} keySSI
     * @param {function(err, Product, Archive)} callback
     * @protected
     * @override
     */
    _getDSUInfo(keySSI, callback){
        return this.productService.get(keySSI, callback);
    }

    /**
     * Creates a {@link Product} dsu
     * @param {string|number} [gtin] the table key
     * @param {Product} product
     * @param {function(err, keySSI?, string?)} callback where the string is the mount path relative to the main DSU
     * @override
     */
    create(gtin, product, callback) {
        if (!callback){
            callback = product;
            product = gtin;
            gtin = product.gtin;
        }
        let self = this;
        self._bindParticipant(product, (err, product) => {
            if (err)
                return self._err(`Could not bind mah to product`, err, callback);
            self.productService.create(product, (err, keySSI) => {
                if (err)
                    // return self._err(`Could not create product DSU for ${product.gtin} GTIN because already exists.`, err, callback);
                    return callback(`Could not create product DSU of GTIN ${product.gtin} because it already exists.`);
                const record = keySSI.getIdentifier();
                self.insertRecord(gtin, self._indexItem(gtin, product, record), (err) => {
                    if (err)
                        return self._err(`Could not inset record with gtin ${gtin} on table ${self.tableName}`, err, callback);
                    const path =`${self.tableName}/${gtin}`;
                    console.log(`Product ${gtin} created stored at '${path}'`);
                    callback(undefined, keySSI, path);
                });
            });
        });
    }

    /**
     * reads ssi for that gtin in the db. loads is and reads the info at '/info'
     * @param {string} gtin
     * @param {boolean} [readDSU] defaults to true. decides if the manager loads and reads from the dsu or not
     * @param {function(err, Product|KeySSI, Archive)} callback returns the Product if readDSU and the dsu, the keySSI otherwise
     * @override
     */
    getOne(gtin, readDSU,  callback) {
        super.getOne(gtin, readDSU, callback);
    }

    /**
     * Removes a product from the list (does not delete/invalidate DSU, simply 'forgets' the reference)
     * @param {string|number} gtin
     * @param {function(err)} callback
     * @override
     */
    remove(gtin, callback) {
        super.remove(gtin, callback);
    }

    /**
     * updates a product from the list
     * @param {string|number} [gtin] the table key
     * @param {Product} newProduct
     * @param {function(err, Product, Archive)} callback
     * @override
     */
    update(gtin, newProduct, callback){
        if (!callback){
            callback = newProduct;
            newProduct = gtin;
            gtin = newProduct.gtin;
        }
        let self = this;
        
        return callback(`Product DSUs cannot be updated`);
    }

    /**
     * Lists all registered items according to query options provided
     * @param {boolean} [readDSU] defaults to true. decides if the manager loads and reads from the dsu's {@link INFO_PATH} or not
     * @param {object} [options] query options. defaults to {@link DEFAULT_QUERY_OPTIONS}
     * @param {function(err, object[])} callback
     * @override
     */
    getAll(readDSU, options, callback){
        const defaultOptions = () => Object.assign({}, DEFAULT_QUERY_OPTIONS, {
            query: ['__timestamp > 0'],
            sort: "dsc"
        });

        if (!callback){
            if (!options){
                callback = readDSU;
                options = defaultOptions();
                readDSU = true;
            }
            if (typeof readDSU === 'boolean'){
                callback = options;
                options = defaultOptions();
            }
            if (typeof readDSU === 'object'){
                callback = options;
                options = readDSU;
                readDSU = true;
            }
        }

        options = options || defaultOptions();

        super.getAll(readDSU, options, callback);
    }

    /**
     *
     * @param model
     * @returns {Product}
     * @override
     */
    fromModel(model){
        return new Product(super.fromModel(model));
    }
}

/**
 * @param {ParticipantManager} [participantManager] only required the first time, if not forced
 * @param {function(err, Manager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @returns {ProductManager}
 * @memberOf Managers
 */
const getProductManager = function (participantManager, callback) {
    let manager;
    try {
        manager = participantManager.getManager(ProductManager);
        if (callback)
            return callback(undefined, manager);
    } catch (e){
        manager = new ProductManager(participantManager, callback);
    }

    return manager;
}

module.exports = getProductManager;
},{"../../pdm-dsu-toolkit/managers/Manager":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/managers/Manager.js","../constants":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/constants.js","../model/Product":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/Product.js","../services/ProductService":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/services/ProductService.js"}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/managers/ReceiptManager.js":[function(require,module,exports){
const {INFO_PATH, DB, DEFAULT_QUERY_OPTIONS, ANCHORING_DOMAIN} = require('../constants');
const Manager = require("../../pdm-dsu-toolkit/managers/Manager");
const Receipt = require('../model/Receipt');
const IndividualReceipt = require('../model/IndividualReceipt');
const {toPage, paginate} = require("../../pdm-dsu-toolkit/managers/Page");

const ACTION = {
    REQUEST: 'request',
    REQUEST_ALL: 'requestAll',
    RESPONSE: 'response',
    CREATE: 'create'
}

class RequestCache {
    cache = {};
    timeout;

    constructor(timeout) {
        this.timeout = timeout;
    }

    checkPendingRequest(id) {
        return id in this.cache;
    }

    submitRequest(id, callback){
        if (id in this.cache)
            return callback(`Id already Exists!`);
        this.cache[id] = callback;

        const self = this;
        setTimeout(() => {
            if (self.timeout && self.checkPendingRequest(id))
                callback(new Error(`Unable to contact manufName, message canceled by timeout after ${self.timeout / 1000}s.`))
        }, self.timeout || 0)
        console.log(`Tracking request ${id} submitted`);
    }

    getRequest(id){
        if (!(id in this.cache))
            throw new Error(`Id does not exist in cache!`);
        const cb = this.cache[id];
        delete this.cache[id];
        return cb;
    }
}

class ReceiptMessage {
    id;
    action;
    message;
    requesterId;
    error;

    constructor(receiptMessage){
        if (typeof receiptMessage !== undefined)
            for (let prop in receiptMessage)
                if (receiptMessage.hasOwnProperty(prop))
                    this[prop] = receiptMessage[prop];

        if (!this.action || (!this.error && !this.message))
            throw new Error(`Needs id, action and a error or message`);
        if (this.action === ACTION.REQUEST && !this.id)
            this.id = (`${Date.now()}` + Math.random()).replace('.', '')
        if (this.action === ACTION.REQUEST && !this.requesterId)
            throw new Error("Needs a requester Id for that action");
    }
}

/**
 * Stock Manager Class
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
 * @param {ParticipantManager} participantManager
 * @param {function(err, Manager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @class ReceiptManager
 * @extends Manager
 * @memberOf Managers
 */
class ReceiptManager extends Manager{
    constructor(participantManager, callback) {
        super(participantManager, DB.receipts, ['batchNumber', 'gtin', 'sellerId', 'serialNumber', 'manufName', 'status'],  (err, manager) => {
            if (err)
                return callback ? callback(err) : console.log(err);
            manager.registerMessageListener((message, cb) => {
                manager.processMessageRecord(message, (err) => {
                    manager.refreshController();
                    cb(err);
                });
            });
            if (callback)
                callback(undefined, manager);
        });

        this.requestCache = new RequestCache(25000);
        this.stockManager = participantManager.stockManager;
        this.saleService = new (require('../services').SaleService)(ANCHORING_DOMAIN);
    }

    /**
     *
     * @param key
     * @param item
     * @param {Receipt} record
     * @return {{}}
     * @private
     */
    _indexItem(key, item, record) {
        if (!record){
            record = item;
            item = key;
            key = this._genCompostKey(item);
        }
        return Object.assign(item, {
            value: record
           })
    }

    /**
     * @param {IndividualReceipt} individualReceipt
     * @returns {string}
     */
    _genCompostKey(individualReceipt){
        return `${individualReceipt.gtin}-${individualReceipt.batchNumber}-${individualReceipt.serialNumber}`;
    }

    _convertKey(receiptId) {
        const [gtin, batchNumber, serialNumber] = receiptId.split('-');
        return {gtin, batchNumber, serialNumber};
    }

    _getDSUInfo(keySSI, callback){
        const self = this;
        this.saleService.get(keySSI, (err, sale) => {
            if (err)
                return self._err(`Unable to read Sale DSU ${keySSI}`, err, callback);
            callback(undefined, new Receipt(sale));
        });
    }

    _processMessageRecord(message, callback) {
        let self = this;

        const createReceipt = () => {
            if (!message || !Array.isArray(message))
                return callback(`Message ${message} does not have  non-empty string with keySSI. Skipping record.`);

            const cb = function(err, ...results){
                if (err)
                    return self.cancelBatch(err2 => {
                        callback(err);
                    });
                callback(undefined, ...results);
            }

            const receipts = message;

            const lines = [];

            const receiptIterator = function(receiptsCopy, callback){
                const receiptSSI = receiptsCopy.shift();
                if (!receiptSSI)
                    return callback(undefined, lines);
                self._getDSUInfo(receiptSSI, (err, receipt) => {
                    if (err) {
                        console.log(`Could not read DSU from Receipt keySSI in record ${message}. Skipping record.`);
                        return callback(err);
                    }

                    const individualReceiptIterator = function(indReceiptCopy, accumulator, callback){
                        if (!callback){
                            callback = accumulator;
                            accumulator = [];
                        }
                        const indReceipt = indReceiptCopy.shift();
                        if (!indReceipt)
                            return callback(undefined, accumulator);

                        const compostKey = self._genCompostKey(indReceipt);
                        self.getRecord(compostKey, (err, rec) => {
                            if (!err){
                                console.log(rec);
                                return callback(`There is already an entry for this individual product ${compostKey}, and all sales are final!`);
                            }

                            self.insertRecord(compostKey, self._indexItem(compostKey, indReceipt, receiptSSI), (err) => {
                                if (err)
                                    return self._err(`Could not insert new Individual Receipt ${compostKey} in the db`, err, callback);
                                accumulator.push(compostKey);
                                console.log(`New Individual Receipt added: ${compostKey}`);
                                individualReceiptIterator(indReceiptCopy, accumulator, callback);
                            });
                        });
                    }

                    individualReceiptIterator(receipt.productList.slice(), callback);
                });
            }

            const dbAction = function(receipts, callback){
                try {
                    self.beginBatch();
                } catch (e){
                    return self.batchSchedule(() => dbAction(receipts, callback));
                    //return callback(e);
                }

                receiptIterator(receipts.slice(), (err, newIndividualReceipts) => {
                    if (err)
                        return cb(`Could not register all receipts`);
                    self.commitBatch((err) => {
                        if(err)
                            return cb(err);
                        console.log(`Receipts successfully registered: ${JSON.stringify(newIndividualReceipts)}`);
                        callback(undefined, newIndividualReceipts);
                    });
                });
            }

            dbAction(receipts, callback);
        }

        switch (message.action) {
            case ACTION.REQUEST:
                const receiptId = message.message;
                return self.getOne(receiptId, true, (err, receipt) => {
                    if ((!err && receipt) && receipt.sellerId !== message.requesterId) {
                        err = new Error(`Receipt requester must be the seller.`);
                        receipt = undefined;
                    }
                    self._replyToMessage(message.id, message.requesterId, err, receipt, self._messageCallback)
                    callback();
                });
            case ACTION.REQUEST_ALL:
                const transformOptionsToQuery = (_options) => {
                    let {sort, keyword, page, itemPerPage, ...query} = _options;

                    query = Object.entries(query).reduce((accum, curr, ) => {
                        const [key, value] = curr;
                        if (this.indexes.indexOf(key) >= 0)
                            accum.push(`${key} == ${value}`);
                        return accum;
                    }, [])

                    return  {
                        sort,
                        keyword,
                        page: page || 1,
                        itemPerPage: itemPerPage || 10,
                        dsuQuery: query,
                    }
                }

                const {readDSU, options} = message.message;
                const query = transformOptionsToQuery({...options, sellerId: message.requesterId});

                return self.getPage(
                    query.itemPerPage,  // items per page
                    query.page, // page number
                    query.dsuQuery, // dsuQuery
                    query.keyword, // keyword
                    query.sort, // sort
                    readDSU || true,  // readDSU
                    (err, result) => {
                        self._replyToMessage(message.id, message.requesterId, err, result, self._messageCallback);
                        callback();
                    }
                );
            case ACTION.RESPONSE:
                let cb;
                try {
                    cb = self.requestCache.getRequest(message.id);
                } catch (e) {
                    return callback(e);
                }
                cb(message.error, message.message);
                return callback();
            default:
                createReceipt();
        }
    };

    _replyToMessage(messageId, requesterId, error, message, callback){
        const reply = new ReceiptMessage({
            id: messageId,
            action: ACTION.RESPONSE,
            message: message,
            requesterId: requesterId,
            error: error ? error.message || error : undefined
        });
        this.sendMessage(requesterId, reply, callback);
    }

    /**
     * Creates a {@link Sale} entry
     * @param {IndividualReceipt} receipt
     * @param {function(err?, keySSI?, string?)} callback where the string is the mount path relative to the main DSU
     */
    create(receipt, callback) {
        callback(`Receipts cannot be manufactured`);
    }

    /**
     * updates a product from the list
     * @param {string|number} [id] the table key
     * @param {IndividualReceipt} newReceipt
     * @param {function(err, Sale?)} callback
     * @override
     */
    update(id, newReceipt, callback){
        return callback(`All sales are final`);
    }

    /**
     * reads ssi for that gtin in the db. loads is and reads the info at '/info'
     * @param {string} id
     * @param {boolean} [readDSU] defaults to true. decides if the manager loads and reads from the dsu or not
     * @param {function(err, IndividualReceipt|KeySSI, Archive)} callback returns the Product if readDSU and the dsu, the keySSI otherwise
     * @override
     */
    getOne(id, readDSU,  callback) {
        if (!callback){
            callback = readDSU;
            readDSU = true;
        }
        let self = this;
        self.stockManager._getProduct(self._convertKey(id).gtin, (err, product) => {
            if (err)
                return self._err(`Could not find product from receiptId on stock.`, err, callback);

            const identity = self.getIdentity().id;
            if (identity === product.manufName) {
                return self.getRecord(id, (err, receipt) => {
                    if (err)
                        return self._err(`Could not load record with key ${id} on table ${self._getTableName()}`, err, callback);
                    if (!readDSU)
                        return callback(undefined, receipt.pk);
                    callback(undefined, new IndividualReceipt(receipt));
                });
            }

            const message = new ReceiptMessage({
                id: identity + Date.now(),
                action: ACTION.REQUEST,
                message: id,
                requesterId: identity
            });
            self.requestCache.submitRequest(message.id, callback);
            self.sendMessage(product.manufName, message, self._messageCallback);
        })
    }

    /**
     * Lists all registered items according to query options provided
     * @param {boolean} [readDSU] defaults to true. decides if the manager loads and reads from the dsu's {@link INFO_PATH} or not
     * @param {object} [options] query options. defaults to {@link DEFAULT_QUERY_OPTIONS}
     * @param {function(err, object[])} callback
     * @override
     */
    getAll(readDSU, options, callback){
        const defaultOptions = () => Object.assign({}, DEFAULT_QUERY_OPTIONS, {
            query: [
                "__timestamp > 0",
                'id like /.*/g'
            ],
            sort: "dsc"
        });

        if (!callback){
            if (!options){
                callback = readDSU;
                options = defaultOptions();
                readDSU = true;
            }
            if (typeof readDSU === 'boolean'){
                callback = options;
                options = defaultOptions();
            }
            if (typeof readDSU === 'object'){
                callback = options;
                options = readDSU;
                readDSU = true;
            }
        }

        options = options || defaultOptions();

        let self = this;
        self.query(options.query, options.sort, options.limit, (err, records) => {
            if (err)
                return self._err(`Could not perform query`, err, callback);
            if (!readDSU)
                return callback(undefined, records.map(r => r.pk));
            callback(undefined, records.map( r => new IndividualReceipt(r)));
        });
    }

    /**
     * Request to manufName all registered receipts according to query options provided
     * @param readDSU
     * @param options
     * @param callback
     */
    requestAll(readDSU, options, manufName, callback) {
        const defaultOptions = () => Object.assign({}, DEFAULT_QUERY_OPTIONS, {
            query: [
                "__timestamp > 0",
                'id like /.*/g'
            ],
            sort: "dsc"
        });

        if (!callback) {
            if (typeof readDSU === "function") {
                callback = readDSU;
                options = defaultOptions();
                readDSU = true;
            } else if (typeof options === "function") {
                // if options == function, the first param (readDS) can be type of "options" or "readDsu"
                callback = options;
                options = typeof readDSU === "boolean" ? defaultOptions() : readDSU;
                readDSU = typeof readDSU === "boolean" ? readDSU : true;
            } else if (typeof manufName === "function") {
                // if manufName == function, the params can be:
                // (readDsu, options, callback) or (readDsu, manufName, callback) or (options, manufName, callback)
                callback = manufName;
                manufName = typeof options === "string" ? options : undefined;
                options = typeof readDSU === "object" ? readDSU : options; // if options is a string, will be set to defaultOptions below
                readDSU = typeof readDSU === "boolean" ? readDSU : true;
            }
        }

        options = typeof options !== "object" || !options ? defaultOptions() : options;
        readDSU = typeof readDSU !== "boolean" || !readDSU ? true : readDSU;

        const identity = this.getIdentity().id;
        if (!manufName || !`${manufName}`.startsWith("MAH"))
            return callback(new Error(`Not provided a valid manufName.`));
        if (manufName === identity)
            return callback(new Error(`Is not allowed to request receipts for yourself.`));

        const message = new ReceiptMessage({
            id: identity + Date.now(),
            action: ACTION.REQUEST_ALL,
            message: {readDSU, options},
            requesterId: identity
        });
        this.requestCache.submitRequest(message.id, callback);
        this.sendMessage(manufName, message, this._messageCallback);
    }
}


/**
 * @param {ParticipantManager} participantManager
 * @param {function(err, Manager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @returns {ReceiptManager}
 * @memberOf Managers
 */
const getReceiptManager = function (participantManager, callback) {
    let manager;
    try {
        manager = participantManager.getManager(ReceiptManager);
        if (callback)
            return callback(undefined, manager);
    } catch (e){
        manager = new ReceiptManager(participantManager, callback);
    }

    return manager;
}

module.exports = getReceiptManager;
},{"../../pdm-dsu-toolkit/managers/Manager":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/managers/Manager.js","../../pdm-dsu-toolkit/managers/Page":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/managers/Page.js","../constants":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/constants.js","../model/IndividualReceipt":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/IndividualReceipt.js","../model/Receipt":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/Receipt.js","../services":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/services/index.js"}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/managers/ReceivedOrderManager.js":[function(require,module,exports){
const { DB, DEFAULT_QUERY_OPTIONS } = require('../constants');
const OrderManager = require("./OrderManager");
const getStockManager = require("./StockManager");
const {Order} = require('../model');
const {toPage, paginate} = require("../../pdm-dsu-toolkit/managers/Page");

/**
 * Received Order Manager Class - concrete OrderManager for receivedOrders.
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
 * @param {ParticipantManager} participantManager
 * @param {function(err, Manager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @class ReceivedOrderManager
 * @extends OrderManager
 * @memberOf Managers
 */
class ReceivedOrderManager extends OrderManager {
    constructor(participantManager, callback) {
        super(participantManager, DB.receivedOrders, ['requesterId'], (err, manager) => {
            if (err)
                return callback ? callback(err) : console.log(err);
            manager.registerMessageListener((message, cb) => {
                manager.processMessageRecord(message, (err) => {
                    manager.refreshController();
                    cb(err);
                });
            });
            if (callback)
                callback(undefined, manager);
        });
        this.stockManager = getStockManager(participantManager);
        this.participantManager = participantManager;
    }


    /**
     * Not necessary for this manager
     * @override
     */
    create(key, item, callback) {
        callback(`This manager does not have this functionality`);
    }

    /**
     * Must wrap the DB entry in an object like:
     * <pre>
     *     {
     *         index1: ...
     *         index2: ...
     *         value: item
     *     }
     * </pre>
     * so the DB can be queried by each of the indexes and still allow for lazy loading
     * @param {string} key
     * @param {Order} item
     * @param {string|object} record
     * @return {object} the indexed object to be stored in the db
     * @protected
     * @override
     */
    _indexItem(key, item, record) {
        return {...super._indexItem(key, item, record), requesterId: item.requesterId}
    };

    /**
     * Lists all received orders.
     * @param {boolean} [readDSU] defaults to true. decides if the manager loads and reads from the dsu's {@link INFO_PATH} or not
     * @param {object} [options] query options. defaults to {@link DEFAULT_QUERY_OPTIONS}
     * @param {function(err, Order[])} callback
     */
    getAll(readDSU, options, callback) {
        const defaultOptions = () => Object.assign({}, DEFAULT_QUERY_OPTIONS);

        if (!callback) {
            if (!options) {
                callback = readDSU;
                options = defaultOptions();
                readDSU = true;
            }
            if (typeof readDSU === 'boolean') {
                callback = options;
                options = defaultOptions();
            }
            if (typeof readDSU === 'object') {
                callback = options;
                options = readDSU;
                readDSU = true;
            }
        }

        options = options || defaultOptions();

        super.getAll(readDSU, options, callback);
    }

    /**
     * Processes the received messages, saves them to the the table and deletes the message
     * @param {*} message
     * @param {function(err)} callback
     * @protected
     * @override
     */
    _processMessageRecord(message, callback) {
        let self = this;
        if (!message || typeof message !== "string")
            return callback(`Message ${message} does not have  non-empty string with keySSI. Skipping record.`);

        const orderSReadSSIStr = message;
        self._getDSUInfo(orderSReadSSIStr, (err, orderObj, orderDsu) => {
            if (err)
                return self._err(`Could not read DSU from message keySSI in record ${message}. Skipping record.`, err, callback);

            console.log(`ReceivedOrder`, orderObj);
            const orderId = orderObj.orderId;
            if (!orderId)
                return callback("ReceivedOrder doest not have an orderId. Skipping record.");

            const dbKey = self._genCompostKey(orderObj.requesterId, orderId);

            self.getOne(dbKey,  false, (err, record) => {
                if (err){
                    console.log(`Received new Order: `, orderObj);
                    return self.insertRecord(dbKey, self._indexItem(orderId, orderObj, orderSReadSSIStr), callback);
                }

                /**
                 * Message/ExtraInfo by default follows the model: `{SENDER_ID} {TIMESTAMP} {MESSAGE}`,
                 * so need to be sanitized to remove {SENDER_ID} and {TIMESTAMP}, because receiver
                 * just needs the message
                 * @param {Status} statusObj
                 * @returns {string}
                 */
                const getExtraInfoMsg = function (statusObj) {
                    const { status, extraInfo } = statusObj;
                    if (!extraInfo)
                        return '';

                    if (!extraInfo.hasOwnProperty(status))
                        return '';

                    const lastLog = statusObj.log[statusObj.log.length - 1]
                    const extraInfoUpdated = extraInfo[status].filter(_extraInfo => {
                        // verify if extraInfo.timestamp ===log.timestamp
                        return _extraInfo.split(' ')[1].trim() === lastLog.split(' ')[1].trim()
                    })
                    if (extraInfoUpdated.length > 0) {
                        return extraInfoUpdated[0].split(' ').slice(2).join(' ').trim(); // sanitized
                    } else {
                        return '';
                    }
                }

                orderObj.status['extraInfo'] = getExtraInfoMsg(orderObj.status);
                console.log(`Updating order ${orderObj.orderId} with status ${orderObj.status.status}`)
                self.updateRecord(dbKey, self._indexItem(orderId, orderObj, orderSReadSSIStr), (err) => {
                    if (err)
                        return self._err(`Could not update order`, err, callback);
                    if (!orderObj.shipmentId)
                        return callback(`Missing shipment Id`);
                    const {getIssuedShipmentManager} = require('./IssuedShipmentManager');
                    getIssuedShipmentManager(self.participantManager, (err, issuedShipmentManager) => {
                        if (err)
                            return self._err(`could not get issued shipment manager`, err, callback);
                        issuedShipmentManager.updateByOrder(orderObj.shipmentId, orderObj, callback);
                    });
                });
            });
        });
    };

    /**
     * updates an item
     *
     * @param {string} [key] key is optional so child classes can override them
     * @param {Order} order
     * @param {function(err, Order?, Archive?)} callback
     */
    update(key, order, callback){
        if (!callback){
            callback = order;
            order = key;
            key = this._genCompostKey(order.requesterId, order.orderId);
        }

        super.update(key, order, callback);
    }
}


/**
 * @param {ParticipantManager} participantManager
 * @param {function(err, Manager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @returns {OrderManager}
 * @memberOf Managers
 */
const getReceivedOrderManager = function (participantManager,  callback) {
    let manager;
    try {
        manager = participantManager.getManager(ReceivedOrderManager);
        if (callback)
            return callback(undefined, manager);
    } catch (e){
        manager = new ReceivedOrderManager(participantManager, callback);
    }

    return manager;
}

module.exports = getReceivedOrderManager;

},{"../../pdm-dsu-toolkit/managers/Page":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/managers/Page.js","../constants":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/constants.js","../model":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/index.js","./IssuedShipmentManager":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/managers/IssuedShipmentManager.js","./OrderManager":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/managers/OrderManager.js","./StockManager":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/managers/StockManager.js"}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/managers/ReceivedShipmentManager.js":[function(require,module,exports){
const { DB, DEFAULT_QUERY_OPTIONS } = require('../constants');
const ShipmentManager = require("./ShipmentManager");
const {Order, Stock, OrderLine, OrderStatus} = require('../model');

const getIssuedOrderManager = require('./IssuedOrderManager');
const {toPage, paginate} = require("../../pdm-dsu-toolkit/managers/Page");

/**
 * Received Shipment Manager Class - concrete ShipmentManager for received Shipments.
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
 * @param {ParticipantManager} participantManager
 * @param {function(err, Manager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @class ReceivedShipmentManager
 * @extends ShipmentManager
 * @memberOf Managers
 */
class ReceivedShipmentManager extends ShipmentManager {
    constructor(participantManager, callback) {
        super(participantManager, DB.receivedShipments, ['senderId', 'requesterId'], (err, manager) => {
            if (err)
                return callback ? callback(err) : console.log(err);

            getIssuedOrderManager(participantManager, (err, issuedOrderManager) => {
                if (err)
                    console.log(`Could not get IssuedOrderManager:`, err);
                else
                    manager.issuedOrderManager = issuedOrderManager;

                manager.registerMessageListener((message, cb) => {
                    manager.processMessageRecord(message, (err) => {
                        manager.refreshController();
                        cb(err);
                    });
                });

                if (callback)
                    callback(undefined, manager);
            });
        });

        this.issuedOrderManager = this.issuedOrderManager || undefined;
    }


    /**
     * Not necessary for this manager
     * @override
     */
    create(key, item, callback) {
        callback(`This manager does not have this functionality`);
    }

    /**
     * Must wrap the DB entry in an object like:
     * <pre>
     *     {
     *         index1: ...
     *         index2: ...
     *         value: item
     *     }
     * </pre>
     * so the DB can be queried by each of the indexes and still allow for lazy loading
     * @param {string} key
     * @param {Shipment} item
     * @param {string|object} record
     * @return {object} the indexed object to be stored in the db
     * @protected
     * @override
     */
    _indexItem(key, item, record) {
        if (!record){
            record = item;
            item = key;
            key = undefined;
        }
        return {...super._indexItem(key, item, record), senderId: item.senderId, requesterId: item.requesterId}
    };

    /**
     * Lists all received orders.
     * @param {boolean} [readDSU] defaults to true. decides if the manager loads and reads from the dsu's {@link INFO_PATH} or not
     * @param {object} [options] query options. defaults to {@link DEFAULT_QUERY_OPTIONS}
     * @param {function(err, Order[])} callback
     */
    getAll(readDSU, options, callback) {
        const defaultOptions = () => Object.assign({}, DEFAULT_QUERY_OPTIONS);

        if (!callback) {
            if (!options) {
                callback = readDSU;
                options = defaultOptions();
                readDSU = true;
            }
            if (typeof readDSU === 'boolean') {
                callback = options;
                options = defaultOptions();
            }
            if (typeof readDSU === 'object') {
                callback = options;
                options = readDSU;
                readDSU = true;
            }
        }

        options = options || defaultOptions();

        super.getAll(readDSU, options, callback);
    }

    /**
     * Processes the received messages, saves them to the the table and deletes the message
     * @param {*} message
     * @param {function(err?)} callback
     * @protected
     * @override
     */
    _processMessageRecord(message, callback) {
        let self = this;
        if (!message || typeof message !== "string")
            return callback(`Message ${message} does not have  non-empty string with keySSI. Skipping record.`);

        self._getDSUInfo(message, (err, shipmentObj, shipmentDsu) => {
            if (err)
                return self._err(`Could not read DSU from message keySSI in record ${message}. Skipping record.`, err, callback);

            console.log(`ReceivedShipment`, shipmentObj);
            const shipmentId = shipmentObj.shipmentId;
            if (!shipmentId)
                return callback("ReceivedShipment doest not have an shipmentId. Skipping record.");
            const shipmentKey = self._genCompostKey(shipmentObj.senderId, shipmentId);

            const cb = function(err){
                if (err)
                    return self._err(`Could not insert record:\n${err.message}`, err, callback);
                self.issuedOrderManager._getDSUInfo(shipmentObj.orderSSI, (err, orderObj) => {
                    if (err)
                        return self._err(`Could not read order Info`, err, callback);
                    self.issuedOrderManager.updateOrderByShipment(orderObj.orderId, message, shipmentObj, callback);
                });
            }

            self.getRecord(shipmentKey, (err, record) => {
                if (err){
                    console.log(`received new ReceivedShipment`, shipmentObj)
                    return self.insertRecord(shipmentKey, self._indexItem(shipmentId, shipmentObj, message), cb);
                }
                console.log(`Updating ReceivedShipment`, shipmentObj)
                self.updateRecord(shipmentKey, self._indexItem(shipmentKey, shipmentObj, message), cb);
            });
        });
    };

    /**
     * updates an item
     *
     * @param {string} [key] key is optional so child classes can override them
     * @param {Shipment} shipment
     * @param {function(err, Shipment?, Archive?)} callback
     */
    update(key, shipment, callback){
        callback(`Functionality not available`);
    }
}


/**
 * @param {ParticipantManager} participantManager
 * @param {function(err, Manager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @returns {ReceivedShipmentManager}
 * @memberOf Managers
 */
const getReceivedShipmentManager = function (participantManager, callback) {
    let manager;
    try {
        manager = participantManager.getManager(ReceivedShipmentManager);
        if (callback)
            return callback(undefined, manager);
    } catch (e){
        manager = new ReceivedShipmentManager(participantManager, callback);
    }

    return manager;
}

module.exports = getReceivedShipmentManager;

},{"../../pdm-dsu-toolkit/managers/Page":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/managers/Page.js","../constants":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/constants.js","../model":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/index.js","./IssuedOrderManager":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/managers/IssuedOrderManager.js","./ShipmentManager":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/managers/ShipmentManager.js"}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/managers/SaleManager.js":[function(require,module,exports){
const {INFO_PATH, DB, DEFAULT_QUERY_OPTIONS, ANCHORING_DOMAIN} = require('../constants');
const Manager = require("../../pdm-dsu-toolkit/managers/Manager");
const Sale = require('../model/Sale');
const Batch = require('../model/Batch');
const BatchStatus = require('../model/BatchStatus');
const IndividualProduct = require('../model/IndividualProduct');
const IndividualProductStatus = require('../model/IndividualProductStatus');
const utils = require('../services').utils;
const getReceiptManager = require('./ReceiptManager');


/**
 * Stock Manager Class
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
 * @param {ParticipantManager} participantManager
 * @param {function(err, Manager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @class SaleManager
 * @extends Manager
 * @memberOf Managers
 */
class SaleManager extends Manager{
    constructor(participantManager, callback) {
        super(participantManager, DB.sales, ['id', 'products', 'sellerId'], (err, manager) => {
            if (err)
                return callback ? callback(err) : console.log(err);
            getReceiptManager(participantManager, (err, receiptManager) => {
                if (err)
                    console.log(`Could not get IssuedOrderManager:`, err);
                else
                    manager.receiptManager = receiptManager;

                if (callback)
                    callback(undefined, manager);
            })
        });
        this.stockManager = participantManager.stockManager;
        this.receiptManager = this.receiptManager || undefined;
        this.saleService = new (require('../services').SaleService)(ANCHORING_DOMAIN);
    }

    /**
     *
     * @param key
     * @param item
     * @param {Sale} record
     * @return {{}}
     * @private
     */
    _indexItem(key, item, record) {
        if (!record){
            record = item;
            item = undefined;
            if (!record){
                record = key;
                key = record.id
            }
        }
        return Object.assign(record, {
            products: record.productList
                .map(ip => `${ip.gtin}-${ip.batchNumber}-${ip.serialNumber}`)
                .join(',')})
    }

    /**
     * Verify if the sale can be done. Some conditions that are checked:
     *  - GTIN and BATCH need exists in stock
     * - Check if product qty in stock is enough
     *  - Check if sale is not duplicated (product already sold)
     * - Check if product status is not recalled or quarantined
     * @param {{}} aggStock: key is a GTIN, value is an array of BATCHES
     * @param {{}} productList: key is a manufName identifier, value is an array of IndividualProduct
     * @param callback
     */
    _checkStockAvailability(aggStock, productList, callback) {
        const self = this;
        const qtySoldByGtinBatch = {}; // qty sold by gtin and batch, cannot sale more than exists on stock
        const qtySoldBySn = {}; // qty sold by serial number, cannot sale same product more than once
        const aggBatchesByGtin = {}
        const aggIndividualProductsByMAH = {};

        const iterator = (_aggStock, _productList, _callback) => {
            const productSold = _productList.shift();
            if (!productSold)
                return _callback(undefined, aggBatchesByGtin, aggIndividualProductsByMAH);

            const receiptId = self.receiptManager._genCompostKey(productSold);
            self.receiptManager.getOne(receiptId, (err, receipt) => {
                if (receipt)
                    return _callback(`Product gtin: ${productSold.gtin}, batchNumber: ${productSold.batchNumber}, serialNumber: ${productSold.serialNumber} already sold.`);

                const gtinBatchNumber = `${productSold.gtin}-${productSold.batchNumber}`;
                if(!(_aggStock.hasOwnProperty(gtinBatchNumber)))
                    return _callback(`Product gtin ${productSold.gtin}, batchNumber ${productSold.batchNumber} not found in stock.`);

                // check if selling the same product more than once
                const indProductId = `${productSold.gtin}-${productSold.batchNumber}-${productSold.serialNumber}`;
                qtySoldBySn[indProductId] = 1 + (qtySoldBySn[indProductId]  || 0);
                if (qtySoldBySn[indProductId] > 1)
                    return _callback(`Product ${productSold.gtin}: trying to sold a product more than once.`);

                const stockProduct = _aggStock[gtinBatchNumber];
                // check if sale qty is available in stock
                qtySoldByGtinBatch[gtinBatchNumber] = 1 + (qtySoldByGtinBatch[gtinBatchNumber] || 0);
                if (stockProduct.batch.quantity - qtySoldByGtinBatch[gtinBatchNumber] < 0)
                    return _callback(`Product ${productSold.gtin}: quantity not enough in stock.`);

                if (stockProduct.batch.batchStatus.status !== BatchStatus.COMMISSIONED)
                    return _callback(`Product gtin ${productSold.gtin}, batch ${productSold.batchNumber}: is not available for sale, because batchStatus is ${stockProduct.batch.batchStatus.status}. `)

                const individualProductSold = new IndividualProduct({
                    gtin: productSold.gtin,
                    batchNumber: productSold.batchNumber,
                    serialNumber: productSold.serialNumber,
                    name: stockProduct.name,
                    manufName: stockProduct.manufName,
                    expiry: stockProduct.batch.expiry,
                    status: IndividualProductStatus.DISPENSED
                });

                // add to aggIndividualProductsByMAH
                const mah = stockProduct.manufName;
                if (aggIndividualProductsByMAH.hasOwnProperty(mah))
                    aggIndividualProductsByMAH[mah].push(individualProductSold);
                else
                    aggIndividualProductsByMAH[mah] = [individualProductSold];

                // add to aggBatchesByGtin
                if (aggBatchesByGtin.hasOwnProperty(productSold.gtin)) {
                    const batch = aggBatchesByGtin[productSold.gtin].find((batch) => batch.batchNumber === productSold.batchNumber);
                    batch.serialNumbers.push(productSold.serialNumber);
                    batch.quantity = batch.getQuantity() * -1; // update qty because when create a Batch, there is a qty validation
                } else {
                    const batch = new Batch({
                        batchNumber: productSold.batchNumber,
                        serialNumbers: [productSold.serialNumber],
                    });
                    batch.quantity = batch.getQuantity() * -1; // update qty because when create a Batch, there is a qty validation
                    aggBatchesByGtin[productSold.gtin] = [batch]
                }

                iterator(_aggStock, _productList, _callback);
            })
        }

        iterator(aggStock, productList.slice(), callback);
    }

    /**
     * Creates a {@link Sale} entry
     * @param {Sale} sale
     * @param {function(err, keySSI?, string?)} callback where the string is the mount path relative to the main DSU
     */
    create(sale, callback) {
        let self = this;

        if (!(sale instanceof Sale))
            sale = new Sale(sale);

        const query = {query: [`gtin like /${sale.productList.map(il => il.gtin).join('|')}/g`]};
        self.stockManager.getAll(true, query, (err, stocks) => {
            if (err)
                return self._err(`Could not get stocks for sale`, err, callback);

            if (!stocks || stocks.length === 0)
                return callback(`Not available stock for sale.`);

            const cb = function(err, ...results){
                if (err)
                    return self.cancelBatch(_ => callback(err));
                callback(undefined, ...results);
            }

            const aggStockByGtinBatch = (accum, _stock, _callback) => {
                const stock = _stock.shift();
                if (!stock)
                    return _callback(accum);

                const batches = stock.batches.reduce((_accum, batch) => {
                    _accum[`${stock.gtin}-${batch.batchNumber}`] = {
                        gtin: stock.gtin,
                        name: stock.name,
                        manufName: stock.manufName,
                        batch: batch
                    };
                    return _accum;
                }, {});

                accum = {...accum, ...batches};
                aggStockByGtinBatch(accum, _stock, _callback);
            }

            aggStockByGtinBatch({}, stocks.slice(), (resultAggStockByGtinBatch) => {

                self._checkStockAvailability(resultAggStockByGtinBatch, sale.productList, (err, aggBatchesByGtin, aggIndividualProductsByMAH) => {
                    if (err)
                        return callback(err);

                    const dbAction = function(sale, aggBatchesByGtin, aggIndividualProductsByMAH, _callback) {
                        try {
                            self.beginBatch();
                        } catch (e){
                            return self.batchSchedule(() => dbAction(sale, aggBatchesByGtin, aggIndividualProductsByMAH, _callback));
                        }

                        const removeFromStock = function(gtins, _aggBatchesByGtin, _callback){
                            const gtin = gtins.shift();
                            if (!gtin)
                                return _callback(undefined);

                            self.batchAllow(self.stockManager);
                            self.stockManager.manageAll(gtin, _aggBatchesByGtin[gtin].slice(), (err, serials, stocks) => {
                                self.batchDisallow(self.stockManager);
                                if (err)
                                    return _callback(err);
                                removeFromStock(gtins, _aggBatchesByGtin, _callback);
                            });
                        }

                        removeFromStock(Object.keys(aggBatchesByGtin), aggBatchesByGtin, (err) => {
                            if (err)
                                return cb(err);
                            console.log(`Creating sale entry for: ${sale.productList.map(p => `${p.gtin}-${p.batchNumber}-${p.serialNumber}`).join(', ')}`);
                            self._addSale(sale.id, aggIndividualProductsByMAH, (err, readSSis, insertedSale, ) => {
                                if (err)
                                    return cb(`Could not Create Sales DSUs`);
                                self.insertRecord(insertedSale.id, self._indexItem(insertedSale), (err) => {
                                    if (err)
                                        return cb(`Could not insert record with id ${insertedSale.id} on table ${self.tableName}`);
                                    self.commitBatch((err) => {
                                        if(err)
                                            return cb(err);
                                        const path =`${self.tableName}/${insertedSale.id}`;
                                        console.log(`Sale stored at '${path}'`);
                                        _callback(undefined, insertedSale, path, readSSis);
                                    });
                                });
                            });
                        });
                    }

                    dbAction(sale, aggBatchesByGtin,  aggIndividualProductsByMAH, callback);
                });
            })

        }); // stockManager.getAll end
    }

    _addSale(saleId, aggIndividualProductsByMAH, callback){
        const self = this;
        const sellerId = self.getIdentity().id;
        const insertedSale = new Sale({
            id: saleId,
            sellerId: sellerId,
            productList: []
        });
        const saleReadSSIs = [];

        const createIterator = function(products, accumulator, _callback){
            const saleByMAH = new Sale({
                id: saleId,
                sellerId: sellerId,
                productList: products
            });
            const saleErr = saleByMAH.validate();
            if (saleErr)
                return self._err(`Sale validate error`, saleErr, _callback);
            insertedSale.productList.push(...saleByMAH.productList);

            self.saleService.create(saleByMAH, (err, keySSI, dsu) => {
                if (err)
                    return self._err(`Could not create Sale DSU`, err, _callback);
                accumulator.push(keySSI.getIdentifier());
                console.log(`Created Sale with SSI ${keySSI.getIdentifier()}`);
                _callback(undefined, accumulator);
            });
        }

        const createAndNotifyIterator = function(mahs, accumulator, _callback){
            const mah = mahs.shift();
            if (!mah)
                return _callback(undefined, saleReadSSIs, insertedSale);

            createIterator(aggIndividualProductsByMAH[mah].slice(), [], (err, keySSIs) => {
                if (err)
                    return _callback(err);
                accumulator[mah] = keySSIs;
                const keySSISpace = utils.getKeySSISpace();

                let readSSIs;

                try {
                    readSSIs = keySSIs.map(k => keySSISpace.parse(k).derive().getIdentifier())
                    saleReadSSIs.push(...readSSIs);
                } catch(e) {
                    return _callback(`Invalid keys found`);
                }

                self.sendMessage(mah, DB.receipts, readSSIs, err =>
                    self._messageCallback(err ? `Could not send message` : `Message to Mah ${mah} sent with sales`));
                createAndNotifyIterator(mahs, accumulator, _callback);
            });
        }

        createAndNotifyIterator(Object.keys(aggIndividualProductsByMAH), {}, callback);
    }

    /**
     * updates a product from the list
     * @param {string|number} [id] the table key
     * @param {Sale} newSale
     * @param {function(err, Sale?)} callback
     * @override
     */
    update(id, newSale, callback){
        return callback(`All sales are final`);
    }

    /**
     * reads ssi for that gtin in the db. loads is and reads the info at '/info'
     * @param {string} id
     * @param {boolean} [readDSU] defaults to true. decides if the manager loads and reads from the dsu or not
     * @param {function(err, Stock|KeySSI, Archive)} callback returns the Product if readDSU and the dsu, the keySSI otherwise
     * @override
     */
    getOne(id, readDSU,  callback) {
        if (!callback){
            callback = readDSU;
            readDSU = true;
        }
        let self = this;
        self.getRecord(id, (err, sale) => {
            if (err)
                return self._err(`Could not load record with key ${id} on table ${self._getTableName()}`, err, callback);
            callback(undefined, new Sale(sale));
        });
    }

    /**
     * Lists all registered items according to query options provided
     * @param {boolean} [readDSU] defaults to true. decides if the manager loads and reads from the dsu's {@link INFO_PATH} or not
     * @param {object} [options] query options. defaults to {@link DEFAULT_QUERY_OPTIONS}
     * @param {function(err, object[])} callback
     * @override
     */
    getAll(readDSU, options, callback){
        const defaultOptions = () => Object.assign({}, DEFAULT_QUERY_OPTIONS, {
            query: [
                "__timestamp > 0",
                'id like /.*/g'
            ],
            sort: "dsc"
        });

        if (!callback){
            if (!options){
                callback = readDSU;
                options = defaultOptions();
                readDSU = true;
            }
            if (typeof readDSU === 'boolean'){
                callback = options;
                options = defaultOptions();
            }
            if (typeof readDSU === 'object'){
                callback = options;
                options = readDSU;
                readDSU = true;
            }
        }

        options = options || defaultOptions();

        let self = this;
        self.query(options.query, options.sort, options.limit, (err, records) => {
            if (err)
                return self._err(`Could not perform query`, err, callback);
            if (!readDSU)
                return callback(undefined, records.map(r => r.pk));
            callback(undefined, records.map(r => new Sale(r)));
        });
    }

}


/**
 * @param {ParticipantManager} participantManager
 * @param {function(err, Manager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @returns {SaleManager}
 * @memberOf Managers
 */
const getSaleManager = function (participantManager, callback) {
    let manager;
    try {
        manager = participantManager.getManager(SaleManager);
        if (callback)
            return callback(undefined, manager);
    } catch (e){
        manager = new SaleManager(participantManager, callback);
    }

    return manager;
}

module.exports = getSaleManager;
},{"../../pdm-dsu-toolkit/managers/Manager":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/managers/Manager.js","../constants":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/constants.js","../model/Batch":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/Batch.js","../model/BatchStatus":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/BatchStatus.js","../model/IndividualProduct":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/IndividualProduct.js","../model/IndividualProductStatus":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/IndividualProductStatus.js","../model/Sale":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/Sale.js","../services":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/services/index.js","./ReceiptManager":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/managers/ReceiptManager.js"}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/managers/ShipmentLineManager.js":[function(require,module,exports){
const { DB, DEFAULT_QUERY_OPTIONS, ANCHORING_DOMAIN } = require('../constants');
const Manager = require("../../pdm-dsu-toolkit/managers/Manager");
const {toPage, paginate} = require("../../pdm-dsu-toolkit/managers/Page");
/**
 * ShipmentLine Manager Class
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
 * @param {ParticipantManager} participantManager
 * @param {function(err, Manager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @class ShipmentLineManager
 * @extends Manager
 * @memberOf Managers
 */
class ShipmentLineManager extends Manager {
    constructor(participantManager, callback) {
        super(participantManager, DB.shipmentLines, ['gtin', 'createdOn', 'batch', 'status', 'requesterId', 'senderId'], (err, manager) => {
            if (err)
                return callback ? callback(err) : console.log(err);
            manager.registerMessageListener((message, cb) => {
                manager.processMessageRecord(message, (err) => {
                    manager.refreshController();
                    cb(err);
                });
            });
            if (callback)
                callback(undefined, manager);
        });
        this.shipmentLineService = new (require('../services/ShipmentLineService'))(ANCHORING_DOMAIN);
    }

    /**
     * Util function that loads a ShipmentLineDSU and reads its information
     * @param {string|KeySSI} keySSI
     * @param {function(err, ShipmentLine, Archive)} callback
     * @protected
     * @override
     */
    _getDSUInfo(keySSI, callback){
        return this.shipmentLineService.get(keySSI, callback);
    }

    /**
     * generates the db's key for the ShipmentLine
     * @param {string|number} requesterId
     * @param {string|number} senderId
     * @param {string|number} gtin
     * @param {string|number} createdOn
     * @return {string}
     * @protected
     */
    _genCompostKey(requesterId, senderId, gtin, createdOn){
        return `${requesterId}-${senderId}-${gtin}-${createdOn}`;
    }

    /**
     * Must wrap the DB entry in an object like:
     * <pre>
     *     {
     *         index1: ...
     *         index2: ...
     *         value: item
     *     }
     * </pre>
     * so the DB can be queried by each of the indexes and still allow for lazy loading
     * @param {string} key
     * @param {ShipmentLine} item
     * @param {string|object} record
     * @return {object} the indexed object to be stored in the db
     * @protected
     * @override
     */
    _indexItem(key, item, record) {
        return {
            gtin: item.gtin,
            createdOn: item.createdOn,
            batch: item.batch,
            status: item.status.status,
            requesterId: item.requesterId,
            senderId: item.senderId,
            value: record
        }
    };

    /**
     * reads ssi for that OrderLine in the db. loads is and reads the info at '/info' and the status at '/status/info
     * @param {string} key
     * @param {boolean} [readDSU] defaults to true. decides if the manager loads and reads from the dsu or not
     * @param {function(err, object|KeySSI, Archive)} callback returns the Product if readDSU and the dsu, the keySSI otherwise
     */
    getOne(key, readDSU,  callback) {
        if (!callback){
            callback = readDSU;
            readDSU = true;
        }
        let self = this;
        self.getRecord(key, (err, itemSSI) => {
            if (err)
                return self._err(`Could not load record with key ${key} on table ${self._getTableName()}`, err, callback);
            if (!readDSU)
                return callback(undefined, itemSSI);
            self.shipmentLineService.get(itemSSI.value || itemSSI, callback);
        });
    }

    /**
     * Lists all received orders.
     * @param {boolean} [readDSU] defaults to true. decides if the manager loads and reads from the dsu's {@link INFO_PATH} or not
     * @param {object} [options] query options. defaults to {@link DEFAULT_QUERY_OPTIONS}
     * @param {function(err, Order[])} callback
     */
    getAll(readDSU, options, callback) {
        const defaultOptions = () => Object.assign({}, DEFAULT_QUERY_OPTIONS, {
            query: ['date > 0'],
            sort: 'dsc'
        });

        if (!callback) {
            if (!options) {
                callback = readDSU;
                options = defaultOptions();
                readDSU = true;
            }
            if (typeof readDSU === 'boolean') {
                callback = options;
                options = defaultOptions();
            }
            if (typeof readDSU === 'object') {
                callback = options;
                options = readDSU;
                readDSU = true;
            }
        }

        options = options || defaultOptions();

        let self = this;
        self.query(options.query, options.sort, options.limit, (err, records) => {
            if (err)
                return self._err(`Could not perform query`, err, callback);
            if (!readDSU)
                return callback(undefined, records.map(r => r.pk));
            self._iterator(records.map(r => r.value), self.shipmentLineService.get, (err, result) => {
                if (err)
                    return self._err(`Could not parse ${self._getTableName()}s ${JSON.stringify(records)}`, err, callback);
                console.log(`Parsed ${result.length} ${self._getTableName()}s`);
                callback(undefined, result);
            });
        });
    }

    _processMessageRecord(message, callback) {
        let self = this;
        if (!message || typeof message !== "string")
            return callback(`Message ${message} does not have  non-empty string with keySSI. Skipping record.`);

        let shipmentLines;
        try {
            shipmentLines = JSON.parse(message);
        } catch (e) {
            shipmentLines = [message];
        }

        const lines = [];

        const shipmentLineIterator = function(linesCopy, callback){
            const lineSSI = linesCopy.shift();
            if (!lineSSI)
                return callback(undefined, lines);
            self._getDSUInfo(lineSSI, (err, shipmentLine, shipmentLineDsu) => {
                if (err) {
                    console.log(`Could not read DSU from message keySSI in record ${message}. Skipping record.`);
                    return callback();
                }
                const compostKey = self._genCompostKey(shipmentLine.requesterId, shipmentLine.senderId, shipmentLine.gtin, shipmentLine.createdOn);

                const cb = function(err){
                    if (err)
                        return self._err(`Could not insert/update record for ShipmentLine ${compostKey}`, err, callback);
                    shipmentLineIterator(linesCopy, callback);
                }

                self.getRecord(compostKey,  (err, record) => {
                    if (err){
                        console.log(`Received ShipmentLine`, shipmentLine);
                        return self.insertRecord(compostKey, self._indexItem(undefined, shipmentLine, lineSSI), cb);
                    }
                    console.log(`Updating ShipmentLine`, shipmentLine);
                    self.updateRecord(compostKey, self._indexItem(undefined, shipmentLine, lineSSI), cb);
                });
            });
        }

        const dbAction = function(shipmentLines, lines, callback){

            const cbErr = function(err, ...results){
                if (err)
                    return self.cancelBatch(err2 => {
                        callback(err);
                    });
                callback(undefined, ...results);
            }
        
            try {
                self.beginBatch();
            } catch (e){
                return self.batchSchedule(() => dbAction(shipmentLines, lines, callback));
                //return callback(e);
            }

            shipmentLineIterator(shipmentLines.slice(), (err, newLines) => {
                if (err)
                    return cbErr(`Could not register all shipmentlines`);
                self.commitBatch((err) => {
                    if(err)
                        return cbErr(err);
                    console.log(`ShipmentLines successfully registered: ${JSON.stringify(newLines)}`);
                    callback(undefined, lines);
                });     
            });
        }

        dbAction(shipmentLines, lines, callback);
    };

    /**
     * updates a shipmentLine
     *
     * @param {string} [key] key is optional so child classes can override them
     * @param {ShipmentLine} shipmentLine
     * @param {function(err, Shipment?, Archive?)} callback
     */
    update(key, shipmentLine, callback){
        if (!callback){
            callback = shipmentLine;
            shipmentLine = key;
            key = this._genCompostKey(shipmentLine.requesterId, shipmentLine.senderId, shipmentLine.gtin, shipmentLine.createdOn);
        }

        let self = this;
        self.getRecord(key, (err, record) => {
            if (err)
                return self._err(`Unable to retrieve record with key ${key} from table ${self._getTableName()}`, err, callback);
            self.updateRecord(key, self._indexItem(key, shipmentLine, record.value), (err) => {
                    if (err)
                        return self._err(`Unable to update record with key ${key} from table ${self._getTableName()}`, err, callback);
                    callback(undefined, shipmentLine, record.value);
            });
        });
    }
}

/**
 * @param {ParticipantManager} participantManager
 * @param {function(err, Manager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @returns {ShipmentLineManager}
 * @memberOf Managers
 */
const getShipmentLineManager = function (participantManager,  callback) {
    let manager;
    try {
        manager = participantManager.getManager(ShipmentLineManager);
        if (callback)
            return callback(undefined, manager);
    } catch (e){
        manager = new ShipmentLineManager(participantManager, callback);
    }

    return manager;
}

module.exports = getShipmentLineManager;

},{"../../pdm-dsu-toolkit/managers/Manager":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/managers/Manager.js","../../pdm-dsu-toolkit/managers/Page":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/managers/Page.js","../constants":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/constants.js","../services/ShipmentLineService":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/services/ShipmentLineService.js"}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/managers/ShipmentManager.js":[function(require,module,exports){
const { ANCHORING_DOMAIN, DB } = require('../constants');
const Manager = require("../../pdm-dsu-toolkit/managers/Manager");

/**
 * Shipment Manager Class
 *
 * Abstract class.
 * Use only concrete subclasses {@link IssuedShipmentManager} or {@link ReceivedShipmentManager}.
 *
 * @param {ParticipantManager} participantManager the top-level manager for this participant, which knows other managers.
 * @param {string} tableName the default table name for this manager eg: MessageManager will write to the messages table
 * @param {string[]} indexes the indexes to be applied to the table in the db. cannot be undefined
 * @param {function(err, Manager)} callback
 * @memberOf Managers
 * @class ShipmentManager
 * @extends Manager
 * @abstract
 */
class ShipmentManager extends Manager {
    constructor(participantManager, tableName, indexes, callback) {
        super(participantManager, tableName, ['shipmentId', 'products', 'batches', 'status', ...indexes], callback);
        this.shipmentService = new (require('../services').ShipmentService)(ANCHORING_DOMAIN);
    }

    /**
     * generates the db's key for the Shipment
     * @param {string|number} otherParticipantId
     * @param {string|number} shipmentId
     * @return {string}
     * @protected
     */
    _genCompostKey(otherParticipantId, shipmentId){
        return `${otherParticipantId}-${shipmentId}`;
    }

    /**
     * Util function that loads a ShipmentDSU and reads its information
     * @param {string|KeySSI} keySSI
     * @param {function(err, Shipment, Archive)} callback
     * @protected
     * @override
     */
    _getDSUInfo(keySSI, callback){
        return this.shipmentService.get(keySSI, callback);
    }

    /**
     * Must wrap the entry in an object like:
     * <pre>
     *     {
     *         index1: ...
     *         index2: ...
     *         value: item
     *     }
     * </pre>
     * so the DB can be queried by each of the indexes and still allow for lazy loading
     * @param {string} [key]
     * @param {Shipment} item
     * @param {string|object} record
     * @return {any} the indexed object to be stored in the db
     * @protected
     * @override
     */
    _indexItem(key, item, record) {
        if (!record){
            record = item;
            item = key;
            key = undefined;
        }
        return {
            shipmentId: item.shipmentId,
            status: item.status.status,
            products: item.shipmentLines.map(ol => ol.gtin).join(','),
            batches: item.shipmentLines.map(ol => ol.batch).join(','),
            value: record
        }
    }

    /**
     * reads ssi for that gtin in the db. loads is and reads the info at '/info'
     * @param {string} key
     * @param {boolean} [readDSU] defaults to true. decides if the manager loads and reads from the dsu or not
     * @param {function(err, object
     * |KeySSI, Archive)} callback returns the Product if readDSU and the dsu, the keySSI otherwise
     */
    getOne(key, readDSU,  callback) {
        if (!callback){
            callback = readDSU;
            readDSU = true;
        }
        let self = this;
        self.getRecord(key, (err, record) => {
            if (err)
                return self._err(`Could not load record with key ${key} on table ${self._getTableName()}`, err, callback);
            if (!readDSU)
                return callback(undefined, record.value || record);
            self._getDSUInfo(record.value || record, callback);
        });
    }

    /**
     * messages to all MAHs.
     * the shipment is the same for the orderlines and their ssis because of the way the code is written
     * @param shipmentLines
     * @param shipmentLinesSSI
     * @param callback
     * @return {*}
     */
    sendShipmentLinesToMAH(shipmentLines, shipmentLinesSSI, callback) {
        const self = this;
        if (shipmentLines.length !== shipmentLinesSSI.length)
            return callback(`Invalid arguments`);

        const orderLineIterator = function(linesCopy,  mahs, callback){
            if (!callback){
                callback = mahs;
                mahs = [];
            }

            const shipmentLine = linesCopy.shift();

            if (!shipmentLine){
                console.log(`All MAHs resolved`)
                return callback(undefined, mahs);
            }

            self.shipmentService.resolveMAH(shipmentLine, (err, mahId) => {
                if (err)
                    return self._err(`Could not resolve MAH for ${shipmentLine}`, err, callback);
                mahs.push(mahId);
                orderLineIterator(linesCopy, mahs, callback);
            });
        }

        orderLineIterator(shipmentLines.slice(), (err, resolvedMahs) => {
            if (err)
                return self._err(`Error resolving MAHs`, err, callback);

            const byMAH = resolvedMahs.reduce((accum, mah, i) => {
                (accum[mah] = accum[mah] || []).push(shipmentLinesSSI[i]);
                return accum;
            }, {});

            Object.keys(byMAH).forEach(mahId => {
                const ssis = byMAH[mahId].map(k => typeof k === 'string' ? k : k.getIdentifier());
                const message = JSON.stringify(ssis);
                self.sendMessage(mahId, DB.shipmentLines, message, (err) =>
                    self._messageCallback(err ? `Could not send message to MAH ${mahId} for shipmentLines ${JSON.stringify(byMAH[mahId])} with ssis ${ssis} ${err}` : err,
                        `ShipmentLines ${message} transmitted to MAH ${mahId}`));
            });

            callback();
        });
    }

    /**
     * updates an item
     *
     * @param {string} [key] key is optional so child classes can override them
     * @param {Shipment} shipment
     * @param {function(err, Shipment?, Archive?)} callback
     */
    update(key, shipment, callback){
        if (!callback)
            return callback(`No key Provided...`);

        let self = this;
        self.getRecord(key, (err, record) => {
            if (err)
                return self._err(`Unable to retrieve record with key ${key} from table ${self._getTableName()}`, err, callback);
            self.shipmentService.update(record.value, shipment, (err, updatedShipment, dsu, orderId, linesSSis) => {
                if (err)
                    return self._err(`Could not Update Order DSU`, err, callback);
                self.updateRecord(key, self._indexItem(key, updatedShipment, record.value), (err) => {
                    if (err)
                        return self._err(`Unable to update record with key ${key} from table ${self._getTableName()}`, err, callback);
                    callback(undefined, updatedShipment, record.value, orderId, linesSSis);
                });
            });
        });
    }
}

module.exports = ShipmentManager;
},{"../../pdm-dsu-toolkit/managers/Manager":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/managers/Manager.js","../constants":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/constants.js","../services":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/services/index.js"}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/managers/StockManager.js":[function(require,module,exports){
const {INFO_PATH, DB, DEFAULT_QUERY_OPTIONS, ANCHORING_DOMAIN} = require('../constants');
const Manager = require("../../pdm-dsu-toolkit/managers/Manager");
const {functionCallIterator} = require('../services').utils;
const Stock = require('../model/Stock');
const Batch = require('../model/Batch');
const StockStatus = require('../model/StockStatus');
const StockManagementService = require("../services/StockManagementService");
const Page = require('../../pdm-dsu-toolkit/managers/Page');
const { toPage, paginate } = require('../../pdm-dsu-toolkit/managers/Page');
const ShipmentStatus = require("../model/ShipmentStatus");

/**
 * Stock Manager Class
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
 * @param {ParticipantManager} participantManager
 * @param {function(err, Manager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @class StockManager
 * @extends Manager
 * @memberOf Managers
 */
class StockManager extends Manager{
    constructor(participantManager, serialization, aggregation, callback) {
        super(participantManager, DB.stock, ['name', 'gtin', 'manufName', 'quantity'], callback || aggregation);
        this.serialization = serialization;
        this.aggregation = callback ? aggregation : false;
        this.productService = undefined;
        this.batchService = undefined;
        this.participantManager = participantManager;
    }

    _getProduct(gtin, callback){
        if (!this.productService)
            this.productService = new (require('../services/ProductService'))(ANCHORING_DOMAIN);
        this.productService.getDeterministic(gtin, callback);
    }

    _getBatch(gtin, batch, callback){
        if (!this.batchService)
            this.batchService = new (require('../services/BatchService'))(ANCHORING_DOMAIN);
        this.batchService.getDeterministic(gtin, batch, callback)
    }

    /**
     * Creates a {@link Product} dsu
     * @param {string|number} [gtin] the table key
     * @param {Stock} stock
     * @param {function(err, keySSI, string)} callback where the string is the mount path relative to the main DSU
     */
    create(gtin, stock, callback) {
        if (!callback) {
            callback = stock;
            stock = gtin;
            gtin = stock.gtin;
        }
        let self = this;
        stock.quantity = stock.getQuantity();
        console.log(`Adding Stock for ${gtin} batches: ${stock.batches.map(b => b.batchNumber).join(', ')}`);
        self.insertRecord(gtin, stock, (err) => {
            if (err)
                return self._err(`Could not insert record with gtin ${gtin} on table ${self.tableName}`, err, callback);
            const path =`${self.tableName}/${gtin}`;
            console.log(`Stock for Product ${gtin} created stored at '${path}'`);
            callback(undefined, stock, path);
        });
    }

    /**
     * updates a product from the list
     * @param {string|number} [gtin] the table key
     * @param {Stock} newStock
     * @param {function(err, Stock)} callback
     * @override
     */
    update(gtin, newStock, callback){
        if (!callback){
            callback = newStock;
            newStock = gtin;
            gtin = newStock.gtin;
        }
        let self = this;
        newStock.quantity = newStock.getQuantity();
        self.updateRecord(gtin, newStock, (err) => {
            if (err)
                return self._err(`Could not update stock with gtin ${gtin}: ${err.message}`, err, callback);
            console.log(`Stock for Product ${gtin} updated`);
            callback(undefined, newStock)
        });
    }


    /**
     *
     * @param {Product} product
     * @param {Batch} batch
     * @param {function(err?, string[]?, Stock?)} callback
     */
    manage(product, batch, callback){
        const self = this;

        if (batch.length === 0)
            return callback();

        const gtin = product.gtin || product;

        const getBatch = function(gtin, batch, callback){
            self._getBatch(gtin, batch.batchNumber, (err, batchFromDSU) => {
                if (err)
                    return callback(err);
                batch = new Batch({
                    batchNumber: batchFromDSU.batchNumber,
                    expiry: batchFromDSU.expiry,
                    serialNumbers: batch.serialNumbers,
                    quantity: batch.quantity,
                    batchStatus: batchFromDSU.batchStatus
                })
                callback(undefined, batch);
            });
        }

        self.getOne(gtin, true, (err, stock) => {
            if (err){
                console.log('batch quantity err check', batch.quantity);
                if (batch.quantity < 0)
                    return callback(`Trying to reduce from an unexisting stock`);

                const cb = function(product){
                    const newStock = new Stock(product);
                    getBatch(product.gtin, batch, (err, mergedBatch) => {
                        if (err)
                            return callback(err);
                        newStock.batches = [mergedBatch];
                        return self.create(gtin, newStock, (err, created, path) => {
                            if (err)
                                return callback(err);
                            callback(undefined, batch.serialNumbers || batch.quantity, newStock);
                        });
                    });
                }

                if (typeof product !== 'string')
                    return cb(product);

                return self._getProduct(product, (err, product) => err
                    ? callback(err)
                    : cb(product));
            }

            getBatch(gtin, batch, (err, updatedBatch) => {
                if (err)
                    return callback(err);

                const sb = stock.batches.map((b,i) => ({batch: b, index: i})).find(b => b.batch.batchNumber === batch.batchNumber);

                let serials;
                if (!sb){
                    if (batch.getQuantity() < 0)
                        return callback(`Given a negative amount on a unnexisting stock`);
                    stock.batches.push(updatedBatch);
                    console.log(`Added batch ${updatedBatch.batchNumber} with ${updatedBatch.serialNumbers ? updatedBatch.serialNumbers.length : updatedBatch.getQuantity()} items`);
                } else {
                    const newQuantity = sb.batch.getQuantity() + (updatedBatch.quantity || updatedBatch.getQuantity());
                    if (newQuantity < 0)
                        return callback(`Illegal quantity. Not enough Stock. requested ${batch.getQuantity() } of ${sb.batch.getQuantity() }`);
                    serials = sb.batch.manage(updatedBatch.getQuantity(), this.serialization);
                    stock.batches[sb.index] = new Batch({
                        batchNumber: updatedBatch.batchNumber,
                        expiry: updatedBatch.expiry,
                        batchStatus: updatedBatch.batchStatus,
                        quantity: newQuantity,
                        serialNumbers: sb.batch.serialNumbers
                    });
                }

                self.update(gtin, stock, (err, results) => {
                    if (err)
                        return self._err(`Could not manage stock for ${gtin}: ${err.message}`, err, callback);
                    console.log(`Updated Stock for ${gtin} batch ${batch.batchNumber}. ${self.serialization && serials ? serials.join(', ') : ''}`);
                    callback(undefined, (serials && serials.length ? serials : undefined) || batch.serialNumbers || batch.quantity, results);
                });
            });


        });
    }

    /**
     *
     * @param {string} product gtin
     * @param {Batch[]} batches
     * @param {function(err?, {}?)} callback where {} as batchnumber as keys, as the added/removed serials as value
     */
    manageAll(product, batches, callback){
        const self = this;
        
        const dbAction = function(product, batches, callback){
            

            const iterator = function(product){
                return function(batch, callback){
                    return self.manage(product, batch, (err, serials, stock) => {
                        if (err)
                            return callback(err);
                        callback(undefined, batch, serials, stock);
                    });
                }
            }
    
            const cb = function(err, ...results){
                if (err)
                    return self.cancelBatch(err2 => {
                        callback(err);
                    });
                callback(undefined, ...results);
            }

            try {
                self.beginBatch();
            } catch (e){
                return self.batchSchedule(() => dbAction(product, batches, callback));
                //return callback(e);
            }

            functionCallIterator(iterator(product).bind(this), batches, (err, ...results) => {
                if (err)
                    return cb(`Could not perform manage all on Stock beacause ${err}`);

                self.commitBatch((err) => {
                    if(err)
                        return cb(err);
                    const newStocks = [];
                    const mergedResult = results.reduce((accum, result) => {
                        accum[result[0].batchNumber] = accum[result[0].batchNumber] || [];
                        try {
                            accum[result[0].batchNumber].push(...(Array.isArray(result[1]) ? result[1] : [result[1]]))
                        } catch (e) {
                            console.log(e)
                        }
                        if (result.length >= 3)
                            newStocks.push(result[2])
                        return accum;
                    }, {});
        
                    callback(undefined, mergedResult, newStocks);
                });      
            });
        }

        dbAction(product, batches, callback);

    }

    /**
     * updates a product from the list
     * @param {string[]|number[]} [gtins] the table key
     * @param {Stock[]} newStocks
     * @param {function(err, Stock[])} callback
     * @override
     */
    updateAll(gtins, newStocks, callback){
        if (!callback){
            callback = newStocks;
            newStocks = gtins;
            gtins = newStocks.map(s => s.gtin);
        }
        let self = this;
        super.updateAll(gtins, newStocks, (err) => {
            if (err)
                return self._err(`Could not update products`, err, callback);
            console.log(`Products ${JSON.stringify(gtins)} updated`);
            callback(undefined, newStocks)
        });
    }

    /**
     * reads ssi for that gtin in the db. loads is and reads the info at '/info'
     * @param {string} gtin
     * @param {boolean} [readDSU] defaults to true. decides if the manager loads and reads from the dsu or not
     * @param {function(err, Stock|KeySSI, Archive)} callback returns the Product if readDSU and the dsu, the keySSI otherwise
     * @override
     */
    getOne(gtin, readDSU,  callback) {
        if (!callback){
            callback = readDSU;
            readDSU = true;
        }
        let self = this;
        self.getRecord(gtin, (err, stock) => {
            if (err)
                return self._err(`Could not load record with key ${gtin} on table ${self._getTableName()}`, err, callback);
            callback(undefined, new Stock(stock));
        });
    }

    /**
     * Lists all registered items according to query options provided
     * @param {boolean} [readDSU] defaults to true. decides if the manager loads and reads from the dsu's {@link INFO_PATH} or not
     * @param {object} [options] query options. defaults to {@link DEFAULT_QUERY_OPTIONS}
     * @param {function(err, object[])} callback
     * @override
     */
    getAll(readDSU, options, callback){
        const defaultOptions = () => Object.assign({}, DEFAULT_QUERY_OPTIONS, {
            query: ['gtin like /.*/g']
        });

        if (!callback){
            if (!options){
                callback = readDSU;
                options = defaultOptions();
                readDSU = true;
            }
            if (typeof readDSU === 'boolean'){
                callback = options;
                options = defaultOptions();
            }
            if (typeof readDSU === 'object'){
                callback = options;
                options = readDSU;
                readDSU = true;
            }
        }

        options = options || defaultOptions();

        let self = this;
        self.query(options.query, options.sort, options.limit, (err, records) => {
            if (err)
                return self._err(`Could not perform query`, err, callback);
            if (!readDSU)
                return callback(undefined, records.map(r => r.pk));
            callback(undefined, records.map(r => new Stock(r)));
        });
    }

    /**
     * Get partner stock products that were shipped by MAH/manufName
     * @param { string } gtin
     * @param {{manufName: string, batch: number, partnersId: string || string[]}} options
     * @param callback
     */
    getStockTraceability(gtin, options, callback) {
        let self = this;
        if (!callback) {
            callback = options;
            options = {}
        }
        const {manufName, batch, partnersId} = options;

        if (!manufName) {
            return self._getProduct(gtin, (err, product) => {
                if (err)
                    return callback(err);
                return self.getStockTraceability(gtin, {batch, partnersId, manufName: product.manufName}, callback);
            });
        }

        const identity = self.getIdentity();
        if (identity.id !== manufName) {
            return callback('Stock Traceability is only available for Marketing Authorization Holder')
        }

        try {
            this.stockManager = this.stockManager || this.participantManager.getManager("StockManager");
            this.shipmentLineManager = this.shipmentLineManager || this.participantManager.getManager("ShipmentLineManager");
            this.receiptManager = this.receiptManager || this.participantManager.getManager("ReceiptManager");
        } catch (e) {
            return callback(e);
        }
        const stockManagementService = new StockManagementService(manufName, partnersId, this.stockManager, this.shipmentLineManager, this.receiptManager);
        stockManagementService.traceStockManagement(gtin, batch, callback)
    }

    toModel(filteredStock, model){
        return Object.entries(filteredStock).map(([key, value]) => {
            return {
                gtin: key,
                name: value.name,
                batches: value.stock
            }
        });
    }

}


/**
 * @param {ParticipantManager} participantManager
 * @param {boolean} [serialization] defaults to true.
 * @param {function(err, Manager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @returns {StockManager}
 * @memberOf Managers
 */
const getStockManager = function (participantManager, serialization, callback) {
    if (!callback){
        callback = serialization;
        serialization = true;
    }
    let manager;
    try {
        manager = participantManager.getManager(StockManager);
        if (callback)
            return callback(undefined, manager);
    } catch (e){
        manager = new StockManager(participantManager, serialization, callback);
    }

    return manager;
}

module.exports = getStockManager;
},{"../../pdm-dsu-toolkit/managers/Manager":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/managers/Manager.js","../../pdm-dsu-toolkit/managers/Page":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/managers/Page.js","../constants":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/constants.js","../model/Batch":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/Batch.js","../model/ShipmentStatus":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/ShipmentStatus.js","../model/Stock":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/Stock.js","../model/StockStatus":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/StockStatus.js","../services":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/services/index.js","../services/BatchService":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/services/BatchService.js","../services/ProductService":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/services/ProductService.js","../services/StockManagementService":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/services/StockManagementService.js"}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/managers/TraceabilityManager.js":[function(require,module,exports){
const {INFO_PATH, DB, DEFAULT_QUERY_OPTIONS, ANCHORING_DOMAIN} = require('../constants');
const Manager = require("../../pdm-dsu-toolkit/managers/Manager");
const TraceabilityService = require('../services/TraceabilityService');
const getShipmentLineManager = require('./ShipmentLineManager');
const getReceiptManager = require('./ReceiptManager');
const IndividualProduct = require('../model/IndividualProduct');

const ACTION = {
    REQUEST: 'request',
    RESPONSE: 'response'
}

class RequestCache {
    cache = {};

    submitRequest(id, callback){
        if (id in this.cache)
            return callback(`Id already Exists!`);
        this.cache[id] = callback;
        console.log(`Tracking request ${id} submitted`);
    }

    getRequest(id){
        if (!(id in this.cache))
            throw new Error(`Id does not exist in cache!`);
        const cb = this.cache[id];
        delete this.cache[id];
        return cb;
    }
}

const convertForJson = function(startNode, endNode){
    startNode = Object.assign({}, startNode);
    endNode = Object.assign({}, endNode);

    const nodeIterator = function(node, accumulator = {}){
        node.children = node.children || [];
        node.parents = node.parents || [];

        node.parents.reduce((accum, n) => nodeIterator(n, accum), accumulator);

        node.children = node.children.map(n => n.id);
        node.parents = node.parents.map(n => n.id);
        accumulator[node.id] = accumulator[node.id] || node;
        return accumulator;
    }

    const nodeList = nodeIterator(startNode);

    return {
        startNode: startNode,
        endNode: endNode,
        nodeList: nodeList
    }
}

class TrackMessage {
    id;
    action;
    message;
    requesterId;
    error;

    constructor(trackMessage){
        if (typeof trackMessage !== undefined)
            for (let prop in trackMessage)
                if (trackMessage.hasOwnProperty(prop))
                    this[prop] = trackMessage[prop];
        if (!this.action || !this.message)
            throw new Error(`Needs id, action and message`);
        if (this.action === ACTION.REQUEST && !this.id)
            this.id = Date.now();
        if (this.action === ACTION.REQUEST && !this.requesterId)
            throw new Error("Needs a requester Id for that action");
    }
}

/**
 * Stock Manager Class
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
 * @param {ParticipantManager} participantManager
 * @param {function(err, Manager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @class TraceabilityManager
 * @extends Manager
 * @memberOf Managers
 */
class TraceabilityManager extends Manager{
    constructor(participantManager, callback) {
        super(participantManager, DB.traceability, [], (err, manager) => {
            if (err)
                return callback ? callback(err) : console.log(err);
            manager.registerMessageListener((message, cb) => {
                manager.processMessageRecord(message, (err) => {
                    cb(err);
                });
            });
            if (callback)
                callback(undefined, manager);
        });
        this.participantManager = participantManager;
        this.requestCache = new RequestCache();
    }

    _processMessageRecord(message, callback) {
        let self = this;
        if (!message)
            return callback(`No message received. Skipping record.`);

        try {
            message = new TrackMessage(message);
        } catch (e) {
            return callback(e);
        }

        switch (message.action){
            case ACTION.REQUEST:
                return self._trackObj(message.requesterId, message.message, (err, startNode, endNode, nodeList) => {
                    self._replyToMessage(message.id, message.requesterId, startNode, endNode, nodeList, err, self._messageCallback)
                    callback();
                });
            case ACTION.RESPONSE:
                let cb;
                try {
                    cb = self.requestCache.getRequest(message.id);
                } catch (e) {
                    return callback(e);
                }
                cb(message.error, message.message.startNode, message.message.endNode, message.message.nodeList);
                return callback();
            default:
                return callback(`Invalid Action request received: ${message.action}`);
        }
    };

    _trackObj(requesterId, obj, callback){
        if (!callback) { // compatibility
            callback = obj;
            obj = requesterId;
            requesterId = undefined;
        }

        if (!this.getIdentity().id.startsWith("MAH")) // TODO: Bad hack (the other one was worse). maybe we just split this in two files to split the api
            return callback(`Only manufacturers can access this`);

        const self = this;

        const track = function(callback){
            const tracker = new TraceabilityService(self.shipmentLineManager, self.receiptManager, requesterId);
            const method = !!obj.serialNumber ? tracker.fromProduct : tracker.fromBatch;
            method(obj, (err, startNode, endNode) => {
                if (err)
                    return callback(err);
                console.log(`Tracking for product ${obj.gtin}, batch ${obj.batchNumber} and Serial ${obj.serialNumber} complete. Start and end Nodes:`, startNode, endNode);
                const message = convertForJson(startNode, endNode);
                callback(undefined, message.startNode, message.endNode, message.nodeList);
            });
        }

        const cacheManagers = function(callback){
            getShipmentLineManager(self.participantManager, (err, shipmentLineManager) => {
                if (err)
                    return callback(err);
                self.shipmentLineManager = shipmentLineManager;
                getReceiptManager(self.participantManager, (err, receiptManager) => {
                    if (err)
                        return callback(err);
                    self.receiptManager = receiptManager;
                    callback();
                });
            });
        }

        if (this.shipmentLineManager && this.receiptManager)
            return track(callback);

        cacheManagers((err) => {
            if (err)
                return callback(err);
            track(callback);
        });
    }

    _validate(obj) {
        const errors = [];
        if (!obj.gtin)
            errors.push('GTIN is required.');

        if (!obj.batchNumber)
            errors.push('batchNumber is required.');
        return errors.join(' ');
    }

    _replyToMessage(requestId, requesterId, startNode, endNode, nodeList, error, callback){
        const self = this;

        const reply = new TrackMessage({
            id: requestId,
            action: ACTION.RESPONSE,
            message: {
                startNode: startNode,
                endNode: endNode,
                nodeList: nodeList
            },
            error: error ? error.message || error : undefined
        });
        self.sendMessage(requesterId, reply, callback);
    }

    _getProduct(gtin, callback){
        if (!this.productService)
            this.productService = new (require('../services/ProductService'))(ANCHORING_DOMAIN);
        this.productService.getDeterministic(gtin, callback);
    }

    /**
     * @param {string} key
     * @param {*} obj
     * @param {function(err?, keySSI?, string?)} callback where the string is the mount path relative to the main DSU
     */
    create(key, obj, callback) {
        callback(`Traceability cannot be created`);
    }

    /**
     * @param {string|number} [key] the table key
     * @param {{}} obj
     * @param {function(err?, Stock?)} callback
     * @override
     */
    update(key, obj, callback){
        callback(`Traceability cannot be updated`);
    }

    /**
     * @param {IndividualProduct} obj
     * @param {function(err?, Node?, Node?)} callback
     * @override
     */
    getOne(obj,  callback) {
        let self = this;
        if (!(obj instanceof IndividualProduct))
            obj = new IndividualProduct(obj);

        const _err = self._validate(obj);
        if (_err)
            return callback(`Invalid Object Provided. ${_err}`);

        if (!obj.manufName)
            return self._getProduct(obj.gtin, (err, p) => {
                if (err)
                    return callback(err);
                obj.manufName = p.manufName;
                self.getOne(obj, callback);
            });

        const identity = self.getIdentity();
        if (identity.id === obj.manufName)
            return self._trackObj(identity.id, obj, callback);

        const message = new TrackMessage({
            id: identity.id + Date.now(),
            action: ACTION.REQUEST,
            message: obj,
            requesterId: identity.id
        });
        self.requestCache.submitRequest(message.id, callback);
        self.sendMessage(obj.manufName, message, self._messageCallback)
    }

    /**
     * Lists all registered items according to query options provided
     * @param {boolean} [readDSU] defaults to true. decides if the manager loads and reads from the dsu's {@link INFO_PATH} or not
     * @param {object} [options] query options. defaults to {@link DEFAULT_QUERY_OPTIONS}
     * @param {function(err?, object[]?)} callback
     * @override
     */
    getAll(readDSU, options, callback){
        callback(`Not the way tracking works`);
    }
}


/**
 * @param {ParticipantManager} participantManager
 * @param {function(err, Manager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @returns {TraceabilityManager}
 * @memberOf Managers
 */
const getTraceabilityManager = function (participantManager, callback) {
    let manager;
    try {
        manager = participantManager.getManager(TraceabilityManager);
        if (callback)
            return callback(undefined, manager);
    } catch (e){
        manager = new TraceabilityManager(participantManager, callback);
    }

    return manager;
}

module.exports = getTraceabilityManager;
},{"../../pdm-dsu-toolkit/managers/Manager":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/managers/Manager.js","../constants":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/constants.js","../model/IndividualProduct":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/IndividualProduct.js","../services/ProductService":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/services/ProductService.js","../services/TraceabilityService":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/services/TraceabilityService.js","./ReceiptManager":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/managers/ReceiptManager.js","./ShipmentLineManager":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/managers/ShipmentLineManager.js"}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/managers/index.js":[function(require,module,exports){
const { getIssuedShipmentManager } = require('./IssuedShipmentManager');
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
 * @namespace Managers
 */
module.exports = {
    Resolvers: require('./resolvers'),
    Manager: require('../../pdm-dsu-toolkit/managers/Manager'),
    getBatchManager: require('./BatchManager'),
    getIssuedOrderManager: require('./IssuedOrderManager'),
    getParticipantManager: require('./ParticipantManager'),
    getProductManager: require('./ProductManager'),
    getReceivedOrderManager: require('./ReceivedOrderManager'),
    getStockManager: require('./StockManager'),
    getSaleManager: require('./SaleManager'),
    getShipmentLineManager: require('./ShipmentLineManager'),
    getIssuedShipmentManager,
    getReceivedShipmentManager: require('./ReceivedShipmentManager'),
    getReceiptManager: require('./ReceiptManager'),
    getIndividualProductManager: require('./IndividualProductManager'),
    getDirectoryManager: require('./DirectoryManager'),
    getNotificationManager: require('./NotificationManager')
}
},{"../../pdm-dsu-toolkit/managers/Manager":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/managers/Manager.js","./BatchManager":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/managers/BatchManager.js","./DirectoryManager":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/managers/DirectoryManager.js","./IndividualProductManager":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/managers/IndividualProductManager.js","./IssuedOrderManager":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/managers/IssuedOrderManager.js","./IssuedShipmentManager":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/managers/IssuedShipmentManager.js","./NotificationManager":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/managers/NotificationManager.js","./ParticipantManager":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/managers/ParticipantManager.js","./ProductManager":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/managers/ProductManager.js","./ReceiptManager":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/managers/ReceiptManager.js","./ReceivedOrderManager":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/managers/ReceivedOrderManager.js","./ReceivedShipmentManager":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/managers/ReceivedShipmentManager.js","./SaleManager":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/managers/SaleManager.js","./ShipmentLineManager":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/managers/ShipmentLineManager.js","./StockManager":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/managers/StockManager.js","./resolvers":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/managers/resolvers/index.js"}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/managers/resolvers/BatchResolver.js":[function(require,module,exports){
const {ANCHORING_DOMAIN} = require('../../constants');
const Resolver  = require('../../../pdm-dsu-toolkit/managers').Resolver

/**
 * Resolver classes substitute Managers when they're not available to be resolve a
 * Const DSU and extract the updated Information when required
 * @class BatchResolver
 * @memberOf Resolvers
 * @extends Resolver
 */
class BatchResolver extends Resolver{
    constructor(participantManager){
        super(participantManager, new (require('../../services/BatchService'))(ANCHORING_DOMAIN));
    }
}

/**
 * @returns {BatchResolver} the batch resolver as a singleton
 * @memberOf Resolvers
 */
const getBatchResolver = function (participantManager, callback) {
    let resolver;
    try {
        resolver = participantManager.getManager(BatchResolver);
        if (callback)
            return callback(undefined, resolver);
    } catch (e){
        resolver = new BatchResolver(participantManager);
    }
    if (callback)
        return callback(undefined, resolver);

    return resolver;
}

module.exports = getBatchResolver;


},{"../../../pdm-dsu-toolkit/managers":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/managers/index.js","../../constants":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/constants.js","../../services/BatchService":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/services/BatchService.js"}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/managers/resolvers/ProductResolver.js":[function(require,module,exports){
const {ANCHORING_DOMAIN} = require('../../constants');
const Resolver  = require('../../../pdm-dsu-toolkit/managers').Resolver

/**
 * Resolver classes substitute Managers when they're not available to be resolve a
 * Const DSU and extract the updated Information when required
 * @memberOf Resolvers
 * @extends Resolver
 */
class ProductResolver extends Resolver{
    constructor(participantManager){
        super(participantManager, new (require('../../services/ProductService'))(ANCHORING_DOMAIN));
    }
}

/**
 * @returns {ProductResolver} as a singleton
 * @memberOf Resolvers
 */
const getProductResolver = function (participantManager, callback) {
    let resolver;
    try {
        resolver = participantManager.getManager(ProductResolver);
        if (callback)
            return callback(undefined, resolver);
    } catch (e){
        resolver = new ProductResolver(participantManager);
    }
    if (callback)
        return callback(undefined, resolver);

    return resolver;
}

module.exports = getProductResolver;


},{"../../../pdm-dsu-toolkit/managers":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/managers/index.js","../../constants":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/constants.js","../../services/ProductService":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/services/ProductService.js"}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/managers/resolvers/index.js":[function(require,module,exports){
/**
 * Provides a bridge between the Managers Namespace and the resolving of const DSUs
 * @namespace Resolvers
 */
module.exports = {
    getProductResolver: require('./ProductResolver'),
    getBatchResolver: require('./BatchResolver')
}
},{"./BatchResolver":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/managers/resolvers/BatchResolver.js","./ProductResolver":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/managers/resolvers/ProductResolver.js"}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/Batch.js":[function(require,module,exports){
const Utils = require("../../pdm-dsu-toolkit/model/Utils");
const BatchStatus = require('./BatchStatus');
const Status = require('./Status');
const IndividualProduct = require('./IndividualProduct');

/**
 * @prop {string} batchNumber
 * @prop {Date} expiryDate
 * @prop {string[]} serialNumbers
 * @prop {number} quantity
 * @prop {string} batchStatus {@link BatchStatus}
 * @class Batch
 * @memberOf Model
 */
class Batch {
    batchNumber;
    expiry = "";
    serialNumbers = [];
    quantity = 0;
    batchStatus

    /**
     * @param {Batch | {}} batch
     * @constructor
     */
    constructor(batch) {
        if (typeof batch !== undefined)
            for (let prop in batch)
                if(batch.hasOwnProperty(prop) && this.hasOwnProperty(prop))
                    this[prop] = batch[prop];

        if (!(this.expiry instanceof Date)) {
            if ((/^([0-9]{4})\/(0[1-9]|1[0-2])\/(0[1-9]|1[0-9]|2[0-9]|3[0-1])/.test(this.expiry))) { // check date format yyyy/MM/dd
                this.expiry = new Date(this.expiry.replace("/","-"));
            } else if (!(/^([0-9]{4})-(0[1-9]|1[0-2])-(0[1-9]|1[0-9]|2[0-9]|3[0-1])/.test(this.expiry))) // check date format yyyy-MM-dd
                this.expiry = '';
            else
                this.expiry = new Date(this.expiry);
        }

        if (!this.batchNumber)
            this.batchNumber = Utils.generateSerialNumber(6);

        if (this.serialNumbers && this.serialNumbers.length)
            if (Math.abs(this.quantity) !== this.serialNumbers.length)
                this.quantity = this.serialNumbers.length;

        this.batchStatus = this.batchStatus || BatchStatus.COMMISSIONED;
    }

    manage(delta, serialization = true){
        if (Array.isArray(delta))
            this.serialNumbers.push(...delta);
        if (delta === 0)
            return;
        if (delta > 0 && this.serialNumbers.length)
            if (serialization) {
                this.serialNumbers.push(...Array.from(Array(10), (_) => Utils.generateSerialNumber(12)));
                this.quantity = this.getQuantity();
                return;
            }
        if (serialization)
            return this.serialNumbers.splice(0, Math.abs(delta));
        this.quantity += delta;
    }

    getIndividualProduct(gtin, serial){
        const s = this.serialNumbers.find(s => {
            return (typeof s === 'string' && s === serial) || (typeof s === 'object' && s.serialNumber === serial)
        });

        return !s ? undefined : new IndividualProduct(typeof s === 'object' ? s : {
                gtin: gtin,
                batchNumber: this.batchNumber,
                serialNumber: s,
                status: this.batchStatus
            });
    }

    getQuantity(){
        return this.serialNumbers && this.serialNumbers.length
            ? this.serialNumbers.length
            : this.quantity;
    }

    generateViewModel() {
        return {label: this.batchNumber, value: this.batchNumber}
    }

    /**
     * Validate if everything seems ok with the properties of this object.
     * @param {string} [oldStatus] if oldStatus validation is available
     * @returns undefined if all ok. An array of errors if not all ok.
     */
    validate(oldStatus) {
        if (!this.batchNumber) {
            return 'Batch number is mandatory field';
        }
        if (!this.expiry || !(this.expiry instanceof Date)) {
            return  'Expiration date is null or a not valid format (yyyy-MM-dd)';
        }
        if(new Date().getTime() > this.expiry.getTime()) // expiry date must be greater than today
            return `Expiration date must be greater than ${(new Date()).toLocaleDateString("fr-CA")}`;

        if(this.serialNumbers.length > 0) {
            const serialNumbersQty = new Set(this.serialNumbers.map(n => `${n}`)).size;
            if (serialNumbersQty !== this.serialNumbers.length)
                return `Serial numbers must be unique and without duplicates`
        } else {
            return `Serial numbers must be an array and cannot be empty`;
        }

        if (oldStatus && Batch.getAllowedStatusUpdates(oldStatus).indexOf(this.batchStatus.status || this.batchStatus) === -1)
            return `Status update from ${oldStatus} to ${this.batchStatus.status || this.batchStatus} is not allowed`;

        return undefined;
    }

    /**
     * Generates the 2D Data Matrix code for a batch or a serial
     * @param gtin
     * @param [serialNumber]
     * @return {string}
     */
    generate2DMatrixCode(gtin, serialNumber){
        return Utils.generate2DMatrixCode(gtin, this.batchNumber, this.expiry, serialNumber);
    }

    addSerialNumbers(serials){
        throw new Error("Not implemented");
    }

    static getAllowedStatusUpdates(status){
        switch(status){
            case BatchStatus.COMMISSIONED:
                return [BatchStatus.QUARANTINED, BatchStatus.RECALL];
            case BatchStatus.QUARANTINED:
                return [BatchStatus.COMMISSIONED, BatchStatus.RECALL];
            default:
                return [];
        }
    }
}

module.exports = Batch;

},{"../../pdm-dsu-toolkit/model/Utils":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/model/Utils.js","./BatchStatus":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/BatchStatus.js","./IndividualProduct":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/IndividualProduct.js","./Status":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/Status.js"}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/BatchStatus.js":[function(require,module,exports){
/**
 * @enum BatchStatus
 * @memberOf Model
 */
const BatchStatus = {
    COMMISSIONED: "commissioned",
    QUARANTINED: 'quarantined',
    RECALL: "recall"
}

module.exports = BatchStatus;
},{}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/DirectoryEntry.js":[function(require,module,exports){

const Utils = require("../../pdm-dsu-toolkit/model/Utils");

/**
 * Role Enum
 * Defines tha various roles withing the directory (basically actor types and products)
 * @memberOf Model
 */
const ROLE = {
    MAH: 'mah',
    WHS: 'whs',
    PHA: 'pha',
    PRODUCT: 'product'
}

/**
 * @prop {string} batchNumber
 * @prop {Date} expiryDate
 * @class DirectoryEntry
 * @memberOf Model
 */
class DirectoryEntry {
    id;
    role;

    /**
     * @param {DirectoryEntry} entry
     * @constructor
     */
    constructor(entry) {
        if (typeof entry !== undefined)
            for (let prop in entry)
                if (entry.hasOwnProperty(prop) && this.hasOwnProperty(prop))
                    this[prop] = entry[prop];
    }
}

module.exports = {
    DirectoryEntry,
    ROLE
};

},{"../../pdm-dsu-toolkit/model/Utils":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/model/Utils.js"}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/IndividualProduct.js":[function(require,module,exports){
const IndividualProductStatus = require('./IndividualProductStatus');

/**
 * @class FinalProduct
 * @memberOf Model
 */
class IndividualProduct {
    name;
    gtin;
    batchNumber;
    serialNumber;
    manufName;
    expiry;
    status;

    /**
     *
     * @param {IndividualProduct | {any}} individualProduct
     * @constructor
     */
    constructor(individualProduct) {
        if (typeof individualProduct !== undefined)
            for (let prop in individualProduct)
                if (individualProduct.hasOwnProperty(prop) && this.hasOwnProperty(prop))
                    this[prop] = individualProduct[prop];

        if(typeof this.expiry === 'string'){

            this.expiry = new Date(this.expiry);

        }
        
        this.status = this.status || IndividualProductStatus.COMMISSIONED;
        
    }

    /**
     * Validate if everything seems ok with the properties of this object.
     * @param {string} [oldStatus] if oldStatus validation is available
     * @returns undefined if all ok. An arry of errors if not all ok.
     */
    validate(oldStatus) {
        const errors = [];
        if (!this.gtin)
            errors.push('GTIN is required.');

        if (!this.batchNumber)
            errors.push('Batch Number is required.');

        if (!this.serialNumber)
            errors.push('Serial Number is required.');

        if (!this.manufName)
            errors.push('Manufacturer Name is required');

        if (!this.status)
            errors.push('Status is required.');

        if (oldStatus && IndividualProduct.getAllowedStatusUpdates(oldStatus).indexOf(this.status) === -1)
            errors.push(`Status update from ${oldStatus} to ${this.status} is not allowed`);

        return errors.length === 0 ? undefined : errors;
    }

    static getAllowedStatusUpdates(status){
        switch(status){
            case IndividualProductStatus.COMMISSIONED:
                return [IndividualProductStatus.ADMINISTERED, IndividualProductStatus.DESTROYED, IndividualProductStatus.DISPENSED, IndividualProductStatus.RECALL]
            default:
                return [];
        }
    }
}

module.exports = IndividualProduct;
},{"./IndividualProductStatus":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/IndividualProductStatus.js"}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/IndividualProductStatus.js":[function(require,module,exports){
const BatchStatus = require('./BatchStatus')

/**
 * @enum IndividualProductStatus
 * @memberOf Model
 */
const IndividualProductStatus = {
    COMMISSIONED: BatchStatus.COMMISSIONED,
    RECALL: BatchStatus.RECALL,
    DISPENSED: "dispensed",
    ADMINISTERED: "administered",
    DESTROYED: "destroyed"
}

module.exports = IndividualProductStatus;
},{"./BatchStatus":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/BatchStatus.js"}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/IndividualReceipt.js":[function(require,module,exports){
const IndividualProduct = require('./IndividualProduct');

/**
 * @class IndividualProduct
 * @memberOf Model
 */
class IndividualReceipt extends IndividualProduct{

    sellerId;

    /**
     *
     * @param {IndividualReceipt | {any}} individualReceipt
     * @constructor
     */
    constructor(individualReceipt) {
       super(individualReceipt);
        if (typeof individualReceipt !== undefined)
            for (let prop in individualReceipt)
                if (individualReceipt.hasOwnProperty(prop) && this.hasOwnProperty(prop))
                    this[prop] = individualReceipt[prop];
    }
}

module.exports = IndividualReceipt;
},{"./IndividualProduct":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/IndividualProduct.js"}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/MAH.js":[function(require,module,exports){
const Participant = require('./Participant');

/**
 *
 * @class MAH
 * @extends Participant
 * @memberOf Model
 */
class MAH extends Participant{
    /**
     * @param {MAH} mah
     * @constructor
     */
    constructor(mah) {
        super(mah);
        if (typeof mah !== undefined)
            for (let prop in mah)
                if (mah.hasOwnProperty(prop))
                    this[prop] = mah[prop];
    }
}

module.exports = MAH;
},{"./Participant":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/Participant.js"}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/Notification.js":[function(require,module,exports){

/**
 * @prop {string} senderId
 * @prop {string} subject
 * @prop {{}} body
 * @class Notification
 * @memberOf Model
 */
class Notification {
    senderId;
    subject;
    body;

    /**
     * @param {Notification | {}} notification
     * @constructor
     */
    constructor(notification) {
        if (typeof notification !== undefined)
            for (let prop in notification)
                if (notification.hasOwnProperty(prop) && this.hasOwnProperty(prop))
                    this[prop] = notification[prop];
    }

    validate() {
        if (!this.senderId) {
            return 'sender Id is mandatory';
        }
        if (!this.subject) {
            return 'subject is mandatory field';
        }
        if (!this.body) {
            return  'body is a mandatory field.';
        }
        return undefined;
    }
}

module.exports = Notification;

},{}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/Order.js":[function(require,module,exports){
const OrderStatus = require('./OrderStatus');
const OrderLine = require('./OrderLine');
const Status = require('./Status');
const ShipmentStatus = require("./ShipmentStatus");

/**
 * @class Order
 * @memberOf Model
 */
class Order {
    orderId;
    requesterId;
    senderId;
    shipToAddress;
    status;
    orderLines;
    shipmentId;

    /**
     * @param orderId
     * @param requesterId
     * @param senderId
     * @param shipToAddress
     * @param status
     * @param orderLines
     * @constructor
     */
    constructor(orderId, requesterId, senderId, shipToAddress, status, orderLines) {
        this.orderId = orderId || (new Date()).getTime();
        this.requesterId = requesterId;
        this.senderId = senderId;
        this.shipToAddress = shipToAddress;
        this.status = status || OrderStatus.CREATED;
        this.orderLines = orderLines ? orderLines.map(sl => new OrderLine(sl.gtin, sl.quantity, sl.requesterId, sl.senderId, this.status)) : [];
    }

    /**
     * Validate if everything seems ok with the properties of this object.
     * @param {string} [oldStatus] if oldStatus validation is available
     * @returns undefined if all ok. An arry of errors if not all ok.
     */
    validate(oldStatus) {
        const errors = [];
        if (!this.orderId) {
            errors.push('OrderID is required.');
        }
        if (!this.requesterId) {
            errors.push('Ordering partner ID is required.');
        }
        if (!this.senderId) {
            errors.push('Supplying partner ID is required.');
        }
        if (!this.shipToAddress) {
            errors.push('ShipToAddress is required.');
        }
        if (!this.status) {
            errors.push('status is required.');
        }
        if (!this.orderLines || !this.orderLines.length) {
            errors.push('orderLines is required.');
        } else {
            this.orderLines.forEach((orderLine,orderLineIndex) => {
                let orderLineErrors = orderLine.validate();
                if (orderLineErrors) {
                    orderLineErrors.forEach((error) => {
                        errors.push("Order Line "+orderLineIndex+": "+error);
                    });
                }
            });
        }

        if (oldStatus && Order.getAllowedStatusUpdates(oldStatus).indexOf(this.status.status || this.status) === -1)
            errors.push(`Status update from ${oldStatus} to ${this.status.status || this.status} is not allowed`);

        return errors.length === 0 ? undefined : errors;
    }

    static getAllowedStatusUpdates(status){
        switch(status){
            case OrderStatus.CREATED:
                return [OrderStatus.ACKNOWLEDGED,OrderStatus.REJECTED, OrderStatus.ON_HOLD, OrderStatus.PICKUP]
            case OrderStatus.ACKNOWLEDGED:
                return [OrderStatus.REJECTED, OrderStatus.ON_HOLD, OrderStatus.PICKUP]
            case OrderStatus.ON_HOLD:
                return [OrderStatus.PICKUP, OrderStatus.REJECTED]
            case OrderStatus.PICKUP:
                return [OrderStatus.ON_HOLD, OrderStatus.REJECTED, OrderStatus.TRANSIT]
            case OrderStatus.TRANSIT:
                return [OrderStatus.REJECTED, OrderStatus.ON_HOLD, OrderStatus.DELIVERED]
            case OrderStatus.DELIVERED:
                return [OrderStatus.RECEIVED, OrderStatus.REJECTED]
            case OrderStatus.RECEIVED:
                return [OrderStatus.CONFIRMED, OrderStatus.REJECTED]
            default:
                return [];
        }
    }

    static getAllowedStatusUpdateFromShipment(status){
        switch(status){
            case OrderStatus.DELIVERED:
                return [OrderStatus.RECEIVED, OrderStatus.REJECTED]
            case OrderStatus.RECEIVED:
                return [OrderStatus.CONFIRMED, OrderStatus.REJECTED]
            default:
                return [];
        }
    }
}

module.exports = Order;

},{"./OrderLine":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/OrderLine.js","./OrderStatus":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/OrderStatus.js","./ShipmentStatus":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/ShipmentStatus.js","./Status":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/Status.js"}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/OrderLine.js":[function(require,module,exports){
const OrderStatus = require('./OrderStatus');

/**
 * @class OrderLine
 * @memberOf Model
 */
class OrderLine{
    gtin;
    quantity;
    requesterId;
    senderId;
    status;

    /**
     * @param gtin
     * @param quantity
     * @param requesterId
     * @param senderId
     * @param status
     * @constructor
     */
    constructor(gtin, quantity, requesterId, senderId, status){
        this.gtin = gtin;
        this.quantity = quantity;
        this.requesterId = requesterId;
        this.senderId = senderId;
        this.status = status;
    }

    /**
     * Validate if everything seems ok with the properties of this object.
     * @returns undefined if all ok. An arry of errors if not all ok.
     */
    validate() {
        const errors = [];
        if (!this.gtin) {
            errors.push('gtin is required.');
        }
        if (!this.quantity) {
            errors.push('quantity is required.');
        } else if (this.quantity < 0) { // TODO accept zero quantity ?
            errors.push('quantity cannot be negative.');
        }
        if (!this.requesterId) {
            errors.push('requesterId is required.');
        }
        if (!this.senderId) {
            errors.push('senderId is required.');
        }

        return errors.length === 0 ? undefined : errors;
    }
}

module.exports = OrderLine;

},{"./OrderStatus":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/OrderStatus.js"}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/OrderStatus.js":[function(require,module,exports){
/**
 * @enum OrderStatus
 * @memberOf Model
 */
const OrderStatus = {
    CREATED: "created",
    REJECTED: 'rejected',
    ON_HOLD: "hold",
    ACKNOWLEDGED: "acknowledged",
    PICKUP: "pickup",
    TRANSIT: "transit",
    DELIVERED: "delivered",
    RECEIVED: "received",
    CONFIRMED: "confirmed"
}

module.exports = OrderStatus;
},{}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/Participant.js":[function(require,module,exports){

const { Validatable } = require('../../pdm-dsu-toolkit/model/Validations');

/**
 * Base class for Actors in this use case. Definies the basic necessary public info
 * for each actor
 * @class Participant
 * @memberOf Model
 */
class Participant extends Validatable{
    id = "";
    name = "";
    email = "";
    tin = "";
    address = "";

    /**
     * @param participant
     * @constructor
     */
    constructor(participant){
        super();
        console.log("participant:" + participant);
        this._copyProps(participant);
    }

    _copyProps(participant){
        if (typeof participant !== undefined)
            for (let prop in participant)
                if (participant.hasOwnProperty(prop) && this.hasOwnProperty(prop))
                    this[prop] = participant[prop];
    }

    validate() {
        const errors = [];
        if (!this.id)
            errors.push('id is required');
        if (!this.name)
            errors.push('Name is required.');
        if (!this.email)
            errors.push('email is required');
        if (!this.tin)
            errors.push('nif is required');

        return errors.length === 0 ? true : errors;
    }

    generateViewModel() {
        return {label: this.name, value: this.id}
    }
}

module.exports = Participant;
},{"../../pdm-dsu-toolkit/model/Validations":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/model/Validations.js"}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/Pharmacy.js":[function(require,module,exports){

const Participant = require('./Participant');

/**
 * @class Pharmacy
 * @extends Participant
 * @memberOf Model
 */
class Pharmacy extends Participant{
    deliveryAddress = "";

    /**
     * @param pharmacy
     * @constructor
     */
    constructor(pharmacy) {
        super(pharmacy);
        if (typeof pharmacy !== undefined)
            for (let prop in pharmacy)
                if (pharmacy.hasOwnProperty(prop) && this.hasOwnProperty(prop))
                    this[prop] = pharmacy[prop];
    }

}

module.exports = Pharmacy;
},{"./Participant":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/Participant.js"}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/Product.js":[function(require,module,exports){
const ModelUtils = require('../model/utils');

/**
 * @class Product
 * @memberOf Model
 */
class Product {
    name = "";
    gtin = "";
    description = "";
    manufName = "";

    /**
     *
     * @param product
     * @constructor
     */
    constructor(product) {
        if (typeof product !== undefined)
            for (let prop in product)
                if (product.hasOwnProperty(prop) && this.hasOwnProperty(prop))
                    this[prop] = product[prop];
    }

    /**
     * Validate if everything seems ok with the properties of this object.
     * @returns undefined if all ok. An array of errors if not all ok.
     */
    validate() {
        const errors = [];
        if (!this.name) {
            errors.push('Name is required.');
        }

        if (!this.gtin) {
            errors.push('GTIN is required.');
        }

        if (!ModelUtils.validateGtin(this.gtin))
            errors.push('Gtin is invalid');

        return errors.length === 0 ? undefined : errors;
    }
}

module.exports = Product;
},{"../model/utils":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/utils.js"}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/Receipt.js":[function(require,module,exports){
const Sale = require('./Sale');
const IndividualReceipt = require('./IndividualReceipt');

/**
 * @class Receipt
 * @memberOf Model
 */
class Receipt extends Sale{
    /**
     * @param {Receipt | {}} receipt
     * @constructor
     */
    constructor(receipt) {
        super(receipt);

        if (this.productList)
            this.productList = this.productList.map(p => {
                return new IndividualReceipt(Object.assign(p, {sellerId: this.sellerId}));
            });
    }
}

module.exports = Receipt;

},{"./IndividualReceipt":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/IndividualReceipt.js","./Sale":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/Sale.js"}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/Sale.js":[function(require,module,exports){
const IndividualProduct = require('./IndividualProduct');

/**
 * @prop {IndividualProducts[]} products
 * @class Sale
 * @memberOf Model
 */
class Sale {
    id = undefined;
    sellerId = undefined;
    productList = [];

    /**
     * @param {Sale | {}} sale
     * @constructor
     */
    constructor(sale) {
        if (typeof sale !== undefined)
            for (let prop in sale)
                if (sale.hasOwnProperty(prop) && this.hasOwnProperty(prop))
                    this[prop] = sale[prop];

        if (!this.id)
            this.id = `${Date.now()}`;

        if (this.productList)
            this.productList = this.productList.map(p => new IndividualProduct(p));
    }

    validate(isSingle = false) {
        const errors = [];
        if (!this.id)
            errors.push("Missing id.");

        if (!this.productList || !this.productList.length) {
            errors.push('No products on productList.');
        } else {
            this.productList.forEach((individualProduct, index) => {
                let err = individualProduct.validate();
                if (err) {
                    errors.push(`Product ${index + 1} errors: [${err.join(' ')}].`);
                }
            });
        }

        if (isSingle && !this.getSingleManufName())
            errors.push("All product must belong to the same manufacturer.");
        return errors.join(' ');
    }

    getSingleManufName(){
        const manufs = new Set(this.productList.map(p => p.manufName));
        if (manufs.size !== 1)
            return;
        return [...manufs][0];
    }
}

module.exports = Sale;

},{"./IndividualProduct":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/IndividualProduct.js"}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/Shipment.js":[function(require,module,exports){
const ShipmentStatus = require('./ShipmentStatus');
const ShipmentLine = require('./ShipmentLine');
const Status = require('./Status');
const OrderStatus = require("./OrderStatus");


/**
 * @class Shipment
 * @memberOf Model
 */
class Shipment {
    shipmentId;
    requesterId;
    senderId;
    shipToAddress;
    shipFromAddress;
    status;
    shipmentLines;
    code;

    /**
     *
     * @param shipmentId
     * @param requesterId
     * @param senderId
     * @param shipToAddress
     * @param status
     * @param shipmentLines
     * @constructor
     */
    constructor(shipmentId, requesterId, senderId, shipToAddress, status, shipmentLines){
        this.shipmentId = shipmentId;
        this.requesterId = requesterId;
        this.senderId = senderId;
        this.shipToAddress = shipToAddress;
        this.status = status || ShipmentStatus.CREATED;
        this.shipmentLines = shipmentLines ? shipmentLines.map(sl => new ShipmentLine(sl)) : [];
    }

    /**
     * Validate if everything seems ok with the properties of this object.
     * @param {string} [oldStatus] if oldStatus validation is available
     * @returns undefined if all ok. An arry of errors if not all ok.
     */
    validate(oldStatus) {
        const errors = [];
        if (!this.shipmentId) {
            errors.push('ShipmentID is required.');
        }
        if (!this.requesterId) {
            errors.push('Ordering partner ID is required.');
        }
        if (!this.senderId) {
            errors.push('Supplying partner ID is required.');
        }
        if (!this.shipToAddress) {
            errors.push('ShipToAddress is required.');
        }
        if (!this.status) {
            errors.push('status is required.');
        }
        if (!this.shipmentLines || !this.shipmentLines.length) {
            errors.push('shipmentLines is required.');
        } else {
            this.shipmentLines.forEach((shipmentLine, index) => {
                let orderLineErrors = shipmentLine.validate();
                if (orderLineErrors) {
                    orderLineErrors.forEach((error) => {
                        errors.push("Shipment Line " + index + ": " + error);
                    });
                }
            });
        }

        if (oldStatus && Shipment.getAllowedStatusUpdates(oldStatus).indexOf(this.status.status || this.status) === -1)
            errors.push(`Status update from ${oldStatus} to ${this.status.status || this.status} is not allowed`);

        return errors.length === 0 ? undefined : errors;
    }

    static getAllowedStatusUpdates(status){
        switch(status){
            case ShipmentStatus.CREATED:
                return [ShipmentStatus.REJECTED, ShipmentStatus.ON_HOLD, ShipmentStatus.PICKUP]
            case ShipmentStatus.ON_HOLD:
                return [ShipmentStatus.PICKUP, ShipmentStatus.REJECTED]
            case ShipmentStatus.PICKUP:
                return [ShipmentStatus.ON_HOLD, ShipmentStatus.REJECTED, ShipmentStatus.TRANSIT]
            case ShipmentStatus.TRANSIT:
                return [ShipmentStatus.REJECTED, ShipmentStatus.ON_HOLD, ShipmentStatus.DELIVERED]
            case ShipmentStatus.DELIVERED:
                return [ShipmentStatus.REJECTED, ShipmentStatus.RECEIVED]
            case ShipmentStatus.RECEIVED:
                return [ShipmentStatus.CONFIRMED]
            default:
                return [];
        }
    }

    static getAllowedStatusUpdateFromOrder(status) {
        switch(status){
            case ShipmentStatus.CREATED:
                return [ShipmentStatus.REJECTED, ShipmentStatus.ON_HOLD, ShipmentStatus.PICKUP]
            case ShipmentStatus.ON_HOLD:
                return [ShipmentStatus.PICKUP, ShipmentStatus.REJECTED]
            case ShipmentStatus.PICKUP:
                return [ShipmentStatus.ON_HOLD, ShipmentStatus.REJECTED, ShipmentStatus.TRANSIT]
            case ShipmentStatus.TRANSIT:
                return [ShipmentStatus.REJECTED, ShipmentStatus.ON_HOLD, ShipmentStatus.DELIVERED]
            default:
                return [];
        }
    }
}

module.exports = Shipment;

},{"./OrderStatus":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/OrderStatus.js","./ShipmentLine":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/ShipmentLine.js","./ShipmentStatus":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/ShipmentStatus.js","./Status":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/Status.js"}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/ShipmentCode.js":[function(require,module,exports){

const TrackingCode = require("./TrackingCode");

/**
 * This is a particular Model class, where all its properties represent
 * the mount parts in the dsu where the property value
 * (the keySSI) will be mounted
 *
 * @class ShipmentCode
 * @extends TrackingCode
 * @memberOf Model
 */
class ShipmentCode extends TrackingCode {
    /**
     * the {@link ShipmentStatus}
     * Only the outer ShipmentCode has Status
     * @type {string | undefined}
     */
    status;

    /**
     *
     * @param shipmentCode
     * @constructor
     */
    constructor(shipmentCode) {
        super(shipmentCode);
        if (typeof shipmentCode !== undefined)
            for (let prop in shipmentCode)
                if (shipmentCode.hasOwnProperty(prop) && this.hasOwnProperty(prop))
                    this[prop] = shipmentCode[prop];
    }

    /**
     * Validate if everything seems ok with the properties of this object.
     * @returns undefined if all ok. An array of errors if not all ok.
     */
    validate() {
        const errors = super.validate() || [];
        if (!this.status)
            errors.push('no status provided');

        return errors.length === 0 ? undefined : errors;
    }
}

module.exports = ShipmentCode;

},{"./TrackingCode":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/TrackingCode.js"}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/ShipmentLine.js":[function(require,module,exports){
const ShipmentLineStatus = require('./ShipmentLineStatus');

/**
 * @class ShipmentLine
 * @memberOf Model
 */
class ShipmentLine{
    gtin;
    batch;
    quantity;
    serialNumbers;
    senderId;
    requesterId;
    status;
    createdOn

    /**
     *
     * @param line
     * @constructor
     */
    constructor(line) {
        if (typeof line !== undefined)
            for (let prop in line)
                if (line.hasOwnProperty(prop) && this.hasOwnProperty(prop))
                    this[prop] = line[prop];

        if (this.serialNumbers && this.serialNumbers.length)
            if (this.quantity !== this.serialNumbers.length)
                this.quantity = this.serialNumbers.length;

            if (!this.createdOn)
                this.createdOn = Date.now();
    }

    getQuantity(){
        return this.serialNumbers && this.serialNumbers.length
            ? this.serialNumbers.length
            : this.quantity;
    }

    /**
     * Validate if everything seems ok with the properties of this object.
     * @returns undefined if all ok. An array of errors if not all ok.
     */
    validate() {
        const errors = [];
        if (!this.gtin)
            errors.push('gtin is required.');

        if (!this.requesterId && [ShipmentLineStatus.DISPENSED, ShipmentLineStatus.ADMINISTERED].indexOf(this.status) === -1)
            errors.push('Ordering partner ID is required.');

        if (!this.senderId)
            errors.push('Supplying partner ID is required.');

        if (!this.batch)
            errors.push('batch is required.');

        if (!this.status)
            errors.push('status is required.');

        if(this.quantity <= 0 || !Number.isInteger(this.quantity))
            errors.push('quantity must be a integer positive number');

        return errors.length === 0 ? undefined : errors;
    }
}

module.exports = ShipmentLine;

},{"./ShipmentLineStatus":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/ShipmentLineStatus.js"}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/ShipmentLineStatus.js":[function(require,module,exports){

const ShipmentStatus = require('./ShipmentStatus');
const IndividualProductStatus = require('./IndividualProductStatus');
/**
 * @enum ShipmentLineStatus
 * @memberOf Model
 */
const ShipmentLineStatus = {
    CREATED: ShipmentStatus.CREATED,
    REJECTED: ShipmentStatus.REJECTED,
    ON_HOLD: ShipmentStatus.ON_HOLD,
    ACKNOWLEDGED: ShipmentStatus.ACKNOWLEDGED,
    PICKUP: ShipmentStatus.PICKUP,
    TRANSIT: ShipmentStatus.TRANSIT,
    DELIVERED: ShipmentStatus.DELIVERED,
    RECEIVED: ShipmentStatus.RECEIVED,
    CONFIRMED: ShipmentStatus.CONFIRMED,


    COMMISSIONED: IndividualProductStatus.COMMISSIONED,
    RECALL: IndividualProductStatus.RECALL,
    DISPENSED: IndividualProductStatus.DISPENSED,
    ADMINISTERED: IndividualProductStatus.ADMINISTERED,
    DESTROYED: IndividualProductStatus.DESTROYED
}

module.exports = ShipmentLineStatus;
},{"./IndividualProductStatus":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/IndividualProductStatus.js","./ShipmentStatus":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/ShipmentStatus.js"}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/ShipmentStatus.js":[function(require,module,exports){

const OrderStatus = require('./OrderStatus');
/**
 * @enum ShipmentStatus
 * @memberOf Model
 */
const ShipmentStatus = {
    CREATED: OrderStatus.CREATED,
    REJECTED: OrderStatus.REJECTED,
    ON_HOLD: OrderStatus.ON_HOLD,
    ACKNOWLEDGED: OrderStatus.ACKNOWLEDGED,
    PICKUP: OrderStatus.PICKUP,
    TRANSIT: OrderStatus.TRANSIT,
    DELIVERED: OrderStatus.DELIVERED,
    RECEIVED: OrderStatus.RECEIVED,
    CONFIRMED: OrderStatus.CONFIRMED
}

module.exports = ShipmentStatus;
},{"./OrderStatus":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/OrderStatus.js"}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/Status.js":[function(require,module,exports){
const OrderStatus = require('./OrderStatus');
const BatchStatus = require('./BatchStatus');
const ShipmentStatus = require('./ShipmentStatus');

const validateStatus = function(status){
    const isInStatusObj = function(statusObj){
        return Object.values(statusObj).indexOf(status) !== -1;
    }
   return ![OrderStatus, ShipmentStatus, BatchStatus].every(statusObj => !isInStatusObj(statusObj));
}


/**
 * @prop {string} status on of {@link BatchStatus}/{@link ShipmentStatus}/{@link BatchStatus}
 * @prop {string[]} log
 * @prop {{}} extraInfo object where the keys are a Status, and the values are the info message
 * @class Status
 * @memberOf Model
 */
class Status {
    status;
    log = [];
    extraInfo;

    /**
     * @param {Status | {}} status
     * @constructor
     */
    constructor(status) {
        if (typeof status !== undefined)
            for (let prop in status)
                if (status.hasOwnProperty(prop) && this.hasOwnProperty(prop))
                    this[prop] = status[prop];
    }

    validate() {
        if (this.status)
            return 'Status is mandatory field';

        if (!this.log.length)
            return  'No log information available';

        if(!validateStatus(this.status))
            return 'Status is Invalid';

        if (this.extraInfo)
            if (!Object.keys(this.extraInfo).every(k => !validateStatus(k)))
                return "invalid information entries"

        return undefined;
    }
}

module.exports = Status;

},{"./BatchStatus":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/BatchStatus.js","./OrderStatus":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/OrderStatus.js","./ShipmentStatus":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/ShipmentStatus.js"}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/Stock.js":[function(require,module,exports){
const Product = require('./Product');
const Batch = require('./Batch');
const StockStatus = require('./StockStatus');

/**
 * @class Stock
 * @extends Product
 * @memberOf Model
 */
class Stock extends Product{
    batches = [];
    status = undefined;

    /**
     *
     * @param stock
     * @constructor
     */
    constructor(stock) {
        super(stock)
        if (typeof stock !== undefined)
            for (let prop in stock)
                if (stock.hasOwnProperty(prop) && this.hasOwnProperty(prop))
                    this[prop] = stock[prop];
        this.status = this.status || StockStatus.AVAILABLE;
        this.batches = this.batches.map(b => new Batch(b));
    }

    getQuantity(){
        return this.batches.reduce((sum, b) => sum + b.getQuantity(), 0);
    }

    /**
     * Validate if everything seems ok with the properties of this object.
     * @returns undefined if all ok. An array of errors if not all ok.
     */
    validate() {
        return super.validate();
    }
}

module.exports = Stock;
},{"./Batch":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/Batch.js","./Product":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/Product.js","./StockStatus":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/StockStatus.js"}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/StockStatus.js":[function(require,module,exports){
/**
 * @memberOf Model
 */
const StockStatus = {
    RESERVED: "reserved",
    TRANSIT: "transit",
    AVAILABLE: "available"
}

module.exports = StockStatus;
},{}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/TrackingCode.js":[function(require,module,exports){
/**
 * This is a particular Model class, where all its properties represent
 * the mount parts in the dsu where the property value
 * (the keySSI) will be mounted
 *
 * @class TrackingCode
 * @memberOf Model
 */
class TrackingCode{
    /**
     * The reference (KeySSI) to the other {@link TrackingCode}s inside
     * @type string[] | TrackingCode[] | undefined
     */
    codes;
    /**
     * The reference (KeySSI) to the other {@link ShipmentLine}s inside
     * @type string[] | ShipmentLine[] | undefined
     */
    lines;

    /**
     * For transformations later on
     * The reference (KeySSI) to the previous {@link TrackingCode}
     * @type string | undefined
     */
    previous;
    /**
     * For transformations later on
     * The reference (KeySSI) to the next {@link TrackingCode}
     * @type string | undefined
     */
    next;

    /**
     *
     * @param code
     * @constructor
     */
    constructor(code) {
        if (typeof code !== undefined)
            for (let prop in code)
                if (code.hasOwnProperty(prop) && this.hasOwnProperty(prop))
                    this[prop] = code[prop];
    }

    /**
     * Validate if everything seems ok with the properties of this object.
     * @returns undefined if all ok. An array of errors if not all ok.
     */
    validate() {
        const errors = [];
        if ((!this.codes || !this.codes.length) && (!this.lines || !this.lines.length))
            errors.push('no content provided');

        return errors.length === 0 ? undefined : errors;
    }
}

module.exports = TrackingCode;

},{}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/Wholesaler.js":[function(require,module,exports){
const Participant = require('./Participant');

/**
 * @class Wholesaler
 * @extends Participant
 * @memberOf Model
 */
class Wholesaler extends Participant{
    originAddress = "";
    deliveryAddress = "";

    /**
     *
     * @param wholesaler
     * @constructor
     */
    constructor(wholesaler) {
        super(wholesaler);
        if (typeof wholesaler !== undefined)
            for (let prop in wholesaler)
                if (wholesaler.hasOwnProperty(prop) && this.hasOwnProperty(prop))
                    this[prop] = wholesaler[prop];
    }
}

module.exports = Wholesaler;
},{"./Participant":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/Participant.js"}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/index.js":[function(require,module,exports){
/**
 * Definition of Model Objects
 * @namespace Model
 */
module.exports = {
    Order: require('./Order'),
    OrderStatus: require('./OrderStatus'),
    OrderLine: require('./OrderLine'),
    Shipment: require('./Shipment'),
    ShipmentStatus: require('./ShipmentStatus'),
    ShipmentLine: require('./ShipmentLine'),
    Participant: require('./Participant'),
    Product: require('./Product'),
    Batch: require('./Batch'),
    BatchStatus: require("./BatchStatus"),
    MAH: require('./MAH'),
    Pharmacy: require('./Pharmacy'),
    Wholesaler: require('./Wholesaler'),
    Validations: require('../../pdm-dsu-toolkit/model/Validations'),
    Utils: require('../../pdm-dsu-toolkit/model/Utils'),
    Sale: require('./Sale'),
    Stock: require('./Stock'),
    StockStatus: require('./StockStatus'),
    DirectoryEntry: require('./DirectoryEntry').DirectoryEntry,
    ROLE: require('./DirectoryEntry').ROLE,
    Receipt: require('./Receipt'),
    ShipmentCode: require('./ShipmentCode'),
    Status: require('./Status'),
    TrackingCode: require('./TrackingCode'),
    IndividualProduct: require('./IndividualProduct'),
    IndividualProductStatus: require('./IndividualProductStatus'),
    Notification: require('./Notification'),
    utils: require('./utils')
}

},{"../../pdm-dsu-toolkit/model/Utils":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/model/Utils.js","../../pdm-dsu-toolkit/model/Validations":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/model/Validations.js","./Batch":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/Batch.js","./BatchStatus":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/BatchStatus.js","./DirectoryEntry":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/DirectoryEntry.js","./IndividualProduct":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/IndividualProduct.js","./IndividualProductStatus":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/IndividualProductStatus.js","./MAH":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/MAH.js","./Notification":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/Notification.js","./Order":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/Order.js","./OrderLine":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/OrderLine.js","./OrderStatus":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/OrderStatus.js","./Participant":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/Participant.js","./Pharmacy":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/Pharmacy.js","./Product":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/Product.js","./Receipt":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/Receipt.js","./Sale":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/Sale.js","./Shipment":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/Shipment.js","./ShipmentCode":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/ShipmentCode.js","./ShipmentLine":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/ShipmentLine.js","./ShipmentStatus":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/ShipmentStatus.js","./Status":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/Status.js","./Stock":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/Stock.js","./StockStatus":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/StockStatus.js","./TrackingCode":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/TrackingCode.js","./Wholesaler":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/Wholesaler.js","./utils":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/utils.js"}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/utils.js":[function(require,module,exports){
const {isEqual, generateGtin, genDate, generateProductName, generateBatchNumber, generateRandomInt, validateGtin, calculateGtinCheckSum, generate2DMatrixCode, getRandom} = require('../../pdm-dsu-toolkit/model/Utils');
const ShipmentLine = require('./ShipmentLine');
const Shipment = require('./Shipment');
const Batch = require('./Batch');
const ROLE = require('./DirectoryEntry').ROLE;

/**
 * Confirms the existence os the selected batches for each shipmentLine and returns the appropriate object
 * for {@link StockManager#manage} method
 * @param {StockManager} stockManager
 * @param {Shipment} shipment
 * @param {{}} stockObj
 * @param {function(err, batches?)} callback
 */
const confirmWithStock = function(stockManager, shipment, stockObj, callback){

    const stockIterator = function(stocksCopy, result, callback){
        const stockObj = stocksCopy.shift();
        if (!stockObj)
            return callback(undefined, result);

        const {orderLine, stock} = stockObj;
        const {batches} = stock;
        let {gtin, quantity} = orderLine;

        stockManager.getOne(gtin, true, (err, currentStock) => {
            if (err)
                return callback(`No stock found for product ${gtin}`);
            const currentBatches = currentStock.batches;

            let errorMessage = undefined;

            if (!batches.every(b => {
                if (!quantity)
                    return true;
                const current = currentBatches.find(cb => cb.batchNumber === b.batchNumber);
                if (!current){
                    errorMessage = `Batch ${b.batchNumber} not found in stock for product ${gtin}`;
                    return false;
                }
                result = result || {};
                result[gtin] = result[gtin] || [];

                const resultBatch = new Batch(b);
                if (stockManager.serialization){
                    resultBatch.serialNumbers = resultBatch.serialNumbers.splice(0, Math.min(quantity, b.getQuantity()));
                    resultBatch.quantity = resultBatch.serialNumbers.length === 0 ? Math.min(quantity, b.getQuantity()) : resultBatch.getQuantity();    
                } else {
                    resultBatch.serialNumbers = undefined;
                    resultBatch.quantity = Math.min(quantity, b.getQuantity());
                }

                result[gtin].push(resultBatch);
                quantity -= resultBatch.getQuantity();
                return true;
            })){
                return callback(errorMessage);
            }

            const resultQuantity = result[gtin].reduce((accum, b) => {
                accum += b.getQuantity();
                return accum;
            }, 0);

            if (resultQuantity < quantity)
                return callback(`Not enough stock for orderline of ${quantity} of product ${gtin}`);

            stockIterator(stocksCopy, result, callback);
        });
    }

    stockIterator(stockObj.slice(), undefined, (err, result) => {
        if (err || !result)
            return callback(err ? err : `Could not retrieve batches from stock`);
        const self = this;
        shipment.shipmentLines = shipment.shipmentLines.reduce((accum,s) => {
            result[s.gtin].forEach(b => {
                accum.push(new ShipmentLine({
                    gtin: s.gtin,
                    batch: b.batchNumber,
                    quantity: b.getQuantity(),
                    serialNumbers: self.serialization && self.aggregation ? b.serialNumbers : undefined,
                    senderId: shipment.senderId,
                    requesterId: shipment.requesterId,
                    status: shipment.status
                }))
            });
            return accum;
        }, [])

        callback(undefined, shipment);
    })
}

/**
 * Retrieves all the products from the provided directory manager
 * @param {DirectoryManager} directoryManager
 * @param {function(err, string[])} callback
 * @memberOf PopOver
 */
function getDirectoryProducts(directoryManager, callback){
    const options = {
        query: [`role == ${ROLE.PRODUCT}`]
    }
    directoryManager.getAll(false, options, (err, gtins) => err
        ? callback(err)
        : callback(undefined, gtins));
}

/**
 * Retrieves all the suppliers from the provided directory manager
 * @param {DirectoryManager} directoryManager
 * @param {function(err, string[])} callback
 * @memberOf PopOver
 */
function getDirectorySuppliers(directoryManager, callback){
    const options = {
        query: [`role like /${ROLE.MAH}|${ROLE.WHS}/g`]
    }

    directoryManager.getAll(false, options, (err, suppliers) => err
        ? callback(err)
        : callback(undefined, suppliers));
}

/**
 * Retrieves all the requesters from the provided directory manager
 * @param {DirectoryManager} directoryManager
 * @param {function(err, string[])} callback
 * @memberOf PopOver
 */
function getDirectoryRequesters(directoryManager, callback){
    const options = {
        query: [`role like /${ROLE.PHA}|${ROLE.WHS}/g`]
    }

    directoryManager.getAll(false, options, (err, requesters) => err
        ? callback(err)
        : callback(undefined, requesters));
}

function sortBatchesByExpiration(batches){
    return batches.sort((b1, b2) => {
        const date1 = new Date(b1.expiry).getTime();
        const date2 = new Date(b2.expiry).getTime();
        return date1 - date2;
    });
}

function splitStockByQuantity(batches, requiredQuantity){
    let accum = 0;
    const result = {
        selected: [],
        divided: undefined,
        remaining: []
    };
    batches.forEach(batch => {
        if (accum >= requiredQuantity){
            result.remaining.push(batch);
        } else if (accum + batch.quantity > requiredQuantity) {
            const batch1 = new Batch(batch);
            const batch2 = new Batch(batch);
            batch1.quantity = requiredQuantity - accum;
            batch2.quantity = batch.quantity - batch1.quantity;
            result.selected.push(batch1);
            result.divided = batch2
        } else if(accum + batch.quantity === requiredQuantity){
            result.selected.push(batch)
        } else {
            result.selected.push(batch);
        }
        accum += batch.quantity;
    });

    return result;
}

module.exports ={
    getRandom,
    generate2DMatrixCode,
    generateProductName,
    generateGtin,
    validateGtin,
    calculateGtinCheckSum,
    generateBatchNumber,
    generateRandomInt,
    genDate,
    confirmWithStock,
    getDirectorySuppliers,
    getDirectoryRequesters,
    getDirectoryProducts,
    sortBatchesByExpiration,
    splitStockByQuantity,
    isEqual
}
},{"../../pdm-dsu-toolkit/model/Utils":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/model/Utils.js","./Batch":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/Batch.js","./DirectoryEntry":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/DirectoryEntry.js","./Shipment":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/Shipment.js","./ShipmentLine":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/ShipmentLine.js"}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/services/BatchService.js":[function(require,module,exports){
const utils = require('../../pdm-dsu-toolkit/services/utils');
const ModelUtils = require('../model/utils');
const {STATUS_MOUNT_PATH, INFO_PATH} = require('../constants');

/**
 * @param {string} domain: anchoring domain. defaults to 'default'
 * @param {strategy} strategy
 * @function BatchService
 * @memberOf Services
 */
function BatchService(domain, strategy){
    const strategies = require("../../pdm-dsu-toolkit/services/strategy");
    const Batch = require('../model').Batch;
    const endpoint = 'batch';
    const keyGenFunction = require('../commands/setBatchSSI').createBatchSSI;
    domain = domain || "default";
    let isSimple = strategies.SIMPLE === (strategy || strategies.SIMPLE);
    const statusService = new (require('./StatusService'))(domain, strategy);
    const productService = new ( require('./ProductService'))(domain, strategy);

    this.generateKey = function(gtin, batchNumber){
        let keyGenData = {
            gtin: gtin,
            batch: batchNumber
        }
        return keyGenFunction(keyGenData, domain);
    }

    this.getDeterministic = function(gtin, batchNumber, callback){
        const key = this.generateKey(gtin, batchNumber);
        this.get(key, callback);
    }
    
    const validateUpdate = function(batchFromSSI, updatedBatch, callback){
        if (!ModelUtils.isEqual(batchFromSSI, updatedBatch, "batchStatus"))
            return callback('invalid update');
        return callback();
    }

    let createBatchStatus = function (id, status, callback) {
        if (typeof status === 'function') {
            callback = status;
            status = id;
            id = undefined;
        }
        statusService.create(status, id, (err, keySSI) => {
            if (err)
                return callback(err);
            console.log(`BatchStatus DSU created with SSI ${keySSI.getIdentifier(true)}`);
            callback(undefined, keySSI);
        });
    }

    /**
     * Resolves the DSU and loads the Batch object with all its properties, mutable or not
     * @param {KeySSI} keySSI
     * @param {function(err, Order)} callback
     * @memberOf BatchService
     */
    this.get = function(keySSI, callback){
        utils.getResolver().loadDSU(keySSI, (err, dsu) => {
            if (err)
                return callback(err);
            dsu.readFile(INFO_PATH, (err, data) => {
                if (err)
                    return callback(err);
                let batch;
                try{
                    batch = new Batch(JSON.parse(data));
                } catch (e) {
                    return callback(`unable to parse Batch: ${data}`);
                }

                utils.getMounts(dsu, '/', STATUS_MOUNT_PATH, (err, mounts) => {
                    if(err)
                        return callback(err);
                    
                    statusService.get(mounts[STATUS_MOUNT_PATH], (err, status) => {
                        if(err)
                            return callback(err);

                        batch.batchStatus = status;    

                        callback(undefined, batch, dsu);
                    });
                });
            });
        });
    }

    /**
     * Creates a {@link Batch} DSU
     * @param {string} gtin
     * @param {Batch} batch
     * @param {function(err, keySSI)} callback
     * @memberOf BatchService
     */
    this.create = function(gtin, batch, callback){

        let data = typeof batch === 'object' ? JSON.stringify(batch) : batch;
        if(!(batch instanceof Batch))
            batch = new Batch(batch);
        const _err = batch.validate();
        if(_err)
            return callback(_err);

        if (isSimple){
            let keySSI = this.generateKey(gtin, batch.batchNumber);
            utils.selectMethod(keySSI)(keySSI, (err, dsu) => {
                if (err)
                    return callback(err);

                const cb = function(err, ...results){
                    if (err)
                        return dsu.cancelBatch(err2 => {
                            callback(err);
                        });
                    callback(undefined, ...results);
                }

                try{
                    dsu.beginBatch();
                }catch(e){
                    return callback(e);
                }

                dsu.writeFile(INFO_PATH, data, (err) => {
                    if (err)
                        return cb(err);
                    
                    productService.getDeterministic(gtin, (err, product) => {
                        if(err)
                            return callback(err);                        

                        createBatchStatus(product.manufName, batch.batchStatus, (err, statusSSI) =>{
                            if(err)
                                return cb(err);
                            
                            dsu.mount(STATUS_MOUNT_PATH, statusSSI.getIdentifier(true), (err) => {
                                if(err)
                                    return cb(err);
                                    
                                dsu.commitBatch((err) => {
                                    if(err)
                                        return cb(err);
                                    dsu.getKeySSIAsObject(callback);
                                });
                            });
                        });
                    });
                });
            });
        } else {
            let getEndpointData = function (batch){
                return {
                    endpoint: endpoint,
                    data: {
                        gtin: gtin,
                        batch: batch.batchNumber
                    }
                }
            }

            utils.getDSUService().create(domain, getEndpointData(batch), (builder, cb) => {
                builder.addFileDataToDossier(INFO_PATH, data, cb);
            }, callback);
        }
    };


    /**
     * updates a product DSU
     * @param {string} gtin
     * @param {KeySSI} keySSI
     * @param {Batch} batch
     * @param {function(err?)} callback
     */
    this.update = function (gtin, keySSI, batch, callback) {
        // if batch is invalid, abort immediatly.
        const self = this;

        self.get(keySSI, (err, batchFromSSI, batchDsu) => {
            if(err)
                return callback(err);

            if(!(batch instanceof Batch))
                batch = new Batch(batch);
            err = batch.validate(batchFromSSI.batchStatus.status);
            if(err)
                return callback(err);

            const cb = function(err, ...results){
                if(err)
                    return batchDsu.cancelBatch(err2 => {
                        callback(err);
                    })
                callback(undefined, ...results);
            }

            try {
                batchDsu.beginBatch();
            } catch (e){
                return callback(e);
            }

            validateUpdate(batchFromSSI, batch, (err) =>{
                if(err)
                    return cb(err);
                
                utils.getMounts(batchDsu, '/', STATUS_MOUNT_PATH, (err, mounts) => {
                    if(err)
                        return cb(err);
                    
                    if(!mounts[STATUS_MOUNT_PATH])
                        return cb(`Missing mount path ${STATUS_MOUNT_PATH}`);

                    productService.getDeterministic(gtin, (err, product) => {
                        if(err)
                            return callback(err);
                        statusService.update(mounts[STATUS_MOUNT_PATH], batch.batchStatus, product.manufName, (err) => {
                            if (err)
                                return cb(err);

                            batchDsu.commitBatch((err) => {
                                if (err)
                                    return cb(err);

                                self.get(keySSI, callback);
                            });
                        });
                    });
                });
            });
        });
    }
}

module.exports = BatchService;
},{"../../pdm-dsu-toolkit/services/strategy":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/services/strategy.js","../../pdm-dsu-toolkit/services/utils":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/services/utils.js","../commands/setBatchSSI":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/commands/setBatchSSI.js","../constants":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/constants.js","../model":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/index.js","../model/utils":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/utils.js","./ProductService":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/services/ProductService.js","./StatusService":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/services/StatusService.js"}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/services/IndividualProductService.js":[function(require,module,exports){
const utils = require('../../pdm-dsu-toolkit/services/utils');
const { INFO_PATH } = require('../constants');

/**
 * @param {string} domain: anchoring domain. defaults to 'default'
 * @param {strategy} strategy
 * @function IndividualProductService
 * @memberOf Services
 */
function IndividualProductService(domain, strategy){
    const strategies = require("../../pdm-dsu-toolkit/services/strategy");
    const IndividualProduct = require('../model/IndividualProduct');
    const endpoint = 'individualproduct';
    const keyGenFunction = require('../commands/setIndividualProductSSI').createIndividualProductSSI;

    domain = domain || "default";
    let isSimple = strategies.SIMPLE === (strategy || strategies.SIMPLE);

    this.generateKey = function(gtin, batchNumber, serialNumber){
        let keyGenData = {
            gtin: gtin,
            batchNumber: batchNumber,
            serialNumber: serialNumber
        }
        return keyGenFunction(keyGenData, domain);
    }

    /**
     * Resolves the DSU and loads the IndividualProduct object with all its properties, mutable or not
     * @param {KeySSI} keySSI
     * @param {function(err, IndividualProduct)} callback
     */
    this.get = function(keySSI, callback){
        utils.getResolver().loadDSU(keySSI, (err, dsu) => {
            if (err)
                return callback(err);
            dsu.readFile(INFO_PATH, (err, data) => {
                if (err)
                    return callback(err);
                let individualProduct;
                try{
                    individualProduct = new IndividualProduct(JSON.parse(data));
                } catch (e) {
                    return callback(`unable to parse IndividualProduct: ${data.toString()}`);
                }
                callback(undefined, individualProduct);
            });
        });
    }

    /**
     * Creates a {@link Product} DSU
     * @param {IndividualProduct|string} product
     * @param {function(err, keySSI)} callback
     */
    this.create = function(product, callback){

        product = typeof product === 'object' ? product : new Product(JSON.parse(product));
        // if product is invalid, abort immediatly.
        let err = product.validate();
        if (err)
            return callback(err);

        if (isSimple){
            let keySSI = this.generateKey(product.gtin, product.batchNumber, product.serialNumber);
            utils.selectMethod(keySSI)(keySSI, (err, dsu) => {
                if (err)
                    return callback(err);

                const cb = function(err, ...results){
                    if (err)
                        return dsu.cancelBatch(err2 => {
                            callback(err);
                        });
                    callback(undefined, ...results);
                }
                
                try {
                    dsu.beginBatch();
                } catch (e) {
                    return callback(e);
                }

                dsu.writeFile(INFO_PATH, JSON.stringify(product), (err) => {
                    if (err)
                        return cb(err);
                    dsu.commitBatch((err) => {
                        if (err)
                            return cb(err);
                        dsu.getKeySSIAsObject(callback);
                    });
                });
            });
        } else {
            let getEndpointData = function (product){
                return {
                    endpoint: endpoint,
                    data: {
                        gtin: product.gtin,
                        batchNumber: product.batchNumber,
                        serialNumber: product.serialNumber
                    }
                }
            }

            utils.getDSUService().create(domain, getEndpointData(product), (builder, cb) => {
                builder.addFileDataToDossier(INFO_PATH, JSON.stringify(product), cb);
            }, callback);
        }
    };
}

module.exports = IndividualProductService;
},{"../../pdm-dsu-toolkit/services/strategy":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/services/strategy.js","../../pdm-dsu-toolkit/services/utils":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/services/utils.js","../commands/setIndividualProductSSI":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/commands/setIndividualProductSSI.js","../constants":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/constants.js","../model/IndividualProduct":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/IndividualProduct.js"}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/services/OrderService.js":[function(require,module,exports){
const Utils = require('../../pdm-dsu-toolkit/services/utils');
const {STATUS_MOUNT_PATH, INFO_PATH, SHIPMENT_PATH, ORDER_MOUNT_PATH} = require('../constants');
const {OrderStatus, Batch} = require("../model");


/**
 * @param {string} domain: anchoring domain. defaults to 'default'
 * @param {strategy} strategy
 * @function OrderService
 * @memberOf Services
 */
function OrderService(domain, strategy) {
    const strategies = require("../../pdm-dsu-toolkit/services/strategy");
    const {Order, OrderStatus, utils} = require('../model');
    const endpoint = 'order';

    domain = domain || "default";
    const statusService = new (require('./StatusService'))(domain, strategy);

    let isSimple = strategies.SIMPLE === (strategy || strategies.SIMPLE);


    this.resolveMAH = function(orderLine, callback){
        const keyGen = require('../commands/setProductSSI').createProductSSI;
        const productSSI = keyGen({gtin: orderLine.gtin}, domain);
        Utils.getResolver().loadDSU(productSSI, (err, dsu) => {
            if (err)
                return callback(`Could not load Product DSU ${err}`);
            dsu.readFile(INFO_PATH, (err, data) => {
                if (err)
                    return callback(`Could not read product from dsu ${err}`);
                let product;
                try{
                    product = JSON.parse(data);
                } catch (e){
                    return callback(`Could not parse Product data ${err}`)
                }
                callback(undefined, product.manufName);
            });
        });
    }

    /**
     * Resolves the DSU and loads the Order object with all its properties, mutable or not
     * @param {KeySSI} keySSI
     * @param {function(err?, Order?, Archive?, KeySSI?)} callback
     */
    this.get = function(keySSI, callback){
        Utils.getResolver().loadDSU(keySSI, {skipCache: true}, (err, dsu) => {
            if (err)
                return callback(err);
            dsu.readFile(INFO_PATH, (err, data) => {
                if (err)
                    return callback(err);
                let order;
                try {
                    order = JSON.parse(data);
                } catch (e) {
                    return callback(`Could not parse order in DSU ${keySSI}`);
                }
                order = new Order(order.orderId, order.requesterId, order.senderId, order.shipToAddress, order.status, order.orderLines);
                console.log('## OrderService.get order=', order);
                Utils.getMounts(dsu, '/', STATUS_MOUNT_PATH, (err, mounts) => {
                    if (err)
                        return callback(err);
                    statusService.get(mounts[STATUS_MOUNT_PATH], (err, status) => {
                        if (err)
                            return callback(err);
                        order.status = status;

                        if (order.status.status === OrderStatus.CREATED)
                            return callback(undefined, order, dsu, keySSI);
                        dsu.readFile(`${SHIPMENT_PATH}${INFO_PATH}`, (err, data) => {
                            if (err || !data)
                                return callback(undefined, order, dsu);
                            let shipment;
                            try {
                                shipment = JSON.parse(data);
                            } catch (e) {
                                return callback(e);
                            }
                            order.shipmentId = shipment.shipmentId;
                            callback(undefined, order, dsu, keySSI);
                        });
                    });
                });
            });
        });
    }

    /**
     * Creates an order
     * @param {Order} order
     * @param {function(err, keySSI)} callback
     */
    this.create = function (order, callback) {
        // if product is invalid, abort immediatly.
        if(!(order instanceof Order))
            order = new Order(order);
        const _err = order.validate();
        if (_err)
            return callback(_err);

        if (isSimple) {
            createSimple(order, callback);
        } else {
            createAuthorized(order, callback);
        }
    }

    const validateUpdate = function(orderFromSSI, updatedOrder, callback){
        if (!utils.isEqual(orderFromSSI, updatedOrder, "status", "orderLines", "shipmentSSI"))
            return callback('invalid update');
        return callback();
    }

    /**
     * updates an order DSU
     * @param {KeySSI} keySSI
     * @param {Order} order
     * @param {function(err?)} callback
     */
    this.update = function (keySSI, order, callback) {
        // if product is invalid, abort immediatly.
        const self = this;

        self.get(keySSI, (err, orderFromSSI, orderDsu) => {
            if (err)
                return callback(err);

            if(!(order instanceof Order))
                order = new Order(order);
            err = order.validate(orderFromSSI.status.status);
            if (err)
                return callback(err);

            const cb = function(err, ...results){
                if (err)
                    return orderDsu.cancelBatch(err2 => {
                        callback(err);
                    });
                callback(undefined, ...results);
            }

            try{
                orderDsu.beginBatch();
            }catch(e){
                return callback(e);
            }

            validateUpdate(orderFromSSI, order, (err) => {
                if (err)
                    return cb(err);
                Utils.getMounts(orderDsu, '/', STATUS_MOUNT_PATH, SHIPMENT_PATH, (err, mounts) => {
                    if (err)
                        return cb(err);
                    if (!mounts[STATUS_MOUNT_PATH])
                        return cb(`Missing mount path ${STATUS_MOUNT_PATH}`);
                    statusService.update(mounts[STATUS_MOUNT_PATH], order.status, order.requesterId, (err) => {
                        if (err)
                            return cb(err);

                        if (!mounts[SHIPMENT_PATH] && order.shipmentSSI)
                            orderDsu.mount(SHIPMENT_PATH, order.shipmentSSI, (err) => {
                                if (err)
                                    return cb(err);
                                orderDsu.commitBatch((err) => {
                                    if(err)
                                        return cb(err);
                                    self.get(keySSI, callback);
                                });
                            });
                        else
                            self.get(keySSI, callback);
                    });
                });
            });
        });
    }

    /**
     * Creates the original OrderStatus DSU
     * @param {string} id
     * @param {OrderStatus} [status]: defaults to OrderStatus.CREATED
     * @param {function(err, keySSI, orderLinesSSI)} callback
     */
    let createOrderStatus = function (id, status, callback) {
        if (typeof status === 'function') {
            callback = status;
            status = OrderStatus.CREATED;
        }
        statusService.create(status, id, (err, keySSI) => {
            if (err)
                return callback(err);
            console.log(`OrderStatus DSU created with SSI ${keySSI.getIdentifier(true)}`);
            callback(undefined, keySSI);
        });
    }

    let createSimple = function (order, callback) {
        let keyGenFunction = require('../commands/setOrderSSI').createOrderSSI;
        let templateKeySSI = keyGenFunction({data: order.orderId + order.requesterId}, domain);
        Utils.selectMethod(templateKeySSI)(templateKeySSI, (err, dsu) => {
            if (err)
                return callback(err);

            const cb = function(err, ...results){
                if (err)
                    return dsu.cancelBatch(err2 => {
                        callback(err);
                    });
                callback(undefined, ...results);
            }

            try {
                dsu.beginBatch();
            } catch (e) {
                return callback(e);
            }

            dsu.writeFile(INFO_PATH, JSON.stringify(order), (err) => {
                if (err)
                    return cb(err);
                console.log("Order /info ", JSON.stringify(order));
                createOrderStatus(order.requesterId, order.status,(err, statusSSI) => {
                    if (err)
                        return cb(err);
                    // Mount must take string version of keyssi
                    dsu.mount(STATUS_MOUNT_PATH, statusSSI.getIdentifier(), (err) => {
                        if (err)
                            return cb(err);
                        console.log(`OrderStatus DSU (${statusSSI.getIdentifier(true)}) mounted at '/status'`);
                        dsu.commitBatch((err) => {
                            if (err)
                                return cb(err);
                            dsu.getKeySSIAsObject((err, keySSI) => {
                                if (err)
                                    return callback(err);
                                console.log("Finished creating Order " + keySSI.getIdentifier(true));
                                callback(undefined, keySSI, order.orderLines);
                            });
                        });
                    });
                });
            });
        });
    }

    let createAuthorized = function (order, callback) {
        let getEndpointData = function (order) {
            return {
                endpoint: endpoint,
                data: {
                    data: order.orderId + order.requesterId
                }
            }
        }

        Utils.getDSUService().create(domain, getEndpointData(order), (builder, cb) => {
            builder.addFileDataToDossier(INFO_PATH, JSON.stringify(order), (err) => {
                if (err)
                    return cb(err);
                createOrderStatus(order.requesterId, (err, statusSSI) => {
                    if (err)
                        return cb(err);
                    builder.mount(STATUS_MOUNT_PATH, statusSSI.getIdentifier(), (err) => {
                        if (err)
                            return cb(err); 
                        cb();    
                    });
                });
            });
        }, callback);
    }
}

module.exports = OrderService;
},{"../../pdm-dsu-toolkit/services/strategy":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/services/strategy.js","../../pdm-dsu-toolkit/services/utils":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/services/utils.js","../commands/setOrderSSI":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/commands/setOrderSSI.js","../commands/setProductSSI":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/commands/setProductSSI.js","../constants":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/constants.js","../model":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/index.js","./StatusService":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/services/StatusService.js"}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/services/ProductService.js":[function(require,module,exports){
const utils = require('../../pdm-dsu-toolkit/services/utils');
const { INFO_PATH } = require('../constants');

/**
 * @param {string} domain: anchoring domain. defaults to 'default'
 * @param {strategy} strategy
 * @function ProductService
 * @memberOf Services
 */
function ProductService(domain, strategy){
    const strategies = require("../../pdm-dsu-toolkit/services/strategy");
    const Product = require('../model/Product');
    const endpoint = 'product';
    const keyGenFunction = require('../commands/setProductSSI').createProductSSI;

    domain = domain || "default";
    let isSimple = strategies.SIMPLE === (strategy || strategies.SIMPLE);

    this.generateKey = function(gtin){
        let keyGenData = {
            gtin: gtin
        }
        return keyGenFunction(keyGenData, domain);
    }

    this.getDeterministic = function(gtin, callback){
        const key = this.generateKey(gtin);
        this.get(key, callback);
    }

    /**
     * Resolves the DSU and loads the Product object with all its properties, mutable or not
     * @param {KeySSI} keySSI
     * @param {function(err, Product)} callback
     */
    this.get = function(keySSI, callback){
        utils.getResolver().loadDSU(keySSI, (err, dsu) => {
            if (err)
                return callback(err);
            dsu.readFile(INFO_PATH, (err, data) => {
                if (err)
                    return callback(err);
                let product;

                try{
                    product = new Product(JSON.parse(data));
                } catch (e) {
                    return callback(`unable to parse Product: ${data}`);
                }
                callback(undefined, product);
            });
        });
    }

    /**
     * Creates a {@link Product} DSU
     * @param {Product|string} product
     * @param {function(err, keySSI)} callback
     */
    this.create = function(product, callback){

        product = typeof product === 'object' ? product : new Product(JSON.parse(product));
        // if product is invalid, abort immediatly.
        let err = product.validate();
        if (err)
            return callback(err);

        if (isSimple){
            let keySSI = this.generateKey(product.gtin);
            utils.selectMethod(keySSI)(keySSI, (err, dsu) => {
                if (err)
                    return callback(err);

                const cb = function(err, ...results){
                    if (err)
                        return dsu.cancelBatch(err2 => {
                            callback(err);
                        });
                    callback(undefined, ...results);
                }

                try {
                    dsu.beginBatch();
                } catch (e) {
                    return callback(e);
                }

                dsu.writeFile(INFO_PATH, JSON.stringify(product), (err) => {
                    if (err)
                        return cb(err);
                    dsu.commitBatch((err) => {
                        if (err)
                            return cb(err);
                        dsu.getKeySSIAsObject(callback);
                    });
                });
            });
        } else {
            let getEndpointData = function (product){
                return {
                    endpoint: endpoint,
                    data: {
                        gtin: product.gtin,
                    }
                }
            }

            utils.getDSUService().create(domain, getEndpointData(product), (builder, cb) => {
                builder.addFileDataToDossier(INFO_PATH, JSON.stringify(product), cb);
            }, callback);
        }
    };

    /**
     * updates a product DSU
     * @param {KeySSI} keySSI
     * @param {Product} product
     * @param {function(err?)} callback
     */
    this.update = function (keySSI, product, callback) {
        return callback(`Product DSUs cannot be updated`);
    }
}

module.exports = ProductService;
},{"../../pdm-dsu-toolkit/services/strategy":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/services/strategy.js","../../pdm-dsu-toolkit/services/utils":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/services/utils.js","../commands/setProductSSI":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/commands/setProductSSI.js","../constants":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/constants.js","../model/Product":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/Product.js"}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/services/SaleService.js":[function(require,module,exports){
const utils = require('../../pdm-dsu-toolkit/services/utils');

const {STATUS_MOUNT_PATH, INFO_PATH} = require('../constants');

/**
 * @param {string} domain: anchoring domain. defaults to 'default'
 * @param {strategy} strategy
 * @function ReceiptService
 * @memberOf Services
 */
function SaleService(domain, strategy){
    const strategies = require("../../pdm-dsu-toolkit/services/strategy");
    const {Sale} = require('../model');
    const endpoint = 'receipt';

    domain = domain || "default";
    let isSimple = strategies.SIMPLE === (strategy || strategies.SIMPLE);

    /**
     * Resolves the DSU and loads the OrderLine object with all its properties, mutable or not
     * @param {KeySSI} keySSI
     * @param {function(err?, OrderLine?)} callback
     */
    this.get = function(keySSI, callback){
        utils.getResolver().loadDSU(keySSI, (err, dsu) => {
            if (err)
                return callback(err);
            dsu.readFile(INFO_PATH, (err, data) => {
                if (err)
                    return callback(err);
                let sale;
                try{
                    sale = new Sale(JSON.parse(data));
                } catch (e){
                    return callback(`Could not parse ShipmentLine in DSU ${keySSI}`);
                }

                callback(undefined, sale);
            });
        });
    }

    /**
     * Creates an orderLine DSU
     * @param {string | Sale} sale
     * @param {KeySSI} statusSSI the keySSI for the OrderStus DSU
     * @param {function(err?, KeySSI?, Archive?)} callback
     */
    this.create = function(sale, callback){

        const errors = sale.validate(true);

        if (errors)
            return callback(errors);

        let data = typeof sale == 'object' ? JSON.stringify(sale) : sale;

        let keyGenData = {
            data: [
                sale.id,
                sale.sellerId
            ]
        }

        if (isSimple){
            let keyGenFunction = require('../commands/setSaleSSI').createSaleSSI;
            let keySSI = keyGenFunction(keyGenData, domain);
            utils.selectMethod(keySSI)(keySSI, (err, dsu) => {
                if (err)
                    return callback(err);

                const cb = function(err, ...results){
                    if (err)
                        return dsu.cancelBatch(err2 => {
                            callback(err);
                        });
                    callback(undefined, ...results);
                }

                try {
                    dsu.beginBatch();
                } catch (e) {
                    return callback(e);
                }

                dsu.writeFile(INFO_PATH, data, (err) => {
                    if (err)
                        return cb(err);
                    dsu.commitBatch((err) => {
                        if (err)
                            return cb(err);
                        dsu.getKeySSIAsObject(callback);
                    });
                });
            })
        } else {
            let getEndpointData = function (sale){
                return {
                    endpoint: endpoint,
                    data: [
                        sale.id,
                        sale.sellerId
                    ]
                }
            }

            utils.getDSUService().create(domain, getEndpointData(sale), (builder, cb) => {
                builder.addFileDataToDossier(INFO_PATH, data, cb);
            }, callback);
        }
    };
}

module.exports = SaleService;
},{"../../pdm-dsu-toolkit/services/strategy":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/services/strategy.js","../../pdm-dsu-toolkit/services/utils":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/services/utils.js","../commands/setSaleSSI":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/commands/setSaleSSI.js","../constants":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/constants.js","../model":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/index.js"}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/services/ShipmentCodeService.js":[function(require,module,exports){
const utils = require('../../pdm-dsu-toolkit/services/utils');

const {STATUS_MOUNT_PATH, INFO_PATH} = require('../constants');

const GRANULARITY = [10000, 1000, 100, 10, 1]; // amounts to 10000 packs per biggest container
const {Shipment, ShipmentLine, ShipmentCode, TrackingCode} = require('../model');
/**
 * @param {string} domain: anchoring domain. defaults to 'default'
 * @param {strategy} strategy
 * @function ShipmentCodeService
 * @memberOf Services
 */
function ShipmentCodeService(domain, strategy){
    const strategies = require("../../pdm-dsu-toolkit/services/strategy");

    const endpoint = 'shipmentcode';

    domain = domain || "default";
    let isSimple = strategies.SIMPLE === (strategy || strategies.SIMPLE);

    this.getContainerGranularity = () => GRANULARITY.slice();

    /**
     * Resolves the DSU and loads the OrderLine object with all its properties, mutable or not
     * @param {KeySSI} keySSI
     * @param {function(err, OrderLine)} callback
     */
    this.get = function(keySSI, callback){
        utils.getResolver().loadDSU(keySSI, (err, dsu) => {
            if (err)
                return callback(err);
            dsu.readFile(INFO_PATH, (err, data) => {
                if (err)
                    return callback(err);
                try{
                    const orderLine = JSON.parse(data);
                    dsu.readFile(`${STATUS_MOUNT_PATH}${INFO_PATH}`, (err, status) => {
                        if (err)
                            return callback(`could not retrieve shipmentLine status`);
                        try{
                            orderLine.status = JSON.parse(status);
                            callback(undefined, orderLine);
                        } catch (e) {
                            callback(`unable to parse ShipmentLine status: ${data.toString()}`);
                        }
                    });
                } catch (e){
                    callback(`Could not parse ShipmentLine in DSU ${keySSI.getIdentifier()}`);
                }
            })
        });
    }

    /**
     * Creates an orderLine DSU
     * @param {ShipmentCode} shipmentCode
     * @param {function} callback
     * @param {KeySSI} statusSSI the keySSI for the OrderStus DSU
     * @return {string} keySSI
     */
    this.create = function(shipmentCode, statusSSI, callback){

        let data = typeof shipmentCode == 'object' ? JSON.stringify(shipmentCode) : shipmentCode;
        
        if (isSimple){
            let keyGenFunction = require('../commands/setShipmentCodeSSI').createShipmentCodeSSI;
            let keySSI = keyGenFunction('shipmentcode', domain);
            utils.selectMethod(keySSI)(keySSI, (err, dsu) => {
                if (err)
                    return callback(err);

                const cb = function(err, ...results){
                    if (err)
                        return dsu.cancelBatch(err2 => {
                            callback(err);
                        });
                    callback(undefined, ...results);
                }

                try {
                    dsu.beginBatch();
                } catch (e) {
                    return callback(e);
                }

                dsu.writeFile(INFO_PATH, data, (err) => {
                    if (err)
                        return cb(err);
                    dsu.mount(STATUS_MOUNT_PATH, statusSSI.getIdentifier(), (err) => {
                        if (err)
                            return cb(err);
                        dsu.commitBatch((err) => {
                            if (err)
                                return cb(err);
                            dsu.getKeySSIAsObject(callback);
                        });            
                    });
                });
            });
        } else {
            let getEndpointData = function (shipmentId, senderId, shipmentLine){
                return {
                    endpoint: endpoint,
                    data: {
                        gtin: shipmentLine.gtin,
                        senderId: senderId,
                        shipmentId: shipmentId
                    }
                }
            }

            utils.getDSUService().create(domain, getEndpointData(shipmentId, senderId, shipmentLine), (builder, cb) => {
                builder.addFileDataToDossier(INFO_PATH, data, cb);
            }, callback);
        }
    };


    this.fromShipment = function(shipment, statusSSI, dsu, callback){
        const self = this;
        if (!callback &&  typeof dsu === 'function'){
            callback = dsu;
            dsu = undefined;
        }

        const fallbackCreate = function(){
            self.create(shipment.status, statusSSI, (err, shipmentCodeDSU) => err
                ? callback(err)
                : self.fromShipment(shipment, statusSSI, shipmentCodeDSU, callback));
        }

        const storeStatusInOuterCode = function (dsu, statusSSI, callback){
            dsu.mount(STATUS_MOUNT_PATH, statusSSI, callback);
        }

        const createShipmentCodesRecursively = function(){
            const lines = [];
            const orderLineIterator = function(orderLinesCopy, callback){
                const orderLine = orderLinesCopy.shift();
                if (!orderLine)
                    return callback();

            }
        }

        if (!dsu)
            return fallbackCreate();

        if (!statusSSI)
            return createShipmentCodesRecursively();

        storeStatusInOuterCode(dsu, statusSSI, (err) => err
            ? callback(err)
            : createShipmentCodesRecursively())
    }
}

function getTrackingData(shipmentLine, granularity){

    const {gtin, batch, quantity} = shipmentLine;

    function splitIntoTrackingCodes(quantity, granularity){

        function getFirstGranularity(granularity, quantity){
            return granularity.find(g => g <= quantity);
        }

        function decrementQuantity(quantity, decrement){
            return quantity - decrement;
        }

        function joinAsTrackingCode(code1, code2){

        }

        const g = getFirstGranularity(granularity, quantity);
        const remainder = quantity % g;
        if (remainder === 0)
            return {
                code: new TrackingCode(splitIntoTrackingCodes(shipmentLine, granularity.slice(1))),
                remainder: undefined
            };
        const mainDecremented = decrementQuantity(shipmentLine, remainder);
        return {
            code: new TrackingCode(splitIntoTrackingCodes(mainDecremented, granularity.slice(1))),
            remainder: undefined
        };


    }

    return result;
}



module.exports = ShipmentCodeService;
},{"../../pdm-dsu-toolkit/services/strategy":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/services/strategy.js","../../pdm-dsu-toolkit/services/utils":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/services/utils.js","../commands/setShipmentCodeSSI":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/commands/setShipmentCodeSSI.js","../constants":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/constants.js","../model":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/index.js"}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/services/ShipmentLineService.js":[function(require,module,exports){
const utils = require('../../pdm-dsu-toolkit/services/utils');

const {STATUS_MOUNT_PATH, INFO_PATH} = require('../constants');

/**
 * @param {string} domain: anchoring domain. defaults to 'default'
 * @param {strategy} strategy
 * @function ShipmentLineService
 * @memberOf Services
 */
function ShipmentLineService(domain, strategy){
    const strategies = require("../../pdm-dsu-toolkit/services/strategy");
    const {ShipmentLine} = require('../model');
    const endpoint = 'shipmentline';

    domain = domain || "default";
    let isSimple = strategies.SIMPLE === (strategy || strategies.SIMPLE);

    const statusService = new (require('./StatusService'))(domain, strategy);

    /**
     * Resolves the DSU and loads the OrderLine object with all its properties, mutable or not
     * @param {KeySSI} keySSI
     * @param {function(err?, OrderLine?)} callback
     */
    this.get = function(keySSI, callback){
        utils.getResolver().loadDSU(keySSI, {skipCache: true}, (err, dsu) => {
            if (err)
                return callback(err);
            dsu.readFile(INFO_PATH, (err, data) => {
                if (err)
                    return callback(err);
                let shipmentLine;
                try{
                    shipmentLine = new ShipmentLine(JSON.parse(data));
                } catch (e){
                    return callback(`Could not parse ShipmentLine in DSU ${keySSI}`);
                }

                utils.getMounts(dsu, '/', STATUS_MOUNT_PATH,  (err, mounts) => {
                    if (err || !mounts[STATUS_MOUNT_PATH])
                        return callback(`Could not find status mount`);
                    console.log(`Loading status for ShipmentLine SSI ${keySSI} with status SSI ${mounts[STATUS_MOUNT_PATH]}`)
                    statusService.get(mounts[STATUS_MOUNT_PATH], (err, status) => {
                        if (err)
                            return callback(err);
                        shipmentLine.status = status;
                        callback(undefined, shipmentLine);
                    });
                });
            });
        });
    }

    /**
     * Creates an orderLine DSU
     * @param {string} shipmentId
     * @param {ShipmentLine} shipmentLine
     * @param {function} callback
     * @param {KeySSI} statusSSI the keySSI for the OrderStus DSU
     * @return {string} keySSI
     */
    this.create = function(shipmentId, shipmentLine, statusSSI, callback){

        let data = typeof shipmentLine == 'object' ? JSON.stringify(shipmentLine) : shipmentLine;

        let keyGenData = {
            data: shipmentLine.gtin + shipmentLine.senderId + shipmentId + shipmentLine.batch
        }

        if (isSimple){
            let keyGenFunction = require('../commands/setShipmentLineSSI').createShipmentLineSSI;
            let keySSI = keyGenFunction(keyGenData, domain);
            utils.selectMethod(keySSI)(keySSI, (err, dsu) => {
                if (err)
                    return callback(err);

                const cb = function(err, ...results){
                    if (err)
                        return dsu.cancelBatch(err2 => {
                            callback(err);
                        });
                    callback(undefined, ...results);
                }

                try {
                    dsu.beginBatch();
                } catch (e) {
                    return callback(e);
                }

                dsu.writeFile(INFO_PATH, data, (err) => {
                    if (err)
                        return cb(err);
                    dsu.mount(STATUS_MOUNT_PATH, statusSSI.getIdentifier(), (err) => {
                        if (err)
                            return cb(err);
                        dsu.commitBatch((err) => {
                            if (err)
                                return cb(err);
                            dsu.getKeySSIAsObject(callback);
                        });                            
                    });
                });
            });
        } else {
            let getEndpointData = function (shipmentId, senderId, shipmentLine){
                return {
                    endpoint: endpoint,
                    data: {
                        data: shipmentLine.gtin + shipmentLine.senderId + shipmentId + shipmentLine.batch
                    }
                }
            }

            utils.getDSUService().create(domain, getEndpointData(shipmentId, senderId, shipmentLine), (builder, cb) => {
                builder.addFileDataToDossier(INFO_PATH, data, cb);
            }, callback);
        }
    };
}

module.exports = ShipmentLineService;
},{"../../pdm-dsu-toolkit/services/strategy":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/services/strategy.js","../../pdm-dsu-toolkit/services/utils":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/services/utils.js","../commands/setShipmentLineSSI":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/commands/setShipmentLineSSI.js","../constants":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/constants.js","../model":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/index.js","./StatusService":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/services/StatusService.js"}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/services/ShipmentService.js":[function(require,module,exports){
const utils = require('../../pdm-dsu-toolkit/services/utils');
const {STATUS_MOUNT_PATH, INFO_PATH, LINES_PATH, ORDER_MOUNT_PATH} = require('../constants');
const {Shipment, ShipmentStatus, Status, Order} = require('../model');
/**
 * @param {string} domain: anchoring domain. defaults to 'default'
 * @param {strategy} strategy
 * @function ShipmentService
 * @memberOf Services
 */
function ShipmentService(domain, strategy) {
    const strategies = require("../../pdm-dsu-toolkit/services/strategy");
    const endpoint = 'shipment';

    domain = domain || "default";
    const shipmentLineService = new (require('./ShipmentLineService'))(domain, strategy);
    const statusService = new (require('./StatusService'))(domain, strategy);
    const shipmentCodeService = new (require('./ShipmentCodeService'))(domain, strategy);

    let isSimple = strategies.SIMPLE === (strategy || strategies.SIMPLE);

    let getDSUMountByPath = function(dsu, path, basePath, callback){
        if (!callback && typeof basePath === 'function'){
            callback = basePath;
            basePath = '/';
        }
        dsu.listMountedDSUs(basePath, (err, mounts) => {
            if (err)
                return callback(err);
            const filtered = mounts.filter(m => "/" + m.path === path);
            if (filtered.length !== 1)
                return callback(`Invalid number of mounts found ${filtered.length}`);
            callback(undefined, filtered[0].identifier);
        });
    }

    this.resolveMAH = function(shipmentLine, callback){
        const keyGen = require('../commands/setProductSSI').createProductSSI;
        const productSSI = keyGen({gtin: shipmentLine.gtin}, domain);
        utils.getResolver().loadDSU(productSSI, (err, dsu) => {
            if (err)
                return callback(`Could not load Product DSU ${err}`);
            dsu.readFile(INFO_PATH, (err, data) => {
                if (err)
                    return callback(`Could not read product from dsu ${err}`);
                let product;
                try{
                    product = JSON.parse(data);
                } catch (e){
                    return callback(`Could not parse Product data ${err}`)
                }
                callback(undefined, product.manufName);
            });
        });
    }

    /**
     * Resolves the DSU and loads the Order object with all its properties, mutable or not
     * @param {KeySSI} keySSI
     * @param {function(err, Shipment, Archive)} callback
     */
    this.get = function(keySSI, callback){
        utils.getResolver().loadDSU(keySSI, (err, dsu) => {
            if (err)
                return callback(err);
            dsu.readFile(INFO_PATH, (err, data) => {
                if (err)
                    return callback(err);
                let shipment;

                try{
                    shipment = JSON.parse(data);
                } catch (e){
                    return callback(`Could not parse shipment in DSU ${keySSI.getIdentifier()}`);
                }

                shipment = new Shipment(shipment.shipmentId, shipment.requesterId, shipment.senderId, shipment.shipToAddress, shipment.status, shipment.shipmentLines);
                console.log('## ShipmentService.get shipment=', shipment);

                utils.getMounts(dsu, '/', STATUS_MOUNT_PATH, ORDER_MOUNT_PATH, (err, mounts) => {
                    if (err)
                        return callback(err);
                    if (!mounts[STATUS_MOUNT_PATH] || !mounts[ORDER_MOUNT_PATH])
                        return callback(`Could not find status/order mount`);
                    statusService.get(mounts[STATUS_MOUNT_PATH], (err, status) => {
                        if (err)
                            return callback(err);
                        shipment.status = status;
                        shipment.orderSSI = mounts[ORDER_MOUNT_PATH];
                        dsu.readFile(`${ORDER_MOUNT_PATH}${INFO_PATH}`, (err, order) => {
                            if (err)
                                return callback(`Could not read from order DSU`);
                            let orderId;
                            try{
                                orderId = JSON.parse(order).orderId;
                            } catch (e) {
                                return callback(`unable to parse shipment mounted Order: ${order}`);
                            }

                            dsu.readFile(LINES_PATH, (err, data) => {
                                if (err)
                                    return callback(err);
                                let linesSSI;
                                try {
                                    linesSSI = JSON.parse(data);
                                } catch (e) {
                                    return callback(e);
                                }
                                callback(undefined, shipment, dsu, orderId, linesSSI);
                            });
                        });
                    });
                });
            });
        });
    }

    /**
     * Creates an shipment
     * @param {Shipment} shipment
     * @param {string} orderSSI (the readSSI to the order)
     * @param {function(err, keySSI)} callback
     */
    this.create = function (shipment, orderSSI, callback) {
        if (!callback){
            callback = orderSSI;
            orderSSI = undefined;
        }
        // if product is invalid, abort immediatly.
        if (typeof shipment === 'object') {
            let err = shipment.validate();
            if (err)
                return callback(err);
        }

        if (isSimple) {
            createSimple(shipment, orderSSI, callback);
        } else {
            createAuthorized(shipment, orderSSI, callback);
        }
    }

    /**
     * Creates the original OrderStatus DSU
     * @param {string} id the id for the operation
     * @param {string} [status]: defaults to ShipmentStatus.CREATED
     * @param {function(err, keySSI, orderLinesSSI)} callback
     */
    let createShipmentStatus = function (id, status,  callback) {
        if (typeof status === 'function') {
            callback = status;
            status = ShipmentStatus.CREATED;
        }
        statusService.create(status, id, (err, keySSI) => {
            if (err)
                return callback(err);
            console.log(`ShipmentStatus DSU created with SSI ${keySSI.getIdentifier(true)}`);
            callback(undefined, keySSI);
        });
    }

    let createSimple = function (shipment, orderSSI, callback) {
        let keyGenFunction = require('../commands/setShipmentSSI').createShipmentSSI;
        let templateKeySSI = keyGenFunction({data: shipment.senderId + shipment.shipmentId}, domain);
        utils.selectMethod(templateKeySSI)(templateKeySSI, (err, dsu) => {
            if (err)
                return callback(err);

            const cb = function(err, ...results){
                if (err)
                    return dsu.cancelBatch(err2 => {
                        callback(err);
                    });
                callback(undefined, ...results);
            }

            try {
                dsu.beginBatch();
            } catch (e) {
                return callback(e);
            }

            dsu.writeFile(INFO_PATH, JSON.stringify(shipment), (err) => {
                if (err)
                    return cb(err);
                console.log("Shipment /info ", JSON.stringify(shipment));
                createShipmentStatus(shipment.senderId, (err, statusSSI) => {
                    if (err)
                        return cb(err);
                    // Mount must take string version of keyssi
                    dsu.mount(STATUS_MOUNT_PATH, statusSSI.getIdentifier(), (err) => {
                        if (err)
                            return cb(err);
                        console.log(`OrderStatus DSU (${statusSSI.getIdentifier(true)}) mounted at '/status'`);

                        const finalize = function(callback){
                            createShipmentLines(shipment, statusSSI, (err, shipmentLines) => {
                                if (err)
                                    return cb(err);
                                const lines = JSON.stringify(shipmentLines.map(o => o.getIdentifier()));
                                dsu.writeFile(LINES_PATH, lines, (err) => {
                                    if (err)
                                        return cb(err);

                                    dsu.commitBatch((err) => {
                                        if (err)
                                            return cb(err);
                                        dsu.getKeySSIAsObject((err, keySSI) => {
                                            if (err)
                                                return callback(err);
                                            console.log("Finished creating Shipment " + keySSI.getIdentifier(true));
                                            callback(undefined, keySSI, shipmentLines, statusSSI.getIdentifier());
                                        });
                                    });                        
                                });
                            });
                        };

                        if (!orderSSI)
                            return finalize(callback);

                        dsu.mount(ORDER_MOUNT_PATH, orderSSI, (err) => {
                            if (err)
                                return cb(err);
                           finalize(callback);
                        });
                    });
                });
            });
        });
    }

    let createAuthorized = function (shipment, orderSSI, callback) {
        let getEndpointData = function (shipment) {
            return {
                endpoint: endpoint,
                data: {
                    data: shipment.senderId + shipment.shipmentId
                }
            }
        }

        utils.getDSUService().create(domain, getEndpointData(shipment), (builder, cb) => {
            builder.addFileDataToDossier(INFO_PATH, JSON.stringify(shipment), (err) => {
                if (err)
                    return cb(err);
                createShipmentStatus(shipment.senderId, (err, statusSSI) => {
                    if (err)
                        return cb(err);
                    builder.mount(STATUS_MOUNT_PATH, statusSSI.getIdentifier(), (err) => {
                        if (err)
                            return cb(err);

                        const finalize = function(callback){
                            createShipmentLines(shipment, statusSSI, (err, orderLines) => {
                                if (err)
                                    return callback(err);
                                builder.addFileDataToDossier(LINES_PATH, JSON.stringify(orderLines.map(o => o.getIdentifier(true))), (err) => {
                                    if (err)
                                        return callback(err);
                                    callback();
                                });
                            });
                        }

                        if (!orderSSI)
                            return finalize(cb);

                        builder.mount(ORDER_MOUNT_PATH, orderSSI, (err) => {
                            if (err)
                                return cb(err);
                            finalize(cb);
                        });
                    });
                });
            });
        }, callback);
    }

    const validateUpdate = function(shipmentFromSSI, updatedShipment, callback){
        if (!utils.isEqual(shipmentFromSSI, updatedShipment, "status", "shipmentLines", "orderSSI"))
            return callback('invalid update');
        if (Shipment.getAllowedStatusUpdates(shipmentFromSSI.status.status).indexOf(updatedShipment.status.status) === -1)
            return callback(`Status update is not valid`);
        return callback();
    }

    this.update = function(keySSI, newShipment, id, callback){
        if (!callback && typeof id === 'function'){
            callback = id;
            id = newShipment.senderId;
        }

        const self = this;
        if (isSimple) {
            keySSI = utils.getKeySSISpace().parse(keySSI);

            self.get(keySSI, (err, shipment, dsu) => {
                if (err)
                    return callback(err);

                if(!(newShipment instanceof Shipment))
                    newShipment = new Shipment(newShipment);
                err = newShipment.validate(shipment.status.status);
                if(err)
                    return callback(err);

                const cb = function(err, ...results){
                    if (err)
                        return dsu.cancelBatch(err2 => {
                            callback(err);
                        });
                    callback(undefined, ...results);
                }

                try{
                    dsu.beginBatch();
                }catch(e){
                    return callback(e);
                }

                utils.getMounts(dsu, '/', STATUS_MOUNT_PATH,  (err, mounts) => {
                    if (err)
                        return cb(err);
                    if (!mounts[STATUS_MOUNT_PATH])
                        return cb(`Missing mount ${STATUS_MOUNT_PATH}`);
                    statusService.update(mounts[STATUS_MOUNT_PATH], newShipment.status, shipment.senderId, (err) => {
                        if (err)
                            return cb(err);
                        dsu.commitBatch((err) => {
                            if(err)
                                return cb(err);
                            self.get(keySSI, callback);
                        });
                    });
                });



            })
        } else {
            return callback(`Not implemented`);
        }
    }

    /**
     * Creates OrderLines DSUs for each orderLine in shipment
     * @param {Shipment} shipment
     * @param {function} callback
     * @param {KeySSI} statusSSI keySSI to the OrderStatus DSU
     * @return {Object[]} keySSIs
     */
    let createShipmentLines = function (shipment, statusSSI, callback) {
        let shipmentLines = [];

        statusSSI = statusSSI.derive();
        let iterator = function (shipment, items, callback) {
            let shipmentLine = items.shift();
            if (!shipmentLine)
                return callback(undefined, shipmentLines);
            shipmentLineService.create(shipment.shipmentId, shipmentLine, statusSSI, (err, keySSI) => {
                if (err)
                    return callback(err);
                shipmentLines.push(keySSI);
                iterator(shipment, items, callback);
            });
        }
        // the slice() clones the array, so that the shitf() does not destroy it.
        iterator(shipment, shipment.shipmentLines.slice(), callback);
    }

    /**
     * Creates the ShipmentCodeDSU for the shipment
     * @param {Shipment} shipment
     * @param {function} callback
     * @param {KeySSI} statusSSI keySSI to the OrderStatus DSU
     * @return {Object[]} keySSIs
     */
    let createShipmentCode = function (shipment, statusSSI, callback) {
        let shipmentLines = [];

        statusSSI = statusSSI.derive();
        let iterator = function (shipment, items, callback) {
            let shipmentLine = items.shift();
            if (!shipmentLine)
                return callback(undefined, shipmentLines);
            shipmentLineService.create(shipment.shipmentId, shipmentLine, statusSSI, (err, keySSI) => {
                if (err)
                    return callback(err);
                shipmentLines.push(keySSI);
                iterator(shipment, items, callback);
            });
        }
        // the slice() clones the array, so that the shitf() does not destroy it.
        iterator(shipment, shipment.shipmentLines.slice(), callback);
    }
}

module.exports = ShipmentService;
},{"../../pdm-dsu-toolkit/services/strategy":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/services/strategy.js","../../pdm-dsu-toolkit/services/utils":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/services/utils.js","../commands/setProductSSI":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/commands/setProductSSI.js","../commands/setShipmentSSI":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/commands/setShipmentSSI.js","../constants":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/constants.js","../model":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/index.js","./ShipmentCodeService":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/services/ShipmentCodeService.js","./ShipmentLineService":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/services/ShipmentLineService.js","./StatusService":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/services/StatusService.js"}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/services/StatusService.js":[function(require,module,exports){
const utils = require('../../pdm-dsu-toolkit/services/utils');
const {INFO_PATH, LOG_PATH, EXTRA_INFO_PATH} = require('../constants');
const Status = require('../model/Status');

/**
 * @param {string} domain: anchoring domain. defaults to 'default'
 * @param {strategy} strategy
 * @function BatchService
 * @memberOf Services
 */
function StatusService(domain, strategy){
    const strategies = require("../../pdm-dsu-toolkit/services/strategy");
    const OrderStatus = require('../model').OrderStatus;
    const endpoint = 'status';

    domain = domain || "default";
    let isSimple = strategies.SIMPLE === (strategy || strategies.SIMPLE);

    let selectMethod = function(templateKeySSI){
        if (templateKeySSI.getTypeName() === 'array')
            return utils.getResolver().createDSUForExistingSSI;
        return utils.getResolver().createDSU;
    }

    let createLog = function(id, prevStatus, status, timestamp){
        const ts = timestamp ? timestamp : Date.now();
        return prevStatus
                ? `${id} ${ts} updated status from ${prevStatus.status || prevStatus} to ${status.status || status}`
                : `${id} ${ts} set status to ${status.status || status}`;
    }

    const createExtraInfo = function (id, extraInfo, timestamp) {
        return `${id} ${timestamp ? timestamp : Date.now()} ${extraInfo ? extraInfo : ''}`
    }

    /**
     * Resolves the DSU and loads the status object with all its properties, mutable or not
     * @param {KeySSI} keySSI
     * @param {function(err, Status, Archive)} callback
     */
    this.get = function(keySSI, callback){
        utils.getResolver().loadDSU(keySSI, (err, dsu) => {
            if (err)
                return callback(err);
            dsu.readFile(INFO_PATH, (err, data) => {
                if (err)
                    return callback(err);
                let status;

                try{
                    status = JSON.parse(data);
                } catch (e){
                    return callback(`Could not parse status in DSU ${keySSI.getIdentifier()}`);
                }

                // console.log('@@ StatusService.get status=', status);

                dsu.readFile(LOG_PATH, (err, log) => {
                    if (err)
                        return callback(err);
                    try {
                        log = JSON.parse(log);
                        // console.log('@@ StatusService.get log=', log);
                    } catch (e){
                        return callback(e);
                    }
                    if (!Array.isArray(log))
                        return callback(`Invalid log data`);

                    const returnFunc = function(extraInfo){
                        const _status = new Status({
                            status: status,
                            log: log,
                            extraInfo: extraInfo
                        });
                        return callback(undefined, _status, dsu);
                    }

                    dsu.readFile(EXTRA_INFO_PATH, (err, extraInfo) => {
                        if (err || !extraInfo)
                            return returnFunc();
                        try{
                            extraInfo = JSON.parse(extraInfo);
                        } catch(e){
                            return callback(e);
                        }
                        returnFunc(extraInfo);
                    });
                });
            });
        });
    }

    const createStatus = function(status, id, oldStatus){
        let log = createLog(id, oldStatus, status);
        return new Status({
            status: status,
            log: [log]
        });
    }

    const parseStatus = function(status, id, oldStatus){
        if (typeof status === 'string')
            return createStatus(status, id, oldStatus);
        if (status instanceof Status)
            return status;
        return new Status(status);
    }

    /**
     * Creates aC Status DSU
     * @param {OrderStatus|ShipmentStatus|Status} status
     * @param {String} id the sender id
     * @param {function} callback
     * @return {string} keySSI
     */
    this.create = function(status, id, callback){
        if (!callback){
            callback = id;
            id = undefined
        } else {
            status = parseStatus(status, id);
        }

        if (isSimple){
            let keyGenFunction = require('../commands/setStatusSSI').createStatusSSI;
            let keySSI = keyGenFunction(status, domain);
            selectMethod(keySSI)(keySSI, (err, dsu) => {
                if (err)
                    return callback(err);

                const cb = function(err, ...results){
                    if (err)
                        return dsu.cancelBatch(err2 => {
                            callback(err);
                        });
                    callback(undefined, ...results);
                }

                try {
                    dsu.beginBatch();
                } catch (e) {
                    return callback(e);
                }            

                dsu.writeFile(INFO_PATH, JSON.stringify(status.status), (err) => {
                    if (err)
                        return cb(err);

                    const returnFunc = function(err){
                        if (err)
                            return cb(err);

                        dsu.commitBatch((err) => {
                            if (err)
                                return cb(err);
                            dsu.getKeySSIAsObject(callback);
                        });
                    }

                    dsu.writeFile(LOG_PATH, JSON.stringify(status.log), returnFunc);
                });
            });
        } else {
            return callback(`Not implemented`);
        }
    };

    this.update = function(keySSI, status, id, callback){

        if (!callback){
            callback = id;
            id = undefined
        } else {
            status = parseStatus(status, id);
        }

        if (isSimple){
            keySSI = utils.getKeySSISpace().parse(keySSI);
            utils.getResolver().loadDSU(keySSI.getIdentifier(), {skipCache: true}, (err, dsu) => {
                if (err)
                    return callback(err);
                dsu.readFile(INFO_PATH, (err, prevStatus) => {
                    if (err)
                        return callback(err);
                    try{
                        prevStatus = JSON.parse(prevStatus);
                    } catch (e){
                        return callback(e);
                    }

                    status = parseStatus(status, id, prevStatus);

                    let stringified;
                    try{
                        stringified = JSON.stringify(status.status);
                    } catch (e){
                        return callback(e);
                    }

                    const cb = function(err, ...results){
                        if (err)
                            return dsu.cancelBatch(err2 => {
                                callback(err);
                            });
                        callback(undefined, ...results);
                    }

                    try {
                        dsu.beginBatch();
                    } catch (e) {
                        return callback(e);
                    }

                    dsu.writeFile(INFO_PATH, stringified, (err) => {
                        if (err)
                            return cb(err);

                        const returnFunc = function(err){
                            if (err)
                                return cb(err);
                            dsu.commitBatch((err) => {
                                if (err)
                                    return cb(err);
                                dsu.getKeySSIAsObject(callback);
                            });
                        }

                        const timestamp = Date.now()
                        let log = createLog(id, prevStatus, status, timestamp);

                        dsu.readFile(LOG_PATH, (err, data) => {
                            if (err)
                                return cb(err);
                            try {
                                data = JSON.parse(data);
                            } catch (e){
                                return cb(e);
                            }
                            if (!Array.isArray(data))
                                return cb(`Invalid data Types`);
                            dsu.writeFile(LOG_PATH, JSON.stringify([...data, log]), (err) => {
                                if (err)
                                    return cb(err);
                                dsu.readFile(EXTRA_INFO_PATH, (err, extraInfo) => {
                                    if (err)
                                        extraInfo = {};
                                    else {
                                        try {
                                            extraInfo = JSON.parse(extraInfo);
                                        } catch (e){
                                            return cb(err);
                                        }
                                    }

                                    if (!status.extraInfo)
                                        return returnFunc();

                                    if (typeof status.extraInfo === 'object') {
                                        const extraInfoStatusArray = status.extraInfo[status.status];
                                        const lastElement = extraInfoStatusArray === undefined ? '' : extraInfoStatusArray.pop();
                                        if (extraInfo[status.status])
                                            extraInfo[status.status].push(createExtraInfo(id, lastElement, timestamp))
                                        else
                                            extraInfo[status.status] = [createExtraInfo(id, lastElement, timestamp)];
                                    } else if (extraInfo.hasOwnProperty(status.status)) {
                                        extraInfo[status.status].push(createExtraInfo(id, status.extraInfo, timestamp))
                                    } else {
                                        extraInfo[status.status] = [createExtraInfo(id, status.extraInfo, timestamp)]
                                    }
                                    dsu.writeFile(EXTRA_INFO_PATH, JSON.stringify(extraInfo), returnFunc);
                                });
                            });
                        });
                    });
                });

            });
        } else {
            return callback(`Not implemented`);
        }
    }
}

module.exports = StatusService;
},{"../../pdm-dsu-toolkit/services/strategy":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/services/strategy.js","../../pdm-dsu-toolkit/services/utils":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/services/utils.js","../commands/setStatusSSI":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/commands/setStatusSSI.js","../constants":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/constants.js","../model":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/index.js","../model/Status":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/Status.js"}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/services/StockManagementService.js":[function(require,module,exports){
const ShipmentLineStatus = require('../model/ShipmentLineStatus');

/**
 * @param {string} requesterId
 * @param {string || string[]} partnersId
 * @param {StockManager} stockManager
 * @param {ShipmentLineManager} shipmentLineManager
 * @param {ReceiptManager} receiptManager
 * @function TraceabilityService
 * @memberOf Services
 */
function StockManagementService(requesterId, partnersId, stockManager, shipmentLineManager, receiptManager) {

    const addToStock = (stock, addValue) => {
        stock = !!stock ? stock : {inStock: 0, dispatched: 0}
        return {
            inStock: stock.inStock + addValue,
            dispatched: stock.dispatched
        }
    }

    const removeFromStock = (stock, removeValue) => {
        stock = !!stock ? stock : {inStock: 0, dispatched: 0}
        return {
            inStock: stock.inStock - removeValue,
            dispatched: stock.dispatched + removeValue
        }
    }

    /**
     * Stock taking from ShipmentLines
     * @param query
     * @param {function(err, {})} _callback
     */
    const getStockFromPartners = (query, _callback) => {
        shipmentLineManager.getAll(true, {query, sort: 'dsc'}, (err, shipmentLines) => {
            if (err)
                return _callback(err)
            const partnersStock = shipmentLines.reduce((accum, currShipmentLine) => {
                const {requesterId, senderId, quantity} = currShipmentLine;
                /* considering only status == confirmed to add to the requester stock, else still on sender stock */
                if (currShipmentLine.status.status === ShipmentLineStatus.CONFIRMED) {
                    accum[requesterId] = addToStock(accum[requesterId], quantity)
                    accum[senderId] = removeFromStock(accum[senderId], quantity)
                } else {
                    accum[senderId] = addToStock(accum[senderId], quantity)
                }
                return accum;
            }, {});
            delete partnersStock[requesterId];
            _callback(undefined, partnersStock)
        })
    }

    /**
     * Stock taking from ShipmentLines and Receipts
     * @param { string }gtin
     * @param {string }batch
     * @param { function(err, {results})} callback
     */
    this.traceStockManagement = function (gtin, batch, callback) {
        if (!callback) {
            callback = batch;
            batch = undefined;
        }

        let query = ['__timestamp > 0', `gtin == ${gtin}`];
        query = batch ? [...query, `batch == ${batch}`] : [...query];

        stockManager.getOne(gtin, true, (err, stock) => {
            if (err)
                return callback(err)
            const {batches, ...stockInfo} = stock;
            let batchStock = {batchNumber: undefined}
            if (batch)
                batchStock = batches.find((_batch) => batch && _batch.batchNumber === batch);

            getStockFromPartners(query, (err, partnersStock) => {
                if (err)
                    return callback(err)

                partnersId = Array.isArray(partnersId) ? partnersId : (partnersId ? [partnersId] : [])
                if (partnersId.length > 0)
                    partnersStock = partnersId.reduce((accum, partnerId) => {
                        accum[partnerId] = partnersStock[partnerId];
                        return accum;
                    }, {});

                const addReceiptsToDispatched = (objAccum, objKeys, _callback) => {
                    const sellerId = objKeys.shift();
                    if (!sellerId)
                        return _callback(undefined, {...objAccum})
                    receiptManager.getAll(true, {query: [...query, `sellerId == ${sellerId}`], sort: 'dsc'}, (err, receipts) => {
                        if (err)
                            return _callback(err)
                        objAccum[sellerId] = removeFromStock(objAccum[sellerId], receipts.length);
                        addReceiptsToDispatched(objAccum, objKeys, _callback)
                    })
                }

                addReceiptsToDispatched({...partnersStock}, Object.keys(partnersStock), (err, result) => {
                    if (err)
                        return callback(err)
                    callback(undefined, {stock: stockInfo, batch: batchStock, partnersStock: result})
                })
            })
        })
    }
}

module.exports = StockManagementService;
},{"../model/ShipmentLineStatus":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/model/ShipmentLineStatus.js"}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/services/TraceabilityService.js":[function(require,module,exports){
class Node {
    id = '';
    title = '';
    parents = undefined;
    children = undefined;

    constructor(node) {
        if (typeof node !== undefined)
            for (let prop in node)
                if (node.hasOwnProperty(prop) && this.hasOwnProperty(prop))
                    this[prop] = node[prop];
    }
}


/**
 * @param {ShipmentLineManager} shipmentLineManager
 * @param {ReceiptManager} receiptManager
 * @param {string} requesterId
 * @function TraceabilityService
 * @memberOf Services
 */
function TraceabilityService(shipmentLineManager, receiptManager, requesterId){

    class IdTracker{
        count = 0;

        constructor(gtin, batch) {
            this.gtin = gtin;
            this.batch = batch;
        }

        getNext(){
            return ++this.count;
        }
    }

    const getAllShipmentsTo = function(node, tracker, callback){
        shipmentLineManager.getAll(true, {
            query: [
                '__timestamp > 0',
                `gtin == ${tracker.gtin}`,
                `batch == ${tracker.batch}`,
                `requesterId == ${node.title}`
            ],
            sort: 'dsc'
        }, (err, shipmentLines) => {
            if (err)
                return callback(err);
            console.log('$$ traceabilityService getShipmentLines=', shipmentLines);
            const senders = [... (new Set(shipmentLines.map(sl => sl.senderId)))];
            callback(undefined, senders.map(s => {
                return new Node({
                    id: tracker.getNext(),
                    title: s
                });
            }));
        });
    }

    const trackFromNode = function(node, tracker, callback){

        const nodePool = {};
        let lastNode = undefined;

        const addToPool = function(node){
            if (node.title in nodePool){
                const n = nodePool[node];
                n.children = n.children || [];
                n.parents = n.parents || [];
                nodePool[node.title].children.push(...(node.children || []));
                nodePool[node.title].parents.push(...(node.parents || []));
                return nodePool[node.title];
            }

            if (!node.parents || !node.parents.length)
                lastNode = node;

            nodePool[node.title] = node;
            return node;
        }

        addToPool(node)

        const nodeIterator = function(nodes, callback){
            const node = nodes.shift();
            if (!node)
                return callback();

            getAllShipmentsTo(node, tracker, (err, parentNodes) => {
                if (err)
                    return callback(err);
                if (!parentNodes || !parentNodes.length)
                    return nodeIterator(nodes, callback);

                parentNodes = parentNodes.map(pn => {
                    pn.children = pn.children || [];
                    pn.children.push(node);
                    return addToPool(pn);
                });

                node.parents = parentNodes;

                nodeIterator(parentNodes.slice(), callback);
            });
        }

        nodeIterator([node], (err) => {
            if (err)
                return callback(err);

            callback(undefined, node, lastNode);
        });
    }

    /**
     *
     * @param {IndividualProduct} product
     * @param {function(err?, Node?, Node?)} callback
     */
    this.fromProduct = function(product, callback){
        const {gtin, batchNumber, serialNumber} = product;
        const idTracker = new IdTracker(gtin, batchNumber);
        const productKey = receiptManager._genCompostKey(product);

        receiptManager.getOne(productKey, true, (err, product) => {
            if (err)
                return callback(`No information available`);
            const endNode = new Node({
                id: idTracker.getNext(),
                title: product.sellerId,
                description: 'This is a description'
            });

            trackFromNode(endNode, idTracker,(err, startNode, endNode) => {
                if (err)
                    return callback(err);
                callback(undefined, startNode, endNode);
            });
        });
    }

    this.fromBatch = function(product, callback){
        const {gtin, batchNumber} = product;
        const idTracker = new IdTracker(gtin, batchNumber);

        const endNode = new Node({
            id: idTracker.getNext(),
            title: requesterId,
            description: 'This is a description'
        });

        trackFromNode(endNode, idTracker,(err, startNode, endNode) => {
            if (err)
                return callback(err);
            callback(undefined, startNode, endNode);
        });
    }

}

module.exports = TraceabilityService;
},{}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/services/index.js":[function(require,module,exports){
/**
 * Integrates with OpenDSU Framework to create/manage DSU's while exposing a simple CRUD like API
 * @namespace Services
 */
module.exports = {
    DSUService: require('../../pdm-dsu-toolkit/services/DSUService'),
    WebcLocaleService: require("../../pdm-dsu-toolkit/services/WebcLocaleService"),
    WebComponentService: require("../../pdm-dsu-toolkit/services/WebComponentService"),
    OrderService: require("./OrderService"),
    ShipmentService: require("./ShipmentService"),
    ShipmentLineService: require('./ShipmentLineService'),
    StatusService: require("./StatusService"),
    ProductService: require("./ProductService"),
    BatchService: require("./BatchService"),
    SaleService: require('./SaleService'),
    Strategy: require("../../pdm-dsu-toolkit/services/strategy"),
    StockManagement: require("./StockManagementService"),
    IndividualProductService: require('./IndividualProductService'),
    TraceabilityService: require('./TraceabilityService'),
    utils: require('../../pdm-dsu-toolkit/services/utils')
}
},{"../../pdm-dsu-toolkit/services/DSUService":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/services/DSUService.js","../../pdm-dsu-toolkit/services/WebComponentService":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/services/WebComponentService.js","../../pdm-dsu-toolkit/services/WebcLocaleService":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/services/WebcLocaleService.js","../../pdm-dsu-toolkit/services/strategy":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/services/strategy.js","../../pdm-dsu-toolkit/services/utils":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/services/utils.js","./BatchService":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/services/BatchService.js","./IndividualProductService":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/services/IndividualProductService.js","./OrderService":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/services/OrderService.js","./ProductService":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/services/ProductService.js","./SaleService":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/services/SaleService.js","./ShipmentLineService":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/services/ShipmentLineService.js","./ShipmentService":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/services/ShipmentService.js","./StatusService":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/services/StatusService.js","./StockManagementService":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/services/StockManagementService.js","./TraceabilityService":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/services/TraceabilityService.js"}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/version.js":[function(require,module,exports){
// IMPORTANT: THIS FILE IS AUTO GENERATED BY bin/version.js - DO NOT MANUALLY EDIT OR CHECKIN!
const VERSION = {
    "dirty": false,
    "raw": "v0.8.6-11-g745e3f39",
    "hash": "g745e3f39",
    "distance": 11,
    "tag": "v0.8.6",
    "semver": {
        "options": {
            "loose": false,
            "includePrerelease": false
        },
        "loose": false,
        "raw": "v0.8.6",
        "major": 0,
        "minor": 8,
        "patch": 6,
        "prerelease": [],
        "build": [],
        "version": "0.8.6"
    },
    "suffix": "11-g745e3f39",
    "semverString": "0.8.6+11.g745e3f39",
    "version": "0.8.7"
};

module.exports = VERSION;

},{}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/commands/setSSI.js":[function(require,module,exports){
/**
 * Registers with the DSU Wizard the provided endpoints for the various DSU types
 * @param {HttpServer} server  the server object
 * @param {string} endpoint  the endpoint to be registered
 * @param {function} factoryMethod  the method that receives a data object with the parameters required to generate the keyssi, and is responsible for the creation of the DSU
 * @param {string} methodName   the name of the method to be registered in the DSU Wizard? - Should match the method name that is calling it?
 * @param {string} [domain] domain where to anchor the DSU - defaults to 'default'
 * @function setSSI
 * @memberOf Server
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

},{"dsu-wizard":false}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/constants.js":[function(require,module,exports){
/**
 * Constants
 * @namespace Constants
 */

/**
 * default info writing path in DSU's since you can't write to '/'
 * @memberOf Constants
 */
const INFO_PATH = '/info';

/**
 * Default mount path for the participant const under the PDM SSApp Architecture
 * @memberOf Constants
 */
const PARTICIPANT_MOUNT_PATH = "/participant";

/**
 * Default mount path for the Id DSU under the PDM SSApp Architecture
 * @memberOf Constants
 */
const IDENTITY_MOUNT_PATH = '/id'

const DATABASE_MOUNT_PATH = '/db'

const DID_METHOD = 'ssi:name';
const DID_DOMAIN = 'traceability';

const MESSAGE_REFRESH_RATE = 1000;
const MESSAGE_TABLE = 'messages'

/**
 * Default Query options to be used by the managers to query the database
 * @type {{query: string[]|undefined, limit: number|undefined, sort: string|undefined}}
 * @memberOf Constants
 */
const DEFAULT_QUERY_OPTIONS = {
    query: ["__timestamp > 0"],
    sort: "dsc",
    limit: undefined
}

const INPUT_FIELD_PREFIX = 'input-'

module.exports = {
    INFO_PATH,
    PARTICIPANT_MOUNT_PATH,
    IDENTITY_MOUNT_PATH,
    DATABASE_MOUNT_PATH,
    DID_METHOD,
    DID_DOMAIN,
    MESSAGE_REFRESH_RATE,
    MESSAGE_TABLE,
    DEFAULT_QUERY_OPTIONS,
    INPUT_FIELD_PREFIX
}
},{}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/managers/BaseManager.js":[function(require,module,exports){
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
        this.environment = undefined;
        this.sc = undefined;
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

            const loadSC = function(callback){
                self.getEnvironment((err, env) => {
                    if (err)
                        return callback(err);
                    const scApi = require('opendsu').loadApi('sc');
                    scApi.setMainDSU(self.rootDSU);
                    // self.sc.autoconfigFromEnvironment(env);
                    self.sc = scApi.refreshSecurityContext();
                    self.sc.on('initialised', async () => {
                        callback()
                    });
                })

            }

            const loadMessenger = function(callback){
                loadSC((err) => {
                    if (err)
                        return callback(err);
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
},{"../constants":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/constants.js","../services/utils":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/services/utils.js","./DBLock":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/managers/DBLock.js","./MessageManager":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/managers/MessageManager.js","opendsu":false}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/managers/DBLock.js":[function(require,module,exports){
/**
 * Simple Database Lock system to handle minor concurrency issues
 *
 * @class DBLock
 * @memberOf Managers
 **/
class DBLock {
    _cache = {};
    _storage;
    _allows = {};
    _schedule = [];
    _timeout = 10;

    /**
     * @param {*} db DSU Database implementation
     * @param {number} timeout timeout for scheduling operations in ms. defaults to 10ms
     * @constructor
     */
    constructor(db, timeout){
        this._storage = db;
        this._timeout = timeout || this._timeout;
        console.log(`Created DB Lock`);
    }

    /**
     * @param {string} tableName
     * @returns {boolean} the DB Status regarding that table
     */
    isLocked(tableName){
        return this._cache[tableName] && this._cache[tableName] !== -1;
    }

    /**
     * Schedules a method call for after the current db operation has benn finished
     * @param {function(): void} method
     */
    schedule(method){
        console.log(`Scheduling db method call...`)
        this._schedule.push(method);
    }

    /**
     * Allows a different manager to act in the current transaction
     * @param {string} tableName
     * @param {Manager} manager
     */
    allow(tableName, manager){
        const allowedTable = manager.tableName;
        if (this._allows[allowedTable])
            throw new Error(`Only one manager allowed`);

        this._allows[allowedTable] = tableName;
    }

    /**
     * Disallows a different manager to act in the current transaction
     * @param {string} tableName
     * @param {Manager} manager
     */
    disallow(tableName, manager){
        const allowedTable = manager.tableName;
        if (!this._allows[allowedTable])
            throw new Error(`Only no manager to disallow`);

        delete this._allows[allowedTable];
    }

    /**
     * Begins or continues a db batch operation depending if there's one in progress or not
     * @param {string} tableName
     * @throws {Error} error when a batch operation is already in progress
     */
    beginBatch(tableName){

        if (tableName in this._allows)
            tableName = this._allows[tableName]

        this._cache[tableName] = this._cache[tableName] || -1;

        if (this._cache[tableName] === -1){
            this._storage.beginBatch.call(this._storage);
            this._cache[tableName] = 1;
        } else {
            this._cache[tableName] += 1;
        }
    }

    /**
     * Checks is there are pending method calls and executes them in order
     * @private
     */
    _executeFromSchedule(){
        const method = this._schedule.shift();
        if (method){
            console.log(`Running scheduled db method call`);
            try {
                method();
            } catch (e) {
                console.log(`db method call failed. unshifting`, e);
                this._schedule.unshift(method);
            }
        }
    }

    /**
     * Commits or continues a db batch operation depending if the operation counter has run out
     * @param {string} tableName
     * @param {boolean} [force] when true forces the commit regardless of the counter. defaults to false
     * @param {function(err): void} callback
     */
    commitBatch(tableName, force, callback){
        if (!callback){
            callback = force;
            force = false;
        }

        if (tableName in this._allows)
            tableName = this._allows[tableName]

        if (this._cache[tableName] === -1)
            return callback();

        const self = this;

        this._cache[tableName] -= 1;
        if (force || this._cache[tableName] === 0){

            const cb = function(err){
                if (err)
                    return callback(err);
                if (self._schedule.length)
                    setTimeout(self._executeFromSchedule.bind(self), self._timeout);
                callback();
            }

            delete this._cache[tableName];
            this._allows = {};
            console.log(`Committing batch in ${tableName}`);
            return this._storage.commitBatch.call(this._storage, cb);
        }

        console.log(`Other Batch operations in progress in table ${tableName}. not committing just yet`)
        callback();
    }

    /**
     * Cancels the batch operation in progress
     * @param {string} tableName
     * @param {function(err): void} callback
     */
    cancelBatch(tableName, callback){
        if (this._cache[tableName] > 0){
            delete this._cache[tableName];
            return this._storage.cancelBatch.call(this._storage, callback);
        }
        callback();
    }
}

module.exports = DBLock;
},{}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/managers/Manager.js":[function(require,module,exports){
const { INFO_PATH , DEFAULT_QUERY_OPTIONS } = require('../constants');

const {functionCallIterator} = require('../services/utils');

const {Page, toPage, paginate } = require('./Page');

const SORT_OPTIONS = {ASC: "asc", DSC: 'dsc'}


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
 * #### _Manager SPECIFIC DataBase Access API (CRUD)_
 *
 * Methods:
 *  - {@link create} - Must be overwritten by child classes
 *  - {@link getOne}
 *  - {@link remove}
 *  - {@link update} - Should be overwritten by child classes
 *  - {@link getAll} - with querying capabilities via {@link DEFAULT_QUERY_OPTIONS} type configuration
 *  - {@link getPage} - paging and querying capabilities
 *
 * <strong>Assumes only reads/writes to {@link INFO_PATH} with JSON parsing to object</strong>
 * Otherwise the methods need to be overwritten by child classes.
 *
 * #### _Manager INDEPENDENT DataBase Access API_
 *
 * Methods:
 *  - {@link insertRecord}
 *  - {@link getRecord}
 *  - {@link deleteRecord}
 *  - {@link updateRecord}
 *  - {@link query} - with querying capabilities via {@link DEFAULT_QUERY_OPTIONS} type configuration
 *
 * @param {BaseManager} baseManager the base manager to have access to the identity api
 * @param {string} tableName the default table name for this manager eg: MessageManager will write to the messages table
 * @param {string[]} [indexes] a list of indexes to add to the table in the db upon initialization. requires a callback!
 * @param {function(err, Manager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * Not used in this class. Child classes must implement if this functionality is required like:
 * <pre>
 *              if (this.indexes && callback){
 *                  super._indexTable(...this.indexes, (err) => {
 *                      if (err)
 *                          return self._err(`Could not update Indexes`, err, callback);
 *                      console.log(`Indexes for table ${self.tableName} updated`);
 *                      callback(undefined, self);
 *                  });
 *              }
 * </pre>
 * @memberOf Managers
 * @class Manager
 * @abstract
 */
class Manager{
    /**
     * @param {BaseManager} baseManager
     * @param {string} tableName the name of the table this manager handles
     * @param {string[]} indexes the indexes to be added to the table
     * @param {function(err, Manager)} [callback] optional callback for better application flow control
     * @constructor
     */
    constructor(baseManager, tableName, indexes, callback){
        let self = this;
        this.storage = baseManager.db;
        this.dbLock = baseManager.dbLock;

        this.getStorage = () => {
            if (!self.storage){
                self.storage = baseManager.db;
                self.dbLock = baseManager.dbLock;
            }
            if (!self.storage)
                throw new Error(`DB is not initialized`);
            return self.storage;
        }
        this.tableName = tableName;
        this.indexes = indexes;
        this.controllers = undefined;
        this.getIdentity = baseManager.getIdentity.bind(baseManager);
        this.getEnvironment = baseManager.getEnvironment.bind(baseManager);
        this._getResolver = baseManager._getResolver;
        this._getKeySSISpace = baseManager._getKeySSISpace;
        this._loadDSU = baseManager._loadDSU;
        this._err = baseManager._err;
        this._sendMessage = function(did, api, message, callback){
            if (!callback){
                callback = message;
                message = api;
                api = this.tableName;
            }
            return baseManager.sendMessage(did, api, message, callback);
        }
        this._deleteMessage = function(message, callback){
            return baseManager.deleteMessage(message, callback);
        }
        this._getMessages = function(callback){
            return baseManager.getMessages(this.tableName, callback);
        }
        this._registerMessageListener = function(listener){
            return baseManager.registerMessageListener(this.tableName, listener);
        }
        baseManager.cacheManager(this);

        this._getManager = baseManager.getManager.bind(baseManager);

        if (this.indexes && callback){
            this._indexTable(...this.indexes, (err) => {
                if (err)
                    return self._err(`Could not update Indexes`, err, callback);
                console.log(`Indexes for table ${self.tableName} updated`);
                callback(undefined, self);
            });
        } else if (callback)
            callback(undefined, self);

    }

    /**
     * Util method to give optional access to the controller for event sending purposes
     * and UI operations when required eg: refresh the view.
     *
     * Accepts multiple calls (with keep the reference to all controllers)
     * @param {LocalizedController} controller
     */
    bindController(controller){
        this.controllers = this.controllers || [];
        this.controllers.push(controller);
    }

    /**
     * Util method to give optional access to the controller to be able to refresh the view
     * (will call the refresh method on all binded controllers via {@link Manager#bindController})
     * @param {{}} [props] option props to pass to the controllers refresh method
     */
    refreshController(props){
        if (this.controllers)
            this.controllers.forEach(c => c.refresh(props));
    }

    getEnvironment(callback){};

    beginBatch(){
        this.dbLock.beginBatch(this.tableName);
    }

    commitBatch(force, callback){
        this.dbLock.commitBatch(this.tableName, force, callback);
    }

    cancelBatch(callback){
        this.dbLock.cancelBatch(this.tableName, callback);
    }

    batchAllow(allowedManager){
        this.dbLock.allow(this.tableName, allowedManager);
    }

    batchDisallow(allowedManager){
        this.dbLock.disallow(this.tableName, allowedManager);
    }

    batchSchedule(method){
        this.dbLock.schedule(method);
    }

    /**
     * Should be called by child classes if then need to index the table.
     * (Can't be called during the constructor of the Manager class due to the need of virtual method
     * @param {string|function} props the last argument must be the callback. The properties passed
     * must match the ones provided in {@link Manager#_indexItem} for this to work properly.
     *
     * callback receives the newly created indexes as the second argument
     * @private
     */
    _indexTable(...props){
        if (!Array.isArray(props))
            throw new Error(`Invalid properties provided`);
        const callback = props.pop();
        props.push('__timestamp');
        const self = this;
        const storage = self.getStorage();


        const innerBeginBatch = function(callback){

            try {
                self.beginBatch();
            } catch (e){
                return self.batchSchedule(() => self._indexItem.call(self, ...props));
                // return callback(e)
            }
            callback();
        }

        const errCb = function(message, err, callback){
            self.cancelBatch(err2 => {
                if (err2)
                    return self._err(`Could not cancelBatch over error: ${message}`, err2, callback);
                self._err(message, err, callback);
            });
        }

        storage.getIndexedFields(self.tableName, (err, indexes) => {
            if (err)
                return errCb(`Could not retrieve indexes from table ${self.tableName}`, err, callback);

            const newIndexes = [];
            const indexIterator = function(propsClone, callback){
                const index = propsClone.shift();
                if (!index)
                    return callback(undefined, newIndexes);
                if (indexes.indexOf(index) !== -1)
                    return indexIterator(propsClone, callback);
                innerBeginBatch((err) => {
                    if (err)
                        return errCb('Could not start batch Mode', err, callback);
                    storage.addIndex(self.tableName, index, (err) => {
                        if (err)
                            return errCb(`Could not retrieve indexes from table ${self.tableName}`, err, callback);

                        newIndexes.push(index);
                        indexIterator(propsClone, callback);
                    });
                })

            }

            indexIterator(props.slice(), (err, updatedIndexes) => {
                if (err)
                    return errCb(`Could not update indexes for table ${self.tableName}`, err, callback);
                if (!updatedIndexes.length)
                    return callback(undefined, updatedIndexes);
                self.commitBatch(true, (err) => {
                    if (err)
                        return errCb(`Indexes committed for table ${self.tableName}`, err, callback);
                    callback(undefined, updatedIndexes);
                });
            });
        });
    }

    /**
     * Send a message to the specified DID
     * @param {string|W3cDID} did
     * @param {string} [api] defaults to the tableName
     * @param {string} message
     * @param {function(err)} callback
     */
    sendMessage(did, api, message, callback){
        return this._sendMessage(did, api, message, callback);
    }

    /**
     * Because Message sending is implemented as fire and forget (for the user experience)
     * we need an async callback that might hold some specific logic
     *
     * Meant to be overridden by subclasses when needed
     * @param err
     * @param args
     * @protected
     */
    _messageCallback(err, ...args){
        if (err)
            return console.log(err);
        console.log(...args);
    }

    /**
     * Send a message to the specified DID
     * @param {string|W3cDID} did
     * @param {string} [api] defaults to the tableName
     * @param {string} message
     * @param {function(err)} callback
     */
    _sendMessage(did, api, message, callback){}

    /**
     * @see _registerMessageListener
     */
    registerMessageListener(listener){
        return this._registerMessageListener(listener);
    }

    /**
     * Proxy call to {@link MessageManager#_registerMessageListener()}.
     * @see BaseManager
     */
    _registerMessageListener(listener){}

    /**
     * @see _deleteMessage
     */
    deleteMessage(message, callback) {
        return this._deleteMessage(message, callback);
    }

    /**
     * Proxy call to {@link MessageManager#deleteMessage()}.
     * @see BaseManager
     */
    _deleteMessage(message, callback) {}

    /**
     * @see _getMessages
     */
    getMessages(callback){
        return this._getMessages(callback);
    }

    /**
     * Proxy call to {@link MessageManager#getMessages()} using tableName as the api value.
     */
    _getMessages(callback){}

    /**
     * Processes the received messages, saves them to the the table and deletes the message
     * @param record
     * @param {function(err)} callback
     */
    processMessageRecord(record, callback) {
        let self = this;
        // Process one record. If the message is broken, DO NOT DELETE IT, log to console, and skip to the next.
        console.log(`Processing record`, record);
        if (record.__deleted)
            return callback("Skipping deleted record.");

        if (!record.api || record.api !== this._getTableName())
            return callback(`Message record ${record} does not have api=${this._getTableName()}. Skipping record.`);

        self._processMessageRecord(record.message, (err) => {
            if (err)
                return self._err(`Record processing failed: ${JSON.stringify(record)}`, err, callback);
            // and then delete message after processing.
            console.log("Going to delete messages's record", record);
            self.deleteMessage(record, (err) => {
                if (err)
                    console.log(`Could not delete message. THis usually means there are two instances of this Application running and might cause problems with data integrity`);
                callback(undefined);
            });
        });
    };

    /**
     * Processes the received messages, for the presumed api (tableName)
     * Each child class must implement this behaviour if desired
     * @param {*} message
     * @param {function(err)} callback
     * @private
     */
    _processMessageRecord(message, callback){
        callback(`Message processing is not implemented for ${this.tableName}`);
    }

    /**
     *
     * @param records
     * @param callback
     * @return {*}
     * @private
     */
    _iterateMessageRecords(records, callback) {
        let self = this; 
        if (!records || !Array.isArray(records))
            return callback(`Message records ${records} is not an array!`);
        if (records.length <= 0)
            return callback(); // done without error
        const record0 = records.shift();
        self.processMessageRecord(record0, (err) => {
            if (err)
                console.log(err);
            self._iterateMessageRecords(records, callback);
        });
    };

    /**
     * Process incoming, looking for receivedOrder messages.
     * @param {function(err)} callback
     */
    processMessages(callback) {
        let self = this;
        console.log("Processing messages");
        self.getMessages((err, records) => {
            console.log("Processing records: ", err, records);
            if (err)
                return callback(err);
            let messageRecords = [...records]; // clone for iteration with shift()
            self._iterateMessageRecords(messageRecords, callback);
        });
    }

    /**
     * Stops the message service listener when it is running
     */
    shutdownMessenger(){
        if(!this.messenger)
            return console.log(`No message listener active`);
        this.messenger.shutdown();
    }

    /**
     * Lazy loads the db
     * Is created in the constructor
     */
    getStorage(){};

    /**
     * @param {object} object the business model object
     * @param model the Controller's model object
     * @returns {{}}
     */
    toModel(object, model){
        model = model || {};
        for (let prop in object) {
            prop = typeof prop === 'number' ? '' + prop : prop;
            if (object.hasOwnProperty(prop)) {
                if (!model[prop])
                    model[prop] = {};
                model[prop].value = object[prop];
            }
        }
        return model;
    }

    /**
     * Should translate the Controller Model into the Business Model
     * @param model the Controller's Model
     * @returns {object} the Business Model object ready to feed to the constructor
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
     * will be binded as the one from participant manager on initialization
     * @param {function(err, identity)} callback
     */
    getIdentity(callback){};

    /**
     * will be binded as the one from participant manager on initialization
     */
    _getResolver(){};

    /**
     * will be binded as the one from participant manager on initialization
     */
    _getKeySSISpace(){};

    /**
     * will be binded as the one from participant manager on initialization
     * @param {string|KeySSI} keySSI
     */
    _loadDSU(keySSI){};
    /**
     * Wrapper around OpenDSU's error wrapper
     * @param {string} message
     * @param {err} err
     * @param {function(err, ...args)} callback
     * @protected
     * @see _err
     */
    _err(message, err, callback){};

    /**
     * @return {string} the tableName passed in the constructor
     * @throws {Error} if the manager has no tableName
     * @protected
     */
    _getTableName(){
        if (!this.tableName)
            throw new Error('No table name specified');
        return this.tableName;
    }

    /**
     * Util function that loads a dsu and reads and JSON parses from the dsu's {@link INFO_PATH}
     * @param {string|KeySSI} keySSI
     * @param {function(err, any, Archive, KeySSI)} callback. object is the /info parsed as JSON.
     * @protected
     */
    _getDSUInfo(keySSI, callback){
        let self = this;
        self._loadDSU(keySSI, (err, dsu) => {
            if (err)
                return self._err(`Could not load record DSU: ${keySSI}`, err, callback);
            dsu.readFile(INFO_PATH, (err, data) => {
                if (err)
                    return self._err(`Could not read file at ${INFO_PATH}`, err, callback);
                try{
                    data = JSON.parse(data);
                } catch (e) {
                    return self._err(`Could not parse dsu data ${data.toString()}`, err, callback);
                }
                callback(undefined, data, dsu, keySSI);
            });
        });
    }

    /**
     * Util iterator function
     * @param {string[]} records
     * @param {function(string, function(err, result))} getter
     * @param {result[]} [accumulator] defaults to []
     * @param {function(err, result[])} callback
     * @protected
     */
    _iterator(records, getter, accumulator, callback){
        if (!callback) {
            callback = accumulator;
            accumulator = [];
        }
        let self = this;
        const record = records.shift();
        if (!record) {
            console.log(`Found ${accumulator.length} items from records ${records}`);
            return callback(undefined, accumulator);
        }
        getter(record, (err, product) => {
            if (err)
                return self._err(`Could not get product`, err, callback);
            accumulator.push(product);
            return self._iterator(records, getter, accumulator, callback);
        });
    }

    /**
     * Creates a new item
     *
     * Child classes should override this so they can be called without the key param in Web Components
     * (and also to actually create the DSUs)
     *
     * @param {string} [key] key is optional so child classes can override them
     * @param {object} item
     * @param {function(err, object, Archive)} callback
     */
    create(key, item, callback) {
        callback(`The creation method is not implemneted for this Manager ${this.tableName}`);
    }

    /**
     * Creates several new items
     *
     * @param {string[]} keys key is optional so child classes can override them
     * @param {object[]} items
     * @param {function(err, object[]?, Archive[]?)} callback
     */
    createAll(keys, items, callback){
        let self = this;

        try {
            self.beginBatch();
        } catch(e) {
            return self.batchSchedule(() => self.createAll.call(self, keys, items, callback));
        }


        functionCallIterator(this.create.bind(this), keys, items, (err, results) => {
            if (err)
                return self.cancelBatch((err2) => {
                    self._err(`Could not update all records`, err, callback);
                });

            self.commitBatch((err) => {
                if (err)
                    return self.cancelBatch((err2) => {
                        callback(err)
                    });
                callback(undefined, ...results);
            });
        });
    }
    /**
     * Must wrap the entry in an object like:
     * <pre>
     *     {
     *         index1: ...
     *         index2: ...
     *         value: item
     *     }
     * </pre>
     * so the DB can be queried by each of the indexes and still allow for lazy loading
     * @param {string} key
     * @param {object|string} [item]
     * @param {string|object} record
     * @return {any} the indexed object to be stored in the db
     * @protected
     */
    _indexItem(key, item, record){
        if (!record){
            record = item;
            item = undefined
        }
        return {
            key: key,
            value: record
        }
    };

    /**
     * reads ssi for that gtin in the db. loads is and reads the info at '/info'
     * @param {string} key
     * @param {boolean} [readDSU] defaults to true. decides if the manager loads and reads from the dsu or not
     * @param {function(err, object
     * |KeySSI, Archive)} callback returns the Product if readDSU and the dsu, the keySSI otherwise
     */
    getOne(key, readDSU,  callback) {
        if (!callback){
            callback = readDSU;
            readDSU = true;
        }
        let self = this;
        self.getRecord(key, (err, record) => {
            if (err)
                return self._err(`Could not load record with key ${key} on table ${self._getTableName()}`, err, callback);
            if (!readDSU)
                return callback(undefined, record.value || record);
            self._getDSUInfo(record.value || record, callback);
        });
    }

    /**
     * reads ssi for that gtin in the db. loads is and reads the info at '/info'
     * @param {string} key
     * @param {function(err, object
     * |KeySSI, Archive?)} callback returns the Product if readDSU and the dsu, the keySSI otherwise
     */
    getOneStripped(key,  callback) {
        let self = this;
        self.getRecord(key, (err, record) => {
            if (err)
                return self._err(`Could not load record with key ${key} on table ${self._getTableName()}`, err, callback);
            delete record.pk;
            delete record.__timestamp;
            delete record.__version ;
            callback(undefined, record);
        });
    }

    /**
     * Removes a product from the list (does not delete/invalidate DSU, simply 'forgets' the reference)
     * @param {string|number} key
     * @param {function(err)} callback
     */
    remove(key, callback) {
        let self = this;
        self.deleteRecord(key, callback);
    }

    /**
     * updates an item
     *
     * @param {string} [key] key is optional so child classes can override them
     * @param {object} newItem
     * @param {function(err, object, Archive)} callback
     */
    update(key, newItem, callback){
        if (!callback){
            callback = newItem;
            newItem = key;
            key = undefined;
            return callback(`No key Provided...`);
        }
        callback('Child classes must implement this');
    }

    /**
     * updates a bunch of items
     *
     * @param {string[]} [keys] key is optional so child classes can override them
     * @param {object[]} newItems
     * @param {function(err, object[], Archive[])} callback
     */
    updateAll(keys, newItems, callback){
        if (!callback){
            callback = newItems;
            newItems = keys;
            keys = undefined;
            return callback(`No key Provided...`);
        }

        let self = this;

        try {
            self.beginBatch();
        } catch(e) {
            return self.batchSchedule(() => self.updateAll.call(self, keys, newItems, callback));
        }


        functionCallIterator(this.update.bind(this), keys, newItems, (err, results) => {
            if (err)
                return self.cancelBatch((err2) => {
                    self._err(`Could not update all records`, err, callback);
                });

            self.commitBatch((err) => {
                if (err)
                    return self.cancelBatch((err2) => {
                        callback(err)
                    });
                callback(undefined, ...results);
            });
        });
    }

    /**
     * Lists all registered items according to query options provided
     * @param {boolean} [readDSU] defaults to true. decides if the manager loads and reads from the dsu's {@link INFO_PATH} or not
     * @param {object} [options] query options. defaults to {@link DEFAULT_QUERY_OPTIONS}
     * @param {function(err, object[])} callback
     */
    getAll(readDSU, options, callback) {
        if (!callback){
            if (!options){
                callback = readDSU;
                options = DEFAULT_QUERY_OPTIONS;
                readDSU = true;
            }
            if (typeof readDSU === 'boolean'){
                callback = options;
                options = DEFAULT_QUERY_OPTIONS;
            }
            if (typeof readDSU === 'object'){
                callback = options;
                options = readDSU;
                readDSU = true;
            }
        }

        options = options || DEFAULT_QUERY_OPTIONS;

        let self = this;
        self.query(options.query, options.sort, options.limit, (err, records) => {
            if (err)
                return self._err(`Could not perform query`, err, callback);
            if (!readDSU)
                return callback(undefined, records.map(r => r.pk)); // return the primary key if not read DSU
            self._iterator(records.map(r => r.value), self._getDSUInfo.bind(self), (err, result) => {
                if (err)
                    return self._err(`Could not parse ${self._getTableName()}s ${JSON.stringify(records)}`, err, callback);
                console.log(`Parsed ${result.length} ${self._getTableName()}s`);
                callback(undefined, result);
            });
        });
    }

    /**
     * Converts the text typed in a general text box into the query for the db
     * Subclasses should override this
     * @param {string} keyword
     * @param queryConditions
     * @return {string[]} query
     * @protected
     */
    _keywordToQuery(keyword, queryConditions){
        if (!keyword)
            return [[...queryConditions, '__timestamp > 0']]
        return this.indexes.map((index) => {
            return [...queryConditions, `${index} like /${keyword}/g`, '__timestamp > 0']
        })
    }

    /**
     * Returns a page object from provided dsuQuery or a keyword
     * @param {number} itemsPerPage
     * @param {number} page
     * @param {string[]} dsuQuery: force a fixed CONDITION in all keyword query or for a simple query paginated.
     * @param {string} keyword:  keyword to search on all indexes
     * @param {string} sort
     * @param {boolean} readDSU
     * @param {function(err, Page)}callback
     */
    getPage(itemsPerPage, page, dsuQuery, keyword, sort, readDSU, callback){
        const self = this;
        let receivedPage = page || 1;
        sort = SORT_OPTIONS[(sort || SORT_OPTIONS.DSC).toUpperCase()] ? SORT_OPTIONS[(sort || SORT_OPTIONS.DSC).toUpperCase()] : SORT_OPTIONS.DSC;

        const getPageByDSUQuery = (itemsPerPage, page, dsuQuery, sort, readDSU, callback) => {
            const self = this;
            let receivedPage = page || 1;
            dsuQuery = [...dsuQuery, '__timestamp > 0'];
            self.getAll(readDSU, {query: dsuQuery, sort: sort,  limit: undefined}, (err, records) => {
                if (err)
                    return self._err(`Could not retrieve records to page`, err, callback);
                if (records.length === 0)
                    return callback(undefined, toPage(0, 0, records, itemsPerPage));

                if (records.length <= itemsPerPage)
                    return callback(undefined, toPage(1, 1, records, itemsPerPage));
                const page = paginate(records, itemsPerPage, receivedPage);
                callback(undefined, page);
            })
        }

        if(!keyword)
            return getPageByDSUQuery(itemsPerPage, page, dsuQuery, sort, readDSU, callback);

        const queries = self._keywordToQuery(keyword, dsuQuery);
        const iterator = (accum, queriesArray, _callback) => {
            const query = queriesArray.shift()
            if (!query)
                return _callback(undefined, accum)

            self.getAll(readDSU, {query, sort: sort,  limit: undefined}, (err, records) => {
                if (err)
                    _callback(err)
                iterator([...accum, ...records], queriesArray, _callback)
            })
        }

        iterator([], queries.slice(), (err, records) => {
            if (err)
                return self._err(`Could not retrieve records to page`, err, callback);
            if (records.length === 0)
                return callback(undefined, toPage(0, 0, records, itemsPerPage));

            // remove duplicates
            records = Object.values(
                records.reduce((accum, record) => {
                    const key = JSON.stringify(record);
                    if (!accum.hasOwnProperty(key)) {
                        accum[key] = record;
                    }
                    return accum
                }, {})
            );

            if (records.length <= itemsPerPage)
                return callback(undefined, toPage(1, 1, records, itemsPerPage));
            const page = paginate(records, itemsPerPage, receivedPage);
            callback(undefined, page);
        })
    }

    /**
     * Wrapper around the storage's insertRecord where the tableName defaults to the manager's
     * @param {string} [tableName] defaults to the manager's table name
     * @param {string} key
     * @param {object} record
     * @param {function(err)} callback
     */
    insertRecord(tableName, key, record, callback){
        if (!callback){
            callback = record;
            record = key;
            key = tableName;
            tableName = this._getTableName();
        }
        const self = this;
        console.log("insertRecord tableName="+tableName, "key", key, "record", record);

        try {
            self.beginBatch();
        } catch (e) {
            return self.batchSchedule(() => self.insertRecord.call(self, tableName, key, record, callback));
            // return callback(e);
        }

        this.getStorage().insertRecord(tableName, key, record, (err, ...results) => {
            if (err)
                return self.cancelBatch((err2) => {
                    self._err(`Could not insert record with key ${key} in table ${tableName}`, err, callback);
                });
            self.commitBatch((err) => {
                if (err)
                    return self.cancelBatch((err2) => {
                        callback(err)
                    });
                callback(undefined, ...results);
            });
        });
    }

    /**
     * Wrapper around the storage's updateRecord where the tableName defaults to the manager's
     * @param {string} [tableName] defaults to the manager's table name
     * @param {string} key
     * @param {*|string} newRecord
     * @param {function(err)} callback
     */
    updateRecord(tableName, key, newRecord, callback){
        if (!callback){
            callback = newRecord;
            newRecord = key;
            key = tableName;
            tableName = this._getTableName();
        }

        console.log("update Record tableName="+tableName, "key", key, "record", newRecord);
        const self = this;

        try {
            self.beginBatch();
        } catch (e) {
            return self.batchSchedule(() => self.updateRecord.call(self, tableName, key, newRecord, callback));
            // return callback(e);
        }

        this.getStorage().updateRecord(tableName, key, newRecord, (err, ...results) => {
            if (err)
                return self.cancelBatch((err2) => {
                    self._err(`Could not update record with key ${key} in table ${tableName}`, err, callback);
                });
            self.commitBatch((err) => {
                if (err)
                    return self.cancelBatch((err2) => {
                        callback(err)
                    });
                callback(undefined, ...results);
            });
        });
    }

    /**
     * Wrapper around the storage's getRecord where the tableName defaults to the manager's
     * @param {string} [tableName] defaults to the manager's table name
     * @param {string} key
     * @param {function(err)} callback
     */
    getRecord(tableName, key, callback){
        if (!callback){
            callback = key;
            key = tableName;
            tableName = this._getTableName();
        }
        this.getStorage().getRecord(tableName, key, callback);
    }

    /**
     * Wrapper around the storage's deleteRecord where the tableName defaults to the manager's
     * @param {string} [tableName] defaults to the manager's table name
     * @param {string} key
     * @param {function(err, record)} callback
     */
    deleteRecord(tableName, key, callback) {
        if (!callback) {
            callback = key;
            key = tableName;
            tableName = this._getTableName();
        }
        this.getStorage().deleteRecord(tableName, key, (err, oldRecord) => {
            console.log("Deleted key", key, "old record", err, oldRecord);
            callback(err, oldRecord);
        });
    }

    /**
     * Wrapper around the storage's query where the tableName defaults to the manager's
     * @param {string} [tableName] defaults to the manager's table name
     * @param {function(record)} query
     * @param {string} sort
     * @param {number} limit
     * @param {function(err, record[])} callback
     */
    query(tableName, query, sort, limit, callback) {
        if (!callback){
            callback = limit;
            limit = sort;
            sort = query;
            query = tableName;
            tableName = this._getTableName();
        }
        console.log("query tableName="+tableName+" query=\""+query+"\" sort="+sort+" limit="+limit);
        this.getStorage().query(tableName, query, sort, limit, callback);
    }
}

module.exports = Manager;
},{"../constants":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/constants.js","../services/utils":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/services/utils.js","./Page":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/managers/Page.js"}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/managers/MessageManager.js":[function(require,module,exports){
const Manager = require('./Manager')
const { _err } = require('../services/utils')
const { MESSAGE_REFRESH_RATE, DID_METHOD, DID_DOMAIN, MESSAGE_TABLE } = require('../constants');
const opendsu = require("opendsu");
const scAPI = opendsu.loadAPI("sc");

/**
 * @typedef W3cDID
 */

/**
 * Class to wrap messages
 * @memberOf MessageManager
 */
class Message{
    /**
     *
     * @param {string} api
     * @param {*} message anything as long as it is serializable i guess
     */
    constructor(api, message){
        this.api = api;
        this.message = message;
    }
}
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
 * @param {Database} storage the DSU where the storage should happen or more commonly the Database Object
 * @param {BaseManager} baseManager the base manager to have access to the identity api
 * @param {string} didString
 * @param {function(err, Manager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @memberOf Managers
 * @extends Manager
 * @class MessageManager
 */
class MessageManager extends Manager{
    constructor(baseManager, didString, callback){
        super(baseManager, MESSAGE_TABLE, ['api'], (err, manager) => {
            if (err)
                return callback(err);

            manager.w3cDID = require('opendsu').loadApi('w3cdid');
            manager.didString = didString;
            manager.did = undefined;
            manager._listeners = {};
            manager.timer = undefined;
            manager.sc = baseManager.sc;

            manager.getOwnDID((err, didDoc) => {
                if (err)
                    throw new Error(`Could not get Own DID: ${err}`);
                manager._startMessageListener(didDoc);
                if (callback)
                    callback(undefined, manager);
            });

        });
        this.w3cDID = this.w3cDID || require('opendsu').loadApi('w3cdid');
        this.didString = this.didString || didString;
        this.did = this.did || undefined;
        this._listeners = this._listeners || {};
        this.timer = this.timer || undefined;
        this.sc = this.sc || undefined;
    }

    shutdown(){
        if (!this.timer)
            return console.log(`The message service for ${this.didString} is not running`);
        clearInterval(this.timer);
        console.log(`The messenger for ${this.didString} stopped`);
    }

    _receiveMessage(message, callback){
        const {api} = message;
        let self = this;
        self._saveToInbox(message, (err) => {
            if (err)
                return _err(`Could not save message to inbox`, err, callback);
            console.log(`Message ${JSON.stringify(message)} saved to table ${self._getTableName()} on DID ${self.didString}`);
            if (!(api in self._listeners)) {
                console.log(`No listeners registered for ${api} messages.`);
                return callback();
            }

            console.log(`Found ${self._listeners[api].length} listeners for the ${api} message api`);

            const listenerIterator = function(listeners, callback){
                const listener = listeners.shift();
                if (!listener)
                    return callback(undefined, message);
                listener(message, (err) => {
                    if (err)
                        console.log(`Error processing Api ${api}`, err);
                    listenerIterator(listeners, callback);
                });
            }

            listenerIterator(self._listeners[api].slice(), callback);
        });
    }

    _saveToInbox(message, callback){
        const key = Date.now() + '';
        message.key = key; // jpsl: add a key to the message, so that it can be deleted later based on the record object
        this.insertRecord(key, message, callback);
    }

    /**
     *
     * @param {string} api - should match one the DB constants with the tableName.
     * @param {function(Message)} onNewApiMsgListener where Message is an object obtained by JSON.parse(message)
     *
     */
    registerListeners(api, onNewApiMsgListener){
        if (!(api in this._listeners))
            this._listeners[api] = [];
        this._listeners[api].push(onNewApiMsgListener);
        const self = this;
        console.log(`registering a new listener on ${api}`);
        self.getAll(true, {
            query: [
                `api like /${api}/g`
            ]
        }, (err, messages) => {
            if (err)
                return console.log(`Could not list messages from Inbox, api: ${api}`);
            if (!messages || !messages.length)
                return console.log(`No Stashed Messages Stored for ${api}...`);
            console.log(`${messages.length} Stashed Messages found for manager ${api}`);
            messages.forEach(m => onNewApiMsgListener(m));
        });
    }

    /**
     * Sends a Message to the provided did
     * @param {string|W3cDID} did
     * @param {Message} message
     * @param {function(err)}callback
     */
    sendMessage(did, message, callback){
        if (typeof did !== 'object')
            return this._getDID(did + '', (err, didDoc) => err
                ? _err(`Could not get DID Document for string ${did}`, err, callback)
                : this.sendMessage(didDoc, message, callback));

        if (!(message instanceof Message))
            return callback(`Message ${message} must be instance of class Message`);

        this.getOwnDID((err, selfDID) => {
            console.log("Sending message", message, "to did", did.getIdentifier());
            selfDID.sendMessage(JSON.stringify(message), did, err => err
                ? _err(`Could not send Message`, err, callback)
                : callback());
        });
    }

    /**
     * Delete a message from the MESSAGE_TABLE.
     * @param {string} [tableName] defaults to MESSAGE_TABLE
     * @param {object} message. Must have a key property.
     * @param {function(err)} callback 
     */
    deleteMessage(tableName, message, callback) {
        if (!callback){
            callback = message;
            message = tableName;
            tableName = MESSAGE_TABLE;
        }
        if (!message)
            return callback("Message undefined");
        if (!message.key)
            return callback(`Message ${message} key property undefined`);
        this.deleteRecord(tableName, message.key, (err, oldRecord) => {
            return callback(err);
        });
    }

    getMessages(api, callback){
        if (!callback){
            callback = api;
            api = undefined;
        }
        if (api) {
            // filter messages for this api only
            this.query(MESSAGE_TABLE, `api == ${api}`, undefined, undefined, callback);
        } else {
            // list all messages
            this.query(MESSAGE_TABLE, "__timestamp > 0", undefined, undefined, callback);
        }
    }

    _startMessageListener(did){
        let self = this;
        console.log("_startMessageListener", did.getIdentifier());
        did.readMessage((err, message) => {
            if (err){
                if (err.message !== 'socket hang up')
                    console.log(createOpenDSUErrorWrapper(`Could not read message`, err));
                return self._startMessageListener(did);
            }

            console.log("did.readMessage did", did.getIdentifier(), "message", message);
            // jpsl: did.readMessage appears to return a string, but db.insertRecord requires a record object.
            // ... So JSON.parse the message into an object.
            // https://opendsu.slack.com/archives/C01DQ33HYQJ/p1618848231120300
            if (typeof message == "string") {
                try {
                    message = JSON.parse(message);
                } catch (error) {
                    console.log(createOpenDSUErrorWrapper(`Could not JSON.parse message ${message}`, err));
                    self._startMessageListener(did);
                    return;
                }
            }
            self._receiveMessage(message, (err, message) => {
                if (err)
                    console.log(`Failed to receive message`, err);
                else
                    console.log(`Message received ${message}`);
                self._startMessageListener(did);
            });
        });
    }

    getOwnDID(callback){
        if (this.did)
            return callback(undefined, this.did);
        const self = this;
        this._getDID(this.didString, (err, ownDID) => {
            if (err)
                return callback(err);
            self.did = ownDID;
            callback(undefined, self.did);
        });
    }

    _getDID(didString, callback){
        const didIdentifier = `did:ssi:name:${DID_DOMAIN}:${didString}`;

        if(this.sc){
            return this.w3cDID.resolveDID(didIdentifier, (err, resolvedDIDDoc) => {
                if (!err)
                    return callback(undefined, resolvedDIDDoc);

                this.w3cDID.createIdentity(DID_METHOD, DID_DOMAIN, didString, (err, didDoc) => {
                    if (err)
                        return _err(`Could not create DID identity`, err, callback);
                    // didDoc.setDomain('traceability');
                    callback(undefined, didDoc);
                });
            })
        }

        callback(`Security Context not initialised`)
    }
}

/**
 * @param {BaseManager} baseManager  only required the first time, if not forced
 * @param {string} didString
 * @param {boolean} [force] defaults to false. overrides the singleton behaviour and forces a new instance.
 * Makes DSU Storage required again!
 * @param {function(err, Manager)} [callback] optional callback for when the assurance that the table has already been indexed is required.
 * @returns {MessageManager}
 * @memberOf managers
 */
const getMessageManager = function(baseManager, didString, callback) {
    let manager;
    try {
        manager = baseManager.getManager(MessageManager);
        if (callback)
            return callback(undefined, manager);
    } catch (e){
        manager = new MessageManager(baseManager, didString, callback);
    }
    return manager;
}

module.exports = {
    getMessageManager,
    Message
};
},{"../constants":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/constants.js","../services/utils":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/services/utils.js","./Manager":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/managers/Manager.js","opendsu":false}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/managers/Page.js":[function(require,module,exports){
/**
 * Util class to handle pagination
 * @class Page
 * @memberOf Managers
 */
 class Page {
    itemsPerPage = 10;
    currentPage = 1;
    totalPages = undefined;
    items = [];

    constructor(page) {
        if (typeof page !== undefined)
            for (let prop in page)
                if (page.hasOwnProperty(prop))
                    this[prop] = page[prop];
    }

}

function toPage(currentPage, totalPages, items, itemsPerPage){
    return new Page({
        itemsPerPage: itemsPerPage,
        currentPage: currentPage,
        totalPages: totalPages,
        items: items || []
    });
}

function paginate(items, itemsPerPage, page){
    const totalPages = Math.floor(items.length / itemsPerPage) + (items.length % itemsPerPage === 0 ? 0 : 1);
        let startIndex = (page - 1) * itemsPerPage;
        startIndex = startIndex === 0 ? startIndex : startIndex - 1;
        const endIndex = startIndex + itemsPerPage >= items.length ? undefined: startIndex + itemsPerPage;
        const sliced = items.slice(startIndex, endIndex);
        return toPage(page, totalPages, sliced, itemsPerPage);
}
module.exports = {
    Page,
    toPage,
    paginate
}

},{}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/managers/index.js":[function(require,module,exports){
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
 * @namespace Managers
 */
module.exports = {
    DBLock: require('./DBLock'),
    Manager: require('./Manager'),
    Resolver: require('./resolvers/Resolver'),
    BaseManager: require('./BaseManager'),
    MessageManager: require('./MessageManager')
}
},{"./BaseManager":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/managers/BaseManager.js","./DBLock":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/managers/DBLock.js","./Manager":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/managers/Manager.js","./MessageManager":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/managers/MessageManager.js","./resolvers/Resolver":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/managers/resolvers/Resolver.js"}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/managers/resolvers/Resolver.js":[function(require,module,exports){
/**
 * Provides a bridge between the Managers Namespace and the resolving of const DSUs
 * @namespace Resolvers
 */

/**
 * Resolver classes substitute Managers when they're not available to be resolve a
 * Const DSU from its key in the DB and extract the updated Information when required
 *
 * Expects the injection of a service with the 2 following methods:
 *  - generateKey(...keyArgs): to generate the Array SSI:
 *  - get(KeySSI): that loads the DSU and loads the Object information
 *  @class Resolver
 *  @abstract
 *  @memberOf Resolvers
 */
class Resolver {
    /**
     * @param {BaseManager} baseManager
     * @param {function} service service for the Const DSU
     * @constructor
     */
    constructor(baseManager, service){
        this.service = service;
        baseManager.cacheManager(this);
    }

    /**
     * Resolves The keySSI and loads the DSI via the Service's get Method
     * @param {string} key the db primary key
     * @param {boolean} readDSU
     * @param {function(err, {})} callback
     */
    getOne(key, readDSU, callback){
        const params = key.split('-');
        const keySSI = this.service.generateKey(...params);
        if (!readDSU)
            return callback(undefined, keySSI.getIdentifier());
        this.service.get(keySSI, callback);
    }
}

module.exports = Resolver;


},{}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/model/Utils.js":[function(require,module,exports){
/**
 * @namespace Utils
 * @memberOf Model
 */

/**
 * Deep Object Comparison
 * https://stackoverflow.com/questions/30476150/javascript-deep-comparison-recursively-objects-and-properties
 *
 * with optional ignored properties
 * @param {{}} a
 * @param {{}} b
 * @param {string} [propsToIgnore]
 * @return {boolean}
 */
const isEqual = (a, b,...propsToIgnore) => {
    if (a === b) return true;
    if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
    if (!a || !b || (typeof a !== 'object' && typeof b !== 'object')) return a === b;
    if (a === null || a === undefined || b === null || b === undefined) return false;
    if (a.prototype !== b.prototype) return false;
    let keys = Object.keys(a).filter(k => propsToIgnore.indexOf(k) === -1);
    if (keys.length !== Object.keys(b).filter(k => propsToIgnore.indexOf(k) === -1).length) return false;
    return keys.every(k => propsToIgnore.indexOf(k) !== -1 || isEqual(a[k], b[k], ...propsToIgnore));
};

/**
 * @memberOf Utils
 */
function genDate(offsetFromToday){
    let date = new Date();
    date.setDate(date.getDate() + offsetFromToday);
    return date;
}

function generateGtin(){
    function pad(n, width, padding) {
        padding = padding || '0';
        n = n + '';
        return n.length >= width ? n : new Array(width - n.length + 1).join(padding) + n;
    }

    const beforeChecksum = pad(Math.floor(Math.random() * 9999999999999), 13); // has to be 13. the checksum is the 4th digit
    const checksum = calculateGtinCheckSum(beforeChecksum);
    return `${beforeChecksum}${checksum}`;
}

function validateGtin(gtin){
    gtin = gtin + '';
    if(!(/\b\d{14}\b/g.test(gtin)))
        return false
    const digits = gtin.slice(0, 13);
    const checksum = calculateGtinCheckSum(digits);
    return parseInt(checksum) === parseInt(gtin.charAt(13));
}

// https://www.gs1.org/services/how-calculate-check-digit-manually
function calculateGtinCheckSum(digits){
    digits = '' + digits;
    if (digits.length !== 13)
        throw new Error(`needs to received 13 digits`);
    const multiplier = [3,1,3,1,3,1,3,1,3,1,3,1,3];
    let sum = 0;
    try {
        // multiply each digit for its multiplier according to the table
        for (let i = 0; i < 13; i++)
            sum += parseInt(digits.charAt(i)) * multiplier[i];

        // Find the nearest equal or higher multiple of ten
        const remainder = sum % 10;
        let nearest;
        if (remainder  === 0)
            nearest = sum;
        else
            nearest = sum - remainder + 10;

        return nearest - sum;
    } catch (e){
        throw new Error(`Did this received numbers? ${e}`);
    }
}
/**
 * @memberOf Utils
 */
function generateProductName() {
    const syllables = ["aba", "xo", "ra", "asp", "pe", "cla", "ri", "bru", "be", "nu", "as", "cos", "sen"];
    const suffixes = ['gix', 'don', 'gix', 'fen', 'ron', 'tix'];
    const name = [];

    let syllableCount = Math.floor(Math.random() * 4) + 2;
    while (syllableCount >= 0){
        name.push(syllables[Math.floor(Math.random() * syllables.length)]);
        syllableCount --;
    }
    name.push(suffixes[Math.floor(Math.random() * suffixes.length)]);
    return name.join('');
}
/**
 * @memberOf Utils
 */
function generateBatchNumber(){
    const chars = 'ABCDEFGHIJKLMNOPQRSUVWXYZ';
    const numbers = '1234567890';
    const options = [chars, numbers];
    const length = 6;
    const batchNumber = []
    for (let i = 0 ; i < length; i++){
        const slot = Math.floor(Math.random() * 2);
        batchNumber.push(options[slot].charAt(Math.floor(Math.random() * options[slot].length)));
    }
    return batchNumber.join('');
}
/**
 * @memberOf Utils
 */
function generateRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

/**
 * Generates a string of the provided length filled with random characters from the provided characterSet
 * Clone of PrivateSky Code
 * @memberOf Utils
 */
function generate(charactersSet, length){
    let result = '';
    const charactersLength = charactersSet.length;
    for (let i = 0; i < length; i++) {
        result += charactersSet.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}


/**
 * Util function to provide string format functionality similar to C#'s string.format
 *
 * @param {string} string
 * @param {string} args replacements made by order of appearance (replacement0 wil replace {0} and so on)
 * @return {string} formatted string
 * @memberOf Utils
 */
function stringFormat(string, ...args){
    return string.replace(/{(\d+)}/g, function(match, number) {
        return typeof args[number] != 'undefined'
            ? args[number]
            : match;
    });
}

/**
 * Select n elements from array at random (non destructive)
 * (https://stackoverflow.com/a/19270021)
 * @param arr
 * @param n
 * @return {any[]}
 * @memberOf Utils
 */
function getRandom(arr, n) {
    var result = new Array(n),
        len = arr.length,
        taken = new Array(len);
    if (n > len)
        throw new RangeError("getRandom: more elements taken than available");
    while (n--) {
        var x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
}

/**
 * Generates the 2D Data Matrix code for a batch or a serial
 * @param gtin
 * @param {string} batchNumber
 * @param {string} expiry (must be parseable to date)
 * @param [serialNumber]
 * @return {string}
 */
function generate2DMatrixCode(gtin, batchNumber, expiry, serialNumber){
    const formattedExpiry = new Date(expiry).toLocaleDateString("en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit"
    }).split('/').reverse().join('');

    if (!serialNumber)
        return `(01)${gtin}(10)${batchNumber}(17)${formattedExpiry}`;
    return `(01)${gtin}(21)${serialNumber}(10)${batchNumber}(17)${formattedExpiry}`;
}

module.exports = {
    /**
     * Generates a string of the provided length filled with random characters from 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
     * Clone of PrivateSky Code
     * @memberOf Utils
     */
    generateID(length) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        return generate(characters, length);
    },

    /**
     * Generates a string of the provided length filled with random numeric characters
     * Clone of PrivateSky Code
     * @memberOf Utils
     */
    generateNumericID(length) {
        const characters = '0123456789';
        return generate(characters, length);
    },

    /**
     * Clone of PrivateSky Code
     * @memberOf Utils
     */
    generateSerialNumber(length){
        let char = generate("ABCDEFGHIJKLMNOPQRSTUVWXYZ", 2);
        let number = this.generateNumericID(length-char.length);
        return char+number;
    },
    generateRandomInt,
    genDate,
    generateProductName,
    generateBatchNumber,
    generateGtin,
    validateGtin,
    calculateGtinCheckSum,
    generateRandomInt,
    stringFormat,
    getRandom,
    generate2DMatrixCode,
    isEqual
}
},{}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/model/Validations.js":[function(require,module,exports){
/**
 * @namespace Validations
 * @memberOf Model
 */

/**
 * Supported ion-input element types
 * @memberOf Validations
 */
const ION_TYPES = {
    EMAIL: "email",
    NUMBER: "number",
    TEXT: "text",
    DATE: "date"
}

/**
 * Supported ion-input element sub-types (under the {@link ION_CONST.name_key})
 * @memberOf Validations
 */
const SUB_TYPES = {
    TIN: "tin"
}

/**
 * @memberOf Validations
 */
const QUERY_ROOTS = {
    controller: "controller",
    parent: "parent",
    self: "self"
}
/**
 * Html attribute name constants
 *
 * mostly straightforward with the notable exceptions:
 *  - {@link ION_CONST.error.append} variable append strategy - que root of the css query
 *  - {@link ION_CONST.error.queries}:
 *    - {@link ION_CONST.error.queries.query} the media query that while be made via {@link HTMLElement#querySelectorAll}
 *    - {@link ION_CONST.error.queries.variables} variables that will be set/unset:
 *       the keys will be concatenated with '--' eg: key => element.style.setProperty('--' + key, variables[key].set)
 *
 *       The placeholder ${name} can be used to mark the field's name
 * @memberOf Validations
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
                        unset: ""
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
 * @memberOf Validations
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
 * Does the match between the Browser's Validity state and the validators/type
 * @type {{tooShort: string, typeMismatch: string, stepMismatch: string, rangeOverFlow: string, badInput: undefined, customError: undefined, tooLong: string, patternMismatch: string, rangeUnderFlow: string, valueMissing: string}}
 * @memberOf Validations
 */
const ValidityStateMatcher = {
    patternMismatch: "pattern",
    rangeOverFlow: "max",
    rangeUnderFlow: "min",
    stepMismatch: "step",
    tooLong: "maxlength",
    tooShort: "minlength",
    typeMismatch: "email|URL",
    valueMissing: "required"
}

/**
 * Returns
 * @return {*}
 * @constructor
 * @memberOf Validations
 */
const ValidatorRegistry = function(...initial){
    const registry =  new function(){
        const registry = {};

        /**
         *
         * @param validator
         * @memberOf ValidatorRegistry
         */
        this.register = function(...validator){
            validator.forEach(v => {
                const instance = new v();
                registry[instance.name] = v;
            });
        }

        /**
         *
         * @param name
         * @return {*}
         * @memberOf ValidatorRegistry
         */
        this.getValidator = function(name){
            if (!(name in registry))
                return;
            return registry[name];
        }

        /**
         * does the matching between the fields validity params and the field's properties (type/subtype)
         * @param [validityState]
         * @return {*}
         * @memberOf ValidatorRegistry
         */
        this.matchValidityState = function(validityState = ValidityStateMatcher){
            if (typeof validityState === 'string'){
                if (!(validityState in ValidityStateMatcher))
                    return;
                return ValidityStateMatcher[validityState];
            } else {
                const result = {};
                for(let prop in validityState)
                    if (prop in ValidityStateMatcher)
                        result[ValidityStateMatcher[prop]] = validityState[prop];
                return result;
            }
        }
    }()
    registry.register(...initial);
    return registry;
}

/**
 * Handles validations
 * @class Validator
 * @abstract
 * @memberOf Validations
 */
class Validator {
    /**
     * @param {string} name validator name. Should match the type -> subtype of the field
     * @param {string} [errorMessage] should always have a default message
     * @constructor
     */
    constructor(name, errorMessage= "Child classes must implement this"){
        this.name = name;
        this.errorMessage = errorMessage;
    }
    /**
     * returns the error message, or nothing if is valid
     * @param value the value
     * @param [args] optional others args
     * @return {string | undefined} errors or nothing
     */
    hasErrors(value, ...args){
        return this.errorMessage;
    }
}

/**
 * Validates a pattern
 * @param {string} text
 * @param {RegExp} pattern in the '//' notation
 * @returns {string|undefined} undefined if ok, the error otherwise
 * @memberOf Validations
 * @return {string | undefined}
 */
const patternHasErrors = function(text, pattern){
    if (!text) return;
    if (!pattern.test(text))
        return "Field does not match pattern";
}

/**
 * Handles Pattern validations
 * @class PatternValidator
 * @extends Validator
 * @memberOf Validations
 */
class PatternValidator extends Validator {
    /**
     * @param {string} errorMessage
     * @constructor
     */
    constructor(errorMessage = "Field does not match pattern") {
        super("pattern", errorMessage);
    }

    /**
     * returns the error message, or nothing if is valid
     * @param value the value
     * @param pattern the pattern to validate
     * @return {string | undefined} the errors or nothing
     */
    hasErrors(value, pattern){
        return patternHasErrors(value, pattern);
    }
}

const emailPattern = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/

/**
 * @param {string} email
 * @returns {string|undefined} undefined if ok, the error otherwise
 * @memberOf Validations
 */
const emailHasErrors = function(email){
    if (patternHasErrors(email, emailPattern))
        return "Invalid email";
}

/**
 * Handles email validations
 * @class EmailValidator
 * @extends Validator
 * @memberOf Validations
 */
class EmailValidator extends Validator {
    /**
     * @param {string} errorMessage
     * @constructor
     */
    constructor(errorMessage = "That is not a valid email") {
        super("email", errorMessage);

    }

    /**
     * returns the error message, or nothing if is valid
     * @param value the value
     * @return {string | undefined} the errors or nothing
     */
    hasErrors(value){
        return patternHasErrors(value, emailPattern);
    }
}

/**
 * Validates a tin number
 * @param {string|number} tin
 * @returns {string|undefined} undefined if ok, the error otherwise
 * @memberOf Validations
 */
const tinHasErrors = function(tin){
    if (!tin) return;
    tin = tin + '';
    if (patternHasErrors(tin,))
        return "Not a valid Tin";
}

/**
 * Handles email validations
 * @class TinValidator
 * @extends Validator
 * @memberOf Validations
 */
class TinValidator extends Validator {
    /**
     * @param {string} errorMessage
     * @constructor
     */
    constructor(errorMessage = "That is not a valid Tin") {
        super("tin", errorMessage);
    }

    /**
     * returns the error message, or nothing if is valid
     * @param value the value
     * @return {string | undefined} the errors or nothing
     */
    hasErrors(value){
        return patternHasErrors(value, /^\d{9}$/);
    }
}

/**
 * Validates a number Field (only integers supported)
 * @param {number} value
 * @param props
 * @memberOf Validations
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
 * @memberOf Validations
 */
const dateHasErrors = function(date, props){
    throw new Error("Not implemented date validation");
}

/**
 * Validates a text value
 * @param {string} text
 * @param props
 * @memberOf Validations
 */
const textHasErrors = function(text, props){
    if (props[ION_CONST.name_key] === SUB_TYPES.TIN)
        return tinHasErrors(text);
}

/**
 * parses the numeric values
 * @param props
 * @memberOf Validations
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
 * @memberOf Validations
 */
const getValidationAttributes = function(element){
    return {
        type: element[ION_CONST.type_key],
        name: element[ION_CONST.name_key],
        required: element[ION_CONST.required_key],
        max: element[ION_CONST.max_value],
        maxlength: element[ION_CONST.max_length],
        min: element[ION_CONST.min_value],
        minlength: element[ION_CONST.min_length]
    };
}

/**
 * Validates a ion-input element for required & max/min length.
 * @param {HTMLElement} element
 * @param {object} props
 * @returns {string|undefined} undefined if ok, the error otherwise
 * @memberOf Validations
 */
const hasRequiredAndLengthErrors = function(element, props){
    let {required, maxLength, minLength} = props;
    let value = element.value;
    value = value && typeof value === 'string' ? value.trim() : value;
    if (required && !value)
        return "Field is required";
    if (!value) return;
    if (minLength && value.length < minLength)
        return `The minimum length is ${minLength}`;
    if (maxLength && value.length > maxLength)
        return `The maximum length is ${minLength}`;
}

/**
 *
 * @param props
 * @param prefix
 * @return {boolean}
 * @memberOf Validations
 */
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
 * @memberOf Validations
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
 * @param {boolean} [force] defaults to false. if true ignores if the value changed or not
 * @returns {string|undefined} undefined if ok, the error otherwise
 * @memberOf Validations
 */
const updateModelAndGetErrors = function(controller, element, prefix, force){
    force = !!force || false;
    if (!controller.model)
        return;
    let name = element.name.substring(prefix.length);
    if (typeof controller.model[name] === 'object') {
        let valueChanged = (controller.model[name].value === undefined && !!element.value)
            || (!!controller.model[name].value && controller.model[name].value !== element.value);

        controller.model[name].value = element.value;
        if (valueChanged || force){
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
 * @memberOf Validations
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
 * @param {boolean} force (Decides if forces the validation to happen even if fields havent changed)
 * @memberOf Validations
 */
const controllerHasErrors = function(controller, prefix, force){
    let inputs = controller.element.querySelectorAll(`${ION_CONST.input_tag}[name^="${prefix}"]`);
    let errors = [];
    let error;
    inputs.forEach(el => {
        error = updateModelAndGetErrors(controller, el, prefix, force);
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
 * @param {WebcController} controller
 * @param {function()} [onValidModel] the function to be called when the whole Controller model is valid
 * @param {function()} [onInvalidModel] the function to be called when any part of the model is invalid
 * @param {string} [prefix] the prefix for the ion-input to be validated. defaults to 'input-'
 * @memberOf Validations
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
        let element = evt.target;
        if (!element.name) return;
        let errors = updateModelAndGetErrors(controller, element, prefix);
        if (errors)     // one fails, all fail
            controller.send('ion-model-is-invalid');
        else            // Now we have to check all of them
            controllerHasErrors(controller, prefix);
    });

    controller.hasErrors = (force) => controllerHasErrors(controller, prefix, force);

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

    controller.on('input-has-changed', _handleErrorElement.bind(controller));
}

/**
 *
 * @param evt
 * @private
 * @memberOf Validations
 */
const _handleErrorElement = function(evt){
    let name = evt.detail;
    let attributes = this.model.toObject()[name];
    let errorEl = this.element.querySelector(`ion-note[name="note-${name}"]`);
    if (attributes.error){
        if (errorEl){
            errorEl.innerHTML = attributes.error;
        } else {
            errorEl = document.createElement('ion-note');
            errorEl.setAttribute('position', 'stacked');
            errorEl.setAttribute('slot', 'end');
            errorEl.setAttribute('color', 'danger');
            errorEl.setAttribute('name', `note-${name}`)
            errorEl.innerHTML = attributes.error;
            let htmlEl = this.element.querySelector(`ion-item ion-input[name="input-${name}"]`);
            htmlEl.insertAdjacentElement('afterend', errorEl);
        }
    } else if (errorEl) {
        errorEl.remove();
    }
}

/**
 * Validates a Model element according to prop names
 * *Does not validate 'required' or more complex attributes yet*
 * TODO use annotations to accomplish that
 * @returns {string|undefined} undefined if ok, the error otherwise
 * @memberOf Validations
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
 * @interface
 * @memberOf Validations
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
    Validators: {
        Validator: Validator,
        Validators: {
            TinValidator: TinValidator,
            EmailValidator: EmailValidator,
            PatternValidator: PatternValidator
        },
        ValidityStateMatcher: ValidityStateMatcher,
        Registry: ValidatorRegistry(TinValidator, EmailValidator, PatternValidator)
    },
    bindIonicValidation,
    emailHasErrors,
    tinHasErrors,
    textHasErrors,
    numberHasErrors,
    hasIonErrors
};
},{}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/services/DSUService.js":[function(require,module,exports){
const utils = require("./utils");

/**
 * @memberOf Services
 * @type {doPost}
 */
const doPost = utils.getPostHandlerFor("dsu-wizard");

if (utils.getEnv() === 'nodejs')
    FormData = require('form-data');    // needed because nodejs does not have FormData. his makes sure we can use it in tests

/**
 * Class responsible for Authenticated DSU transactions between the client and the API Hub
 * @class DSUService
 * @memberOf Services
 */
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
             * @see {@link DSUService#addFileDataToDossier} with already filled transactionId and domain
             * @memberOf Services
             */
            addFileDataToDossier(fileName, fileData, callback){
                self.addFileDataToDossier(transactionId, domain, fileName, fileData, callback);
            };
            /**
             * @see {@link DSUService#mount} with already filled transactionId and domain
             * @memberOf Services
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

},{"./utils":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/services/utils.js","form-data":false,"opendsu":false}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/services/WebComponentService.js":[function(require,module,exports){
const { INFO_PATH } = require('../constants');
const { _err } = require('./utils');
/**
 * This service is the bridge between custom webcomponents and PDM's openDSU SSApp Architecture
 * module Services
 * @deprecated
 */
function WebComponentService() {
    const { getResolver, getKeySSISpace } = require('./utils');

    /**
     * retrieves the object stored at {@link INFO_PATH} to the dsu with the provided keySSI
     * @param {string} keySSI
     * @param {function(err, object)} callback
     */
    this.getInfo = function(keySSI, callback){
        let key;
        try {
            key = getKeySSISpace().parse(keySSI);
        } catch (e){
            return _err(`Could not parse keySSI`, e, callback);
        }

        getResolver().loadDSU(key, (err, dsu) => {
           if (err)
               return _err(`Could not load dsu`, err, callback);
           dsu.readFile(INFO_PATH, (err, data) => {
               if (err)
                   return _err(`Could not read file at ${INFO_PATH}`, err, callback);
               try {
                   const result = JSON.parse(data);
                   callback(undefined, result);
               } catch(e) {
                   _err(`Could not parse info file`, err, callback);
               }
           })
        });
    }
}

module.exports = WebComponentService;

},{"../constants":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/constants.js","./utils":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/services/utils.js"}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/services/WebcLocaleService.js":[function(require,module,exports){
/**
 * @namespace Locale
 * @memberOf Services
 */

/**
 * This service depends on WebCardinal's translation API
 *
 * Integrates with {@link WebCardinal}'s translation model, and natively integrates into controllers and their model
 * @function LocaleService
 * @memberOf Locale
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
    this._loadLocale = function(controller){
        return controller.translationModel;
    }

    /**
     *
     * @param model
     * @param translationKey
     * @return {*}
     */
    const parseTranslationModel = function(model, translationKey){
        const index = translationKey.indexOf('.');
        if (index === -1)
            return model[translationKey];

        return parseTranslationModel(model[translationKey.substring(0, translationKey.indexOf('.'))],
            translationKey.substring(index + 1));
    }

    /**
     * Retrieves the translation information from WebCardinal
     * @param {string} pageName if contains '.' it will be translated into hierarchy in json object (just one level currently supported)
     * @param {WebcController} controller
     * @returns {object} the translation object for the provided page in the current language
     */
    this.getByPage = function(pageName, controller){
        let locale = this._loadLocale(controller);
        if (!locale){
            console.log("no locale set");
            return {};
        }

        locale = locale.toObject();
        if (!pageName)
            return locale;
        if (pageName.includes("."))
            return parseTranslationModel(locale, pageName);
        return locale[pageName];
    }
}

/**
 * Util function to merge JSON objects according to a specified priority
 * @memberOf Locale
 */
const merge = function(target, source){
    for (const key of Object.keys(source))
        if (source[key] instanceof Object)
            Object.assign(source[key], merge(target[key] ? target[key] : {}, source[key]))
    Object.assign(target || {}, source)
    return target;
}

/**
 * Util function to provide string format functionality similar to C#'s string.format
 *
 * @param {string} string
 * @param {string} args replacements made by order of appearance (replacement0 wil replace {0} and so on)
 * @return {string} formatted string
 * @memberOf Locale
 */
const stringFormat = function(string, ...args){
    return string.replace(/{(\d+)}/g, function(match, number) {
        return typeof args[number] != 'undefined'
            ? args[number]
            : match;
    });
}

/**
 * Binds the translation model to the controller and its setModel method
 * @memberOf Locale
 */
const bindToController = function(controller, page){
    if (!controller.localized) {
        let getter = controller.initializeModel;
        controller.initializeModel = () => {
            let locale = localeService.getByPage(page, controller);
            if (!locale){
                console.log(`No translations found for page ${page}`);
                return getter();
            }
            locale = JSON.parse(JSON.stringify(locale));
            let model = getter();
            return merge(locale, model);
        };

        let translator = controller.translate;
        controller.translate = (key, ...args) => {
            const translation = translator.call(controller, page && page.length > 0 ? `${page}.${key}` : key);
            return translation && args && args.length ? stringFormat(translation, ...args) : translation;
        }

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
     * @memberOf Locale
     */
    bindToLocale: function (controller, page){
        if (!localeService)
            localeService = new LocaleService();
        bindToController(controller, page);
        return localeService;
    }
}
},{}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/services/strategy.js":[function(require,module,exports){
/**
 * DSU creation strategies:
 *  - **Simple:** Users the direct OpenDSU API. Only works if the APIHub is not in authorized mode;
 *  - **Authorized:** Uses the DSUFabric and {@link DSUBuilder} to ensure transactions and permissions
 * @memberOf Services
 */
const STRATEGY = {
    AUTHORIZED: "authorized",
    SIMPLE: "simple"
}

module.exports = STRATEGY;
},{}],"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/services/utils.js":[function(require,module,exports){
/**
 * @namespace Utils
 * @memberOf Services
 */

let resolver, DSUService, keyssi;

/**
 * util function to get the env type.
 * Needs openDSU to be loaded to have access to $$ regardless of environment
 * @return {string} the environment type - nodejs or
 * @memberOf Utils
 */
function getEnv(){
	return globalThis['$$'] ? globalThis['$$'].environmentType : (typeof globalThis.window === 'undefined' ? "nodejs" : "browser");
}

/**
 * for singleton use
 * @returns {function} resolver
 * @memberOf Utils
 */
function getResolver(){
	if (!resolver)
		resolver = require('opendsu').loadApi('resolver');
	return resolver;
}

/**
 * for singleton use
 * @returns {function} resolver
 * @memberOf Utils
 */
function getKeySSISpace(){
	if (!keyssi){
		keyssi = require('opendsu').loadApi('keyssi');
		const ssiSpaceParse = keyssi.parse;
		keyssi.parse = (keySSI, options) => {
			if (typeof keySSI === 'string')
				return ssiSpaceParse.call(keyssi, keySSI, options);
			return keySSI;
		}
	}

	return keyssi;
}

/**
 * for singleton use
 * @returns {DSUService}
 * @memberOf Utils
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
 * @memberOf Utils
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
 * @memberOf Utils
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

const constants = require('opendsu').constants;
const system = require('opendsu').loadApi('system');

/**
 * Util Method to select POST strategy per DSU api.
 * - Forked from PrivateSky
 * - refactored for server side use compatibility
 * @param {string} apiname
 * @returns {doPost} postHandler
 * @memberOf Utils
 */
function getPostHandlerFor(apiname){

	function getBaseURL(){
		switch (getEnv()) {
			case constants.ENVIRONMENT_TYPES.SERVICE_WORKER_ENVIRONMENT_TYPE:
				let scope = self.registration.scope;

				let parts = scope.split("/");
				return `${parts[0]}//${parts[2]}`;

			case constants.ENVIRONMENT_TYPES.BROWSER_ENVIRONMENT_TYPE:
				const protocol = window.location.protocol;
				const host = window.location.hostname;
				const port = window.location.port;

				return `${protocol}//${host}:${port}`;

			case constants.ENVIRONMENT_TYPES.WEB_WORKER_ENVIRONMENT_TYPE:
				return self.location.origin;

			case constants.ENVIRONMENT_TYPES.NODEJS_ENVIRONMENT_TYPE:
				let baseUrl = system.getEnvironmentVariable(constants.BDNS_ROOT_HOSTS);
				if (typeof baseUrl === "undefined") {
					baseUrl = "http://localhost:8080";
				} else {
					const myURL = new URL(baseUrl);
					baseUrl = myURL.origin;
				}
				if (baseUrl.endsWith("/")) {
					baseUrl = baseUrl.slice(0, -1);
				}
				return baseUrl;

			default:
		}
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

/**
 * Wrapper around
 * <pre>
 *     OpenDSUSafeCallback(callback)(createOpenDSUErrorWrapper(msg, err));
 * </pre>
 * @param msg
 * @param err
 * @param callback
 * @protected
 * @memberOf Utils
 */
const _err = function(msg, err, callback){
	return OpenDSUSafeCallback(callback)(createOpenDSUErrorWrapper(msg, err));
}

/**
 * Returns the corresponding identifiers to the provided mount paths
 * @param {Archive} dsu
 * @param {string} basePath
 * @param {string|function(err?, {}?)} paths the last argument must be the callback
 */
const getMounts = function(dsu, basePath, ...paths){
	const callback = paths.pop();
	paths = paths.map(p => p.startsWith('/') ? p.substring(1) : p);
	dsu.listMountedDSUs(basePath, (err, mounts) => {
		if (err)
			return callback(err);
		mounts = mounts.filter(m => paths.indexOf(m.path) !== -1)
			.reduce((accum, m) => {
				accum['/' + m.path] = m.identifier;
				return accum;
			}, {});
		callback(undefined, mounts);
	})
}

/**
 * Utll function that calls the fame function iteratively wit the next arguments (destructive)
 * @param func
 * @param {string[]} keys
 * @param {} args
 * @memberOf Utils
 */
const functionCallIterator = function(func, keys, ...args){
	if (!args || args.length < 1)
		throw new Error("Needs at least a callback");
	const callback = args.pop();

	if (!args.every(a => Array.isArray(a) && a.length === keys.length))
		return callback(`Invalid argument length`);

	const result = [];

	const iterator = function(...argz){
		const callback = argz.pop();
		const callArgs = argz.map(a => a.shift()).filter(a => !!a);

		if (!callArgs.length)
			return callback();

		try{
			func(...callArgs, (err, ...results) => {
				if (err)
					return callback(err);
				result.push(results);
				iterator(...argz, callback);
			});
		} catch(e){
			return callback(e);
		}
	}

	iterator(keys, ...args, (err) => err
		? callback(err)
		: callback(undefined, ...result));
}


module.exports = {
	getResolver,
	getKeySSISpace,
	getDSUService,
	getPostHandlerFor,
	selectMethod,
	createDSUFolders,
	getEnv,
	_err,
	functionCallIterator,
	getMounts
}

},{"./DSUService":"/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/pdm-dsu-toolkit/services/DSUService.js","opendsu":false}]},{},["/home/tvenceslau/workspace/pharmaledger/uc_traceability/fgt-workspace/fgt-dsu-wizard/builds/tmp/wizard_intermediar.js"])
                    ;(function(global) {
                        global.bundlePaths = {"wizard":"build/bundles/wizard.js"};
                    })(typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
                