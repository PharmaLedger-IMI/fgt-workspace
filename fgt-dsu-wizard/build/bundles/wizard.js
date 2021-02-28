wizardRequire=(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({"../../commands":[function(require,module,exports){
module.exports = {
    createIdSSI: require("./setIdSSI").createIdSSI,
    createOrderingPartnerSSI: require("./setOrderingPartnerSSI").createOrderingPartnerSSI,
    createOrderLineSSI: require("./setOrderLineSSI").createOrderLineSSI,
    createOrderLinesSSI: require("./setOrderLinesSSI").createOrderLinesSSI,
    createOrderSSI: require("./setOrderSSI").createOrderSSI,
    createProductGtinBatchSSI: require("./setProductGtinBatchSSI").createProductGtinBatchSSI,
    createProductGtinSSI: require("./setProductGtinSSI").createProductGtinSSI,
    createSendingPartnerSSI: require("./setSendingPartnerSSI").createSendingPartnerSSI,
    createShipmentLineSSI: require("./setShipmentLineSSI").createShipmentLineSSI,
    createShipmentLinesSSI: require("./setShipmentLinesSSI").createShipmentLinesSSI,
    createShipmentSI: require("./setShipmentSSI").createShipmentSSI
}
},{"./setIdSSI":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/commands/setIdSSI.js","./setOrderLineSSI":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/commands/setOrderLineSSI.js","./setOrderLinesSSI":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/commands/setOrderLinesSSI.js","./setOrderSSI":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/commands/setOrderSSI.js","./setOrderingPartnerSSI":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/commands/setOrderingPartnerSSI.js","./setProductGtinBatchSSI":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/commands/setProductGtinBatchSSI.js","./setProductGtinSSI":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/commands/setProductGtinSSI.js","./setSendingPartnerSSI":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/commands/setSendingPartnerSSI.js","./setShipmentLineSSI":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/commands/setShipmentLineSSI.js","./setShipmentLinesSSI":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/commands/setShipmentLinesSSI.js","./setShipmentSSI":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/commands/setShipmentSSI.js"}],"../../model":[function(require,module,exports){
module.exports = {
    Order: require('./Order'),
    OrderLine: require('./OrderLine'),
    Shipment: require('./Shipment'),
    ShipmentLine: require('./ShipmentLine'),
    Product: require('./Product'),
    Batch: require('./Batch'),
    MAH: require('./MAH'),
    Pharmacy: require('./Pharmacy'),
    Wholesaler: require('./Wholesaler'),
    Actor: require('./Actor')
}

},{"./Actor":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/model/Actor.js","./Batch":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/model/Batch.js","./MAH":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/model/MAH.js","./Order":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/model/Order.js","./OrderLine":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/model/OrderLine.js","./Pharmacy":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/model/Pharmacy.js","./Product":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/model/Product.js","./Shipment":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/model/Shipment.js","./ShipmentLine":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/model/ShipmentLine.js","./Wholesaler":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/model/Wholesaler.js"}],"../../services":[function(require,module,exports){
module.exports = {
    DSUService: require('./DSUService'),
    IdService: require('./IdService'),
    LocaleService: require("./LocaleService"),
    OrderLineService: require("./OrderLineService"),
    OrderService: require("./OrderService"),
    ShipmentService: require("./ShipmentService"),
    Strategy: require("./strategy")
}
},{"./DSUService":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/services/DSUService.js","./IdService":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/services/IdService.js","./LocaleService":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/services/LocaleService.js","./OrderLineService":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/services/OrderLineService.js","./OrderService":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/services/OrderService.js","./ShipmentService":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/services/ShipmentService.js","./strategy":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/services/strategy.js"}],"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/builds/tmp/wizard_intermediar.js":[function(require,module,exports){
(function (global){(function (){
global.wizardLoadModules = function(){ 

	if(typeof $$.__runtimeModules["../../model"] === "undefined"){
		$$.__runtimeModules["../../model"] = require("../../model");
	}

	if(typeof $$.__runtimeModules["../../services"] === "undefined"){
		$$.__runtimeModules["../../services"] = require("../../services");
	}

	if(typeof $$.__runtimeModules["../../commands"] === "undefined"){
		$$.__runtimeModules["../../commands"] = require("../../commands");
	}
};
if (false) {
	wizardLoadModules();
}
global.wizardRequire = require;
if (typeof $$ !== "undefined") {
	$$.requireBundle("wizard");
}

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../../commands":"../../commands","../../model":"../../model","../../services":"../../services"}],"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/commands/setIdSSI.js":[function(require,module,exports){

/**
 * Creates a seedSSI meant to contain participant 'personal' data (in this case MAH)
 * could be used as an identity
 *
 * the MAH name will be used as subdomain
 * @param {Actor} actor
 * @param {string} domain: anchoring domain
 * @returns {Object} a SeedSSI
 */
function createIdSSI(actor, domain) {
    console.log("New Actor_SSI in domain", domain);
    const keyssiSpace = require("opendsu").loadApi("keyssi");
    return keyssiSpace.buildTemplateSeedSSI(domain, actor.id + actor.name + actor.nif, undefined, undefined, {"subDomain": actor.name});
}

function command(server){
    const setSSI = require('./setSSI');
    setSSI(server, "id", createIdSSI, "setIdSSI", "traceability");
}

module.exports = {
    command,
    createIdSSI
};

},{"./setSSI":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/commands/setSSI.js","opendsu":false}],"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/commands/setOrderLineSSI.js":[function(require,module,exports){

function createOrderLineSSI(data, domain) {
    console.log("New ORDERLINE_SSI in domain ", domain, [data.requesterId, data.orderId, data.gtin]);
    const keyssiSpace = require("opendsu").loadApi("keyssi");
    return keyssiSpace.createArraySSI(domain, [data.requesterId, data.orderId, data.gtin]);
}

function command(server){
    const setSSI = require('./setSSI');
    setSSI(server, "orderline", createOrderLineSSI, "setOrderLineSSI", "traceability");
}

module.exports = {
    command,
    createOrderLineSSI
};

},{"./setSSI":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/commands/setSSI.js","opendsu":false}],"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/commands/setOrderLinesSSI.js":[function(require,module,exports){

function createOrderLinesSSI(data, domain) {
    console.log("New ORDERLINES_SSI in domain", domain);
    const keyssiSpace = require("opendsu").loadApi("keyssi");
    return keyssiSpace.createArraySSI(domain, [data.gtin, "ORDERLINES"]);
}

function command(server, mah){
    const setSSI = require('./setSSI');
    setSSI(server, "orderlines", createOrderLinesSSI, "setOrderLinesSSI", "traceability." + mah);
}

module.exports = {
    command,
    createOrderLinesSSI
}

},{"./setSSI":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/commands/setSSI.js","opendsu":false}],"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/commands/setOrderSSI.js":[function(require,module,exports){

/**
 * Creates a seedSSI based on orderId+requesterId.
 * @param {Object} data - must have properties orderId and requesterId as strings.
 * @param {string} domain 
 * @returns {Object} a SeedSSI
 */
function createOrderSSI(data, domain) {
    console.log("New ORDER_SSI in domain", domain);
    const keyssiSpace = require("opendsu").loadApi("keyssi");
    return keyssiSpace.createArraySSI(domain, [data.orderId, data.requesterId]);
}

function command(server){
    const setSSI = require('./setSSI');
    setSSI(server, "order", createOrderSSI, "setOrderSSI", "traceability");
}

module.exports = {
    command,
    createOrderSSI
};

},{"./setSSI":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/commands/setSSI.js","opendsu":false}],"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/commands/setOrderingPartnerSSI.js":[function(require,module,exports){

function createOrderingPartnerSSI(data, domain) {
    console.log("New ORDERING_PARTNER_SSI in domain", domain);
    const keyssiSpace = require("opendsu").loadApi("keyssi");
    return keyssiSpace.createArraySSI(domain, [data.gtin, data.requesterId]);
}

function command(server, mah){
    const setSSI = require('./setSSI');
    setSSI(server, "orderingpartner", createOrderingPartnerSSI, "setOrderingPartnerSSI", "traceability." + mah);
}

module.exports = {
    command,
    createOrderingPartnerSSI
};

},{"./setSSI":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/commands/setSSI.js","opendsu":false}],"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/commands/setProductGtinBatchSSI.js":[function(require,module,exports){

function createProductGtinBatchSSI(data, domain) {
    console.log("New PRODUCT_GTIN_BATCH_SSI in domain", domain);
    const keyssiSpace = require("opendsu").loadApi("keyssi");
    return keyssiSpace.createArraySSI(domain, [data.gtin, data.batch]);
}

function command(server, mah){
    const setSSI = require('./setSSI');
    setSSI(server, "productBatch", createProductGtinBatchSSI, "setProductGtinBatchSSI", "traceability." + mah);
}

module.exports = {
    command,
    createProductGtinBatchSSI
};

},{"./setSSI":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/commands/setSSI.js","opendsu":false}],"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/commands/setProductGtinSSI.js":[function(require,module,exports){

function createProductGtinSSI(data, domain) {
    console.log("New PRODUCT_GTIN_SSI in domain", domain);
    const keyssiSpace = require("opendsu").loadApi("keyssi");
    return keyssiSpace.createArraySSI(domain, [data.gtin]);
}

function command(server, mah){
    const setSSI = require('./setSSI');
    setSSI(server, "product", createProductGtinSSI, "setProductGtinSSI", "traceability." + mah);
}

module.exports = {
    command,
    createProductGtinSSI
};

},{"./setSSI":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/commands/setSSI.js","opendsu":false}],"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/commands/setSSI.js":[function(require,module,exports){
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

},{"dsu-wizard":false}],"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/commands/setSendingPartnerSSI.js":[function(require,module,exports){

function createSendingPartnerSSI(data, domain) {
    console.log("New SENDING_PARTNER_SSI in domain", domain);
    const keyssiSpace = require("opendsu").loadApi("keyssi");
    return keyssiSpace.createArraySSI(domain, [data.gtin, data.batch, data.senderId]);
}

function command(server, mah){
    const setSSI = require('./setSSI');
    setSSI(server, "sendingpartner", createSendingPartnerSSI, "setSendingPartnerSSI", "traceability." + mah);
}

module.exports = {
    command,
    createSendingPartnerSSI
};

},{"./setSSI":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/commands/setSSI.js","opendsu":false}],"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/commands/setShipmentLineSSI.js":[function(require,module,exports){

function createShipmentLineSSI(data, domain) {
    console.log("New SHIPMENTLINE_SSI in domain", domain);
    const keyssiSpace = require("opendsu").loadApi("keyssi");
    return keyssiSpace.createArraySSI(domain, [data.senderId, data.shipmentId, data.gtin]);
}

function command(server){
    const setSSI = require('./setSSI');
    setSSI(server, "shipmentline", createShipmentLineSSI, "setShipmentLineSSI", "traceability");
}

module.exports = {
    command,
    createShipmentLineSSI
};

},{"./setSSI":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/commands/setSSI.js","opendsu":false}],"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/commands/setShipmentLinesSSI.js":[function(require,module,exports){

function createShipmentLinesSSI(data, domain) {
    console.log("New SHIPMENTLINES_SSI in domain", domain);
    const keyssiSpace = require("opendsu").loadApi("keyssi");
    return keyssiSpace.createArraySSI(domain, [data.gtin, data.batch, "SHIPMENTLINES"]);
}

function command(server, mah){
    const setSSI = require('./setSSI');
    setSSI(server, "shipmentLines", createShipmentLinesSSI, "setShipmentLinesSSI", "traceability." + mah);
}

module.exports = {
    command,
    createShipmentLinesSSI
};

},{"./setSSI":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/commands/setSSI.js","opendsu":false}],"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/commands/setShipmentSSI.js":[function(require,module,exports){


function createShipmentSSI(data, domain) {
    console.log("New SHIPMENT_SSI in domain", domain);
    const keyssiSpace = require("opendsu").loadApi("keyssi");
    return keyssiSpace.createArraySSI(domain, [data.senderId, data.shipmentId]);
}

function command(server){
    const setSSI = require('./setSSI');
    setSSI(server, "shipment", createShipmentSSI, "setShipmentSSI", "traceability");
}

module.exports = {
    command,
    createShipmentSSI
};

},{"./setSSI":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/commands/setSSI.js","opendsu":false}],"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/model/Actor.js":[function(require,module,exports){
class Actor{
    id = "";
    name = "";
    nif = "";
    address = "";

    constructor(actor){
        console.log("actor:" + actor);
        this._copyProps(actor);
    }

    _copyProps(actor){
        if (typeof actor !== undefined)
            for (let prop in actor)
                if (actor.hasOwnProperty(prop))
                    this[prop] = actor[prop];
    }

    validate() {
        const errors = [];
        if (!this.name)
            errors.push('Name is required.');
        if (!this.id)
            errors.push('id is required');
        if (!this.nif)
            errors.push('nif is required');

        return errors.length === 0 ? true : errors;
    }

    generateViewModel() {
        return {label: this.name, value: this.id}
    }
}

module.exports = Actor;
},{}],"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/model/Batch.js":[function(require,module,exports){
const Utils = require("./Utils.js");

/**
 * @prop {string} batchNumber
 * @prop {Date} expiryDate
 * @prop {string[]} serialNumbers
 */
class Batch {
    batchNumber;
    expiryForDisplay;
    serialNumbers = ["430239925150"];

    constructor(batch) {
        if (typeof batch !== undefined)
            for (let prop in batch)
                if (batch.hasOwnProperty(prop))
                    this[prop] = batch[prop];

        if (!this.batchNumber)
            this.batchNumber = Utils.generateSerialNumber(6);
    }

    generateViewModel() {
        return {label: this.batchNumber, value: this.batchNumber}
    }

    validate() {
        if (!this.batchNumber) {
            return 'Batch number is mandatory field';
        }
        if (!this.expiryForDisplay) {
            return  'Expiration date is a mandatory field.';
        }
        return undefined;
    }


    addSerialNumbers(serials){
        throw new Error("Not implemented");
    }
}

},{"./Utils.js":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/model/Utils.js"}],"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/model/MAH.js":[function(require,module,exports){
const Actor = require('./Actor');

class MAH extends Actor{

    constructor(mah) {
        super();
        if (typeof mah !== undefined)
            for (let prop in mah)
                if (mah.hasOwnProperty(prop))
                    this[prop] = mah[prop];
    }
}

module.exports = MAH;
},{"./Actor":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/model/Actor.js"}],"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/model/Order.js":[function(require,module,exports){
class Order{
    orderId;
    requesterId;
    senderId;
    shipToAddress;
    status;
    orderLines;

    constructor(orderId, requesterId, senderId, shipToAddress, status, orderLines) {
        this.orderId = orderId;
        this.requesterId = requesterId;
        this.senderId = senderId;
        this.shipToAddress = shipToAddress;
        this.status = status || "created";
        this.orderLines = orderLines || [];
    }
}

module.exports = Order;

},{}],"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/model/OrderLine.js":[function(require,module,exports){
class OrderLine{
    gtin;
    quantity;
    requesterId;
    senderId;

    constructor(gtin, quantity, requesterId, senderId){
        this.gtin = gtin;
        this.quantity = quantity;
        this.requesterId = requesterId;
        this.senderId = senderId;
    }
}

module.exports = OrderLine;

},{}],"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/model/Pharmacy.js":[function(require,module,exports){
const Actor = require('./Actor');

class Pharmacy extends Actor{
    deliveryAddress = "";

    constructor(pharmacy) {
        super();
        if (typeof pharmacy !== undefined)
            for (let prop in pharmacy)
                if (pharmacy.hasOwnProperty(prop))
                    this[prop] = pharmacy[prop];
    }

}

module.exports = Pharmacy;
},{"./Actor":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/model/Actor.js"}],"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/model/Product.js":[function(require,module,exports){
class Product {
    name = "";
    gtin = "";
    description = "";
    manufName = " ";
    reportURL = `${window.top.location.origin}/default-report.html`;

    constructor(product) {
        if (typeof product !== undefined) {
            for (let prop in product) {
                if (product.hasOwnProperty(prop))
                    this[prop] = product[prop];
            }
        }

        if (this.gtin === "") {
            this.gtin = '05290931025615';
        }
    }

    validate() {
        const errors = [];
        if (!this.name) {
            errors.push('Name is required.');
        }

        if (!this.gtin) {
            errors.push('GTIN is required.');
        }

        return errors.length === 0 ? true : errors;
    }

    generateViewModel() {
        return {label: this.name, value: this.gtin}
    }
}

module.exports = Product;
},{}],"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/model/Shipment.js":[function(require,module,exports){
class Shipment {
    shipmentId;
    requesterId;
    senderId;
    shipToAddress;
    status;

    constructor(shipmentId, requesterId, senderId, shipToAddress, status){
        this.shipmentId = shipmentId;
        this.requesterId = requesterId;
        this.senderId = senderId;
        this.shipToAddress = shipToAddress;
        this.status = status || "created";
    }
}

module.exports = Shipment;

},{}],"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/model/ShipmentLine.js":[function(require,module,exports){
class ShipmentLine{
    gtin;
    batch;
    quantity;
}

module.exports = ShipmentLine;

},{}],"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/model/Utils.js":[function(require,module,exports){
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
},{}],"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/model/Wholesaler.js":[function(require,module,exports){
const Actor = require('./Actor');

class Wholesaler extends Actor{
    originAddress = "";
    deliveryAddress = "";

    constructor(wholesaler) {
        super();
        if (typeof wholesaler !== undefined)
            for (let prop in wholesaler)
                if (wholesaler.hasOwnProperty(prop))
                    this[prop] = wholesaler[prop];
    }
}

module.exports = Wholesaler;
},{"./Actor":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/model/Actor.js"}],"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/services/DSUService.js":[function(require,module,exports){
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

},{"./utils.js":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/services/utils.js","form-data":false,"opendsu":false}],"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/services/IdService.js":[function(require,module,exports){
/**
 * @param {string} domain: anchoring domain. defaults to 'default'
 * @param {strategy} strategy
 */
function IdService(domain, strategy){
    const strategies = require('./strategy');
    const resolver = require('opendsu').loadApi('resolver');

    let isSimple = strategies.SIMPLE === (strategy || strategies.SIMPLE);
    domain = domain || "default";

    /**
     * Creates an Actor's Id DSU
     * @param {Actor} actor
     * @param {function} callback
     * @return {Object} keySSI;
     */
    this.create = function(actor, callback){
        if (isSimple){
            createSimple(actor, callback);
        } else {
            throw new Error("Not implemented"); // createAuthorized(order, callback);
        }
    }

    let createSimple = function(actor, callback){
        let keyGenFunction = require('../commands/setIdSSI').createIdSSI;
        let templateKeySSI = keyGenFunction(actor, domain);
        resolver.createDSUForExistingSSI(templateKeySSI, (err, dsu) => {
            if (err)
                return callback(err);
            dsu.writeFile('/', JSON.stringify(actor), (err) => {
                if (err)
                    return callback(err);
                dsu.getKeySSIAsObject((err, keySSI) => {
                    if (err)
                        return callback(err);
                    callback(undefined, keySSI);
                });
            });
        });
    }
}

module.exports = IdService;
},{"../commands/setIdSSI":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/commands/setIdSSI.js","./strategy":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/services/strategy.js","opendsu":false}],"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/services/LocaleService.js":[function(require,module,exports){
const LOCALE_PATH = "/resources/locale/";

const SUPPORTED = {
    en_US: "en_US"
}

/**
 * @param {DSUStorage} dsuStorage: the Controller's DSU Storage
 * @param {SUPPORTED} lang
 */
function LocaleService(dsuStorage, lang){
    lang = lang || SUPPORTED.en_US;
    let localeObj;

    /**
     * Loads the selected locale
     * @param {SUPPORTED} locale
     */
    this.loadLocale = function(locale){
        let path = `${LOCALE_PATH}${locale}.json`;
        dsuStorage.getObject(path, (err, result) => {
            if (err)
                throw new Error("Could not load locale file");
            console.log(`Loaded locale ${locale}`);
            localeObj = result;
        });
    }

    /**
     * Binds the locale object the the controller's model so it's accessible in every controller
     * @param {Object} model
     */
    this.bindToModel = function(model){
        if (!model || typeof model !== 'object')
            throw new Error("Model is not suitable for locale binding");
        model.locale = localeObj;
    }
    this.loadLocale(lang);
}

let localeService;

module.exports = {
    getInstance: function (dsuStorage, lang){
        if (!localeService)
            localeService = new LocaleService(dsuStorage, lang);
        return localeService;
    },
    supported: SUPPORTED
}
},{}],"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/services/OrderLineService.js":[function(require,module,exports){
const utils = require('./utils');

/**
 * @param {string} domain: anchoring domain. defaults to 'default'
 * @param {strategy} strategy
 */
function OrderLineService(domain, strategy){
    const strategies = require('./strategy');
    const OrderLine = require('../model').OrderLine;
    const endpoint = 'orderline';

    domain = domain || "default";
    let isSimple = strategies.SIMPLE === (strategy || strategies.SIMPLE);
    /**
     * Creates an order DSU
     * @param {string} orderId
     * @param {OrderLine} orderLine
     * @param {function} callback
     * @return {string} keySSI
     */
    this.create = function(orderId, orderLine, callback){

        let data = typeof orderLine == 'object' ? JSON.stringify(orderLine) : orderLine;

        let keyGenData = {
            gtin: orderLine.gtin,
            requesterId: orderLine.requesterId,
            orderId: orderId
        }

        if (isSimple){
            let keyGenFunction = require('../commands/setOrderLineSSI').createOrderLineSSI;
            let keySSI = keyGenFunction(keyGenData, domain);
            const resolver = utils.getResolver();
            resolver.createDSUForExistingSSI(keySSI, (err, dsu) => {
                if (err)
                    return callback(err);
                dsu.writeFile('/data', data, (err) => {
                    if (err)
                        return callback(err);
                    dsu.getKeySSIAsObject((err, keySSI) => {
                        if (err)
                            return callback(err);
                        callback(undefined, keySSI);
                    });
                });
            });
        } else {
            const DSUService = utils.getDSUService();

            let getEndpointData = function (orderLine){
                return {
                    endpoint: endpoint,
                    data: {
                        orderId: orderId,
                        gtin: orderLine.gtin,
                        requesterId: orderLine.requesterId
                    }
                }
            }

            DSUService.create(domain, getEndpointData(orderLine), (builder, cb) => {
                builder.addFileDataToDossier("/data", data, cb);
            }, callback);
        }
    };
}

module.exports = OrderLineService;
},{"../commands/setOrderLineSSI":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/commands/setOrderLineSSI.js","../model":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/model/index.js","./strategy":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/services/strategy.js","./utils":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/services/utils.js"}],"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/services/OrderService.js":[function(require,module,exports){
const utils = require('./utils');

/**
 * @param {string} domain: anchoring domain. defaults to 'default'
 * @param {strategy} strategy
 */
function OrderService(domain, strategy){
    const strategies = require('./strategy');
    const model = require('../model');
    const Order = model.Order;
    const endpoint = 'order';

    domain = domain || "default";
    const orderLineService = new (require('./OrderLineService'))(domain, strategy);

    let isSimple = strategies.SIMPLE === (strategy || strategies.SIMPLE);

    /**
     * Creates an order
     * @param {Order} order
     * @param {function} callback
     * @return {string} keySSI;
     */
    this.create = function(order, callback){
        if (isSimple){
            createSimple(order, callback);
        } else {
            createAuthorized(order, callback);
        }
    }

    let createSimple = function(order, callback){
        let keyGenFunction = require('../commands/setOrderSSI').createOrderSSI;
        let templateKeySSI = keyGenFunction(order, domain);
        const resolver = utils.getResolver();
        resolver.createDSUForExistingSSI(templateKeySSI, (err, dsu) => {
            if (err)
                return callback(err);
            dsu.writeFile('/data', JSON.stringify(order), (err) => {
                if (err)
                    return callback(err);
                createOrderLines(order, (err, orderLines) => {
                    if (err)
                        return callback(err);
                    dsu.writeFile('/lines', JSON.stringify(orderLines.map(o => o.getIdentifier(true))), (err) => {
                        if (err)
                            return callback(err);
                        dsu.getKeySSIAsObject((err, keySSI) => {
                            if (err)
                                return callback(err);
                            callback(undefined, keySSI);
                        });
                    });
                });
            });
        });
    }

    let createAuthorized = function(order, callback){
        const DSUService = utils.getDSUService();

        let getEndpointData = function (order){
            return {
                endpoint: endpoint,
                data: {
                    orderId: order.orderId,
                    requesterId: order.requesterId
                }
            }
        }

        DSUService.create(domain, getEndpointData(order), (builder, cb) => {
            builder.addFileDataToDossier("/data", JSON.stringify(order), (err)=> {
                if (err)
                    return cb(err);
                createOrderLines(order, (err, orderLines) => {
                    if (err)
                        return cb(err);
                    builder.addFileDataToDossier('/lines', JSON.stringify(orderLines.map(o => o.getIdentifier(true))), (err) => {
                        if (err)
                            return callback(err);
                        cb();
                    });
                });
            });
        }, callback);
    }

    /**
     * Creates OrderLines DSUs for each orderLine in order
     * @param {Order} order
     * @param {function} callback
     * @return {Object[]} keySSIs
     */
    let createOrderLines = function(order, callback){
        let orderLines = [];

        let iterator = function(order, items, callback){
            let orderLine = items.shift();
            if (!orderLine)
                return callback(undefined, orderLines);
            orderLineService.create(order.orderId, orderLine, (err, keySSI) => {
                if (err)
                    return callback(err);
                orderLines.push(keySSI);
                iterator(order, items, callback);
            });
        }
        // the slice() clones the array, so that the shitf() does not destroy it.
        iterator(order, order.orderLines.slice(), callback);
    }
}

module.exports = OrderService;
},{"../commands/setOrderSSI":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/commands/setOrderSSI.js","../model":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/model/index.js","./OrderLineService":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/services/OrderLineService.js","./strategy":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/services/strategy.js","./utils":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/services/utils.js"}],"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/services/ShipmentService.js":[function(require,module,exports){

},{}],"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/services/strategy.js":[function(require,module,exports){
const strategy = {
    AUTHORIZED: "authorized",
    SIMPLE: "simple"
}

module.exports = strategy;
},{}],"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/services/utils.js":[function(require,module,exports){
let resolver, DSUService;

function getResolver(){
	if (!resolver)
		resolver = require('opendsu').loadApi('resolver');
	return resolver;
}

function getDSUService(){
	if (!DSUService)
		DSUService = new (require('./DSUService'));
	return DSUService;
}


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
	getPostHandlerFor
}

},{"./DSUService":"/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/services/DSUService.js","opendsu":false}]},{},["/home/tvenceslau/workspace/pharmaledger/traceability/fgt-workspace/fgt-dsu-wizard/builds/tmp/wizard_intermediar.js"])