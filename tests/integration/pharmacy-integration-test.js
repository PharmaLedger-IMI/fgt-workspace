// Ignore the test as it is failing!
//process.exit();

/**
 * Options:
 * (optional) --fakeServer=true (default) or -fakeServer=false  
 */
process.env.NO_LOGS = true;
process.env.PSK_CONFIG_LOCATION = process.cwd();

const path = require('path');

require(path.join('../../privatesky/psknode/bundles', 'testsRuntime.js'));     // test runtime
require(path.join('../../privatesky/psknode/bundles', 'pskruntime.js'));       // the whole 9 yards, can be replaced if only
require(path.join('../../fgt-mah-ssapp/code/scripts/bundles', 'wizard.js'))

const dc = require("double-check");
const assert = dc.assert;
const opendsu = require("opendsu");
const resolver = opendsu.loadApi("resolver");
const keyssispace = opendsu.loadApi("keyssi");

const wizard = require('../../fgt-dsu-wizard');
const dsuService = wizard.DSUService;
const Participant = wizard.Model.Participant;
const Order = wizard.Model.Order;
const OrderLine = wizard.Model.OrderLine;
const OrderStatus = wizard.Model.OrderStatus;
const {INBOX_MOUNT_PATH, INBOX_RECEIVED_ORDERS_PROP, INBOX_RECEIVED_ORDERS_PATH, INBOX_RECEIVED_SHIPMENTS_PROP} = wizard.Constants;

let domains = ['traceability'];
let testName = 'Pharmacy integration Test';

const defaultOps = {
    timeout: 3000,
    fakeServer: true
}

const argParser = function (args) {
    let config = JSON.parse(JSON.stringify(defaultOps));
    if (!args)
        return config;
    args = args.slice(2);
    const recognized = Object.keys(config);
    const notation = recognized.map(r => '--' + r);
    args.forEach(arg => {
        if (arg.includes('=')) {
            let splits = arg.split('=');
            if (notation.indexOf(splits[0]) !== -1)
                config[splits[0].substring(2)] = eval(splits[1]);
        }
    });
    return config;
}

const launchTestServer = function (timeout, testFunction) {     // the test server framework
    const tir = require("../../privatesky/psknode/tests/util/tir");
    assert.callback('Launch API Hub', (testFinished) => {
        dc.createTestFolder(testName, (err, folder) => {
            tir.launchApiHubTestNode(10, folder, err => {
                if (err)
                    throw err;
                tir.addDomainsInBDNS(folder, domains, (err, bdns) => {    // not needed if you're not working on a custom domain
                    if (err)
                        throw err;
                    console.log('Updated bdns', bdns);
                    testFunction((err)=>{
                        if (err) {
                            console.log("TEST HAS FAILED", err);
                            assert.false(err);
                        } else
                            testFinished();
                    });
                });
            });
        });
    }, timeout);
}

let mainDsu = undefined; // Emulated SSApp DSU. Initialized on createMainDSU.
let participantManager = undefined; // Initialized on createMainDSU
let orderManager = undefined; // belongs to the participant above, after initialization.
let pharmacyParticipant = undefined;
let wholesalerParticipant = undefined;

const participantService = new (wizard.Services.ParticipantService)(domains[0]);

// setup mainDsu (emulates an SSApp DSU) and the participantManager.
function createMainDSU(callback) {
    keyssispace.createSeedSSI(domains[0], function (err, aSeedSSI) {
        console.log("mainDSU (SSApp) seedSSI identifier: " + aSeedSSI.getIdentifier(true));
        //Create a main DSU
        resolver.createDSU(aSeedSSI, (err, dsuInstance) => {
            //Reached when DSU created
            if (err)
                return callback(err);
            mainDsu = dsuInstance;
            // set DSUStorage methods on mainDsu
            mainDsu.getObject = function (path, callback) {
                mainDsu.readFile(path, function (err, res) {
                    if (err)
                        return callback(err);
                    try {
                        res = JSON.parse(res.toString());
                    } catch (err) {
                        return callback(err);
                    }
                    callback(undefined, res);
                });
            };
            mainDsu.enableDirectAccess = function(callback) {
                callback(undefined, true);
            };
            participantManager = wizard.Managers.getParticipantManager(mainDsu, domains[0]);
            orderManager = wizard.Managers.getOrderManager(mainDsu);
            callback();
        });
    });
};

function createParticipant1(callback) {
    pharmacyParticipant = new Participant({ id: "PHA221", name: "Pharmacy221Name", email: "pha221@dom", tin: "123456", address: "Pharmacy221 address etc..." });
    participantManager.registerPharmacy(pharmacyParticipant, (err) => {
        if (err)
            return callback(err);
        console.log("Pharmacy registered");
        callback();        
    });
}

function createParticipant2(callback) {
    // The Wholesaler has a receivedOrders and receivedShipments inbox
    let inbox = {};
    inbox[INBOX_RECEIVED_SHIPMENTS_PROP] = [];
    inbox[INBOX_RECEIVED_ORDERS_PROP] = [];
    wholesalerParticipant = new Participant({ id: "WHS321", name: "Wholesaler321Name", email: "whs321@dom", tin: "123456", address: "Wholesaler321 address etc..." });
    participantService.create(wholesalerParticipant, inbox, (err, keySSI) => {
        if (err)
            return callback(err);
        console.log("Wholesaler registered keySSI="+keySSI.getIdentifier());
        callback();        
    });
};

function createParticipant1Order(callback) {
    let orderLine1 = new OrderLine("985726", 2, pharmacyParticipant.id, wholesalerParticipant.id);
    let order1 = new Order("ORDER001", "PHA221", "WHS321", "ShipToAddress1", OrderStatus.CREATED, [orderLine1]);
    participantManager.createIssuedOrder(orderManager, order1, (err, keySSI, mountPath) => {
        if (err)
            return callback(err);
        console.log("Order created with "+keySSI.getIdentifier()+" mounted at "+mountPath);
        callback();
    });
};

function checkParticipant2ReceivedOrder(callback) {
    participantManager.locateConstWithInbox(wholesalerParticipant.id, INBOX_RECEIVED_ORDERS_PROP, (err, wholesalerDSU) => {
        if (err)
            return callback(err);
        let wholesalerReceivedOrdersPath = INBOX_MOUNT_PATH.substring(1) + INBOX_RECEIVED_ORDERS_PATH;
        wholesalerDSU.readFile(wholesalerReceivedOrdersPath, (err, buffer) => {
            if (err)
                return callback(createOpenDSUErrorWrapper("Cannot read file " + otherInboxPropPath, err));
            console.log("Wholesaler inbox.receivedOrders ", JSON.parse(buffer));
            callback();
        });
    });
};

const runTest = function (testFinished) {
    createMainDSU(function (err) {
        if (err)
            return testFinished(err);
        createParticipant1(function (err) {
            if (err)
                return testFinished(err);
            createParticipant2(function (err) {
                if (err)
                    return testFinished(err);
                createParticipant1Order(function (err) {
                    if (err)
                        return testFinished(err);
                    checkParticipant2ReceivedOrder(function (err) {
                        if (err)
                            return testFinished(err);
                        testFinished();
                    });
                })
            })
        })
    });
}

let conf = argParser(process.argv);
if (conf.fakeServer)
    launchTestServer(conf.timeout, runTest)
else
    runTest((err) => {
        if (err) {
            console.log("FAILED", err);
        }
        console.log(`Test ${testName} finished`);
    });



