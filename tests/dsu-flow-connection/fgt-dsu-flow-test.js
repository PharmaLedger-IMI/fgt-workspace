process.env.NO_LOGS = true;
process.env.PSK_CONFIG_LOCATION = process.cwd();

const path = require('path');

// update the require path!!!

require(path.join('../../privatesky/psknode/bundles', 'testsRuntime.js'));     // test runtime
require(path.join('../../privatesky/psknode/bundles', 'pskruntime.js'));       // the whole 9 yards, can be replaced if only smaller modules are needed
const tir = require("../../privatesky/psknode/tests/util/tir");                // the test server framework

const dc = require("double-check");
const assert = dc.assert;

let domain = 'traceability';
let testName = 'TraceabilityDSUFlowTest';


const resolver = require('opendsu').loadApi('resolver');

const model = require('../../fgt-dsu-wizard/model')
const Order = model.Order;
const OrderLine = model.OrderLine;

let refOrderId = 1;
let refRequesterId = 1
let refSenderId = 1;

const gtinsToOrder = [
    {"1": 200},
    {"2": 300},
    {"5": 5}
]

function fail(reason, err){
    if (typeof reason === 'object'){
        err = reason;
        reason = "Unexpected error"
    }

    assert.forceFailTest(reason, err);
}

function createOrderLineDSU(gtin, quantity, requesterId, callback){
    let keyGen = require('../../fgt-dsu-wizard/commands/setOrderSSI').createOrderSSI;
    let keySSI = keyGen({"gtin": gtin, "quantity": quantity, "requesterId": requesterId}, domain);
    resolver.createDSUForExistingSSI(keySSI, (err, dsu) => {
        if (err)
            return callback(err);
        let orderLine = new OrderLine(gtin, quantity, requesterId);
        dsu.writeFile('/data', JSON.stringify(orderLine), (err, result) => {
           if (err)
               return callback(err);
           let updatedKeySSI = dsu.getKeySSIAsString();
           console.log(`OrderLine of gtin ${gtin} times ${quantity}`, result);
        });
    });
}

function createOrderLinesFromItems(requesterId, items, callback){
    let orderLine = items.shift();
    if (!orderLine)
        return callback();
    createOrderLineDSU(orderLine[0], orderLine[1], requesterId, (err, result) => {
       if (err)
           return callback(err);
       createOrderLinesFromItems(requesterId, items, callback);
    });
}

function createOrderDSU(callback){

    function getDummyOrder(){
        let order = new Order(refOrderId++, refRequesterId, refSenderId, 'address')
        order.items = gtinsToOrder;
        return order;
    }
    let order = getDummyOrder();

    let keyGen = require('../../fgt-dsu-wizard/commands/setOrderSSI').createOrderSSI;
    let keySSI = keyGen(order, domain);
    console.log(keySSI)
    console.log(keySSI.getIdentifier(true));

    resolver.createDSUForExistingSSI(keySSI, (err, dsu) => {
        if (err)
            return callback(err);

        dsu.writeFile("/data", JSON.stringify(order), (err) => {
            if (err)
                return callback(err);

            dsu.getKeySSIAsString((err, strKeySSI) => {
                if (err)
                    return callback(err);

                resolver.loadDSU(strKeySSI, (err, updatedDsu) => {
                    if (err)
                        return callback(err);
                    updatedDsu.getKeySSIAsString((err, updatedKeySSI) => {
                        if (err)
                            return callback(err);
                        // createOrderLinesFromItems(order.requesterId, order.items, (err, result) => {
                        //     if (err)
                        //         return callback(err);
                            callback(undefined, updatedKeySSI);
                        // });
                    });
                });
            });

        });
    });
}

assert.callback(testName, (testFinished) => {
    dc.createTestFolder(testName, (err, folder) => {
        tir.launchApiHubTestNode(10, folder, err => {
            if (err)
                fail("Could not launch Apihub", err);
            tir.addDomainsInBDNS(folder,  [domain], (err, bdns) => {    // not needed if you're not working on a custom domain
                if (err)
                    fail("Could not add domain", err);

                console.log('Updated bdns', bdns);

                createOrderDSU((err, result) => {
                   if (err)
                       fail("could not create order", err);
                   console.log("test finished: ", result);
                   testFinished();
                });
            });
        });
    });
}, 5000);    // you have 5 seconds for it to happen


