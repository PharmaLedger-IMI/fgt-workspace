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
const keyssispace = require('opendsu').loadApi('keyssi');


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

/**
 * Creates
 * @param gtin
 * @param quantity
 * @param requesterId
 * @param orderId
 * @param callback
 */
function createOrderLineDSU(gtin, quantity, requesterId, orderId, callback){
    let keyGen = require('../../fgt-dsu-wizard/commands/setOrderLineSSI').createOrderLineSSI;
    let keySSI = keyGen({"gtin": gtin, "orderId": orderId, "requesterId": requesterId}, domain);
    resolver.createDSUForExistingSSI(keySSI, (err, dsu) => {
        if (err)
            return callback(err);
        let orderLine = new OrderLine(gtin, quantity, requesterId);
        dsu.writeFile('/data', JSON.stringify(orderLine), (err, result) => {
           if (err)
               return callback(err);
           console.log(`OrderLine of gtin ${gtin} times ${quantity}`, result);
           callback(undefined, keySSI);
        });
    });
}

/**
 * Creates, based on the item list in the provided order, an OrderLine DSU for each item
 * @param {Order} order the order object
 * @param {function} callback (err, list of created dsu's keyssi's)
 */
function createOrderLinesFromItems(order, callback){
    let orderLines = [];

    let iterator = function(order, items, callback){
        let orderLine = items.shift();
        if (!orderLine)
            return callback(undefined, orderLines);
        let gtin = Object.keys(orderLine)[0];
        createOrderLineDSU(gtin, orderLine[gtin], order.requesterId, order.orderId,(err, keySSI) => {
            if (err)
                return callback(err);
            orderLines.push(keySSI);
            iterator(order, items, callback);
        });
    }
    iterator(order, order.orderLines, callback);
}

function createOrderDSU(callback){

    function getDummyOrder(){
        let order = new Order(refOrderId++, refRequesterId, refSenderId, 'address')
        order.orderLines = gtinsToOrder;
        return order;
    }
    let order = getDummyOrder();

    let keyGen = require('../../fgt-dsu-wizard/commands/setOrderSSI').createOrderSSI;
    let keySSI = keyGen(order, domain);

    resolver.createDSUForExistingSSI(keySSI, (err, dsu) => {
        if (err)
            return callback(err);

        dsu.writeFile("/data", JSON.stringify(order), (err) => {
            if (err)
                return callback(err);

            createOrderLinesFromItems(order, (err, orderLines) => {
                if (err)
                    return callback(err);
                console.log(`Created the following OrderLines: ${orderLines}`)
                dsu.writeFile("/orderLines", JSON.stringify(orderLines), (err) => {
                    if (err)
                        return callback(err);
                    console.log("OrderLine data saved to order DSU");
                    callback(undefined, keySSI);
                });
            });
        });
    });
}

assert.callback(testName, (testFinished) => {
    dc.createTestFolder(testName, (err, folder) => {
        tir.launchApiHubTestNode(10, folder, err => {
            if (err)
                throw err;
            tir.addDomainsInBDNS(folder,  [domain], (err, bdns) => {    // not needed if you're not working on a custom domain
                if (err)
                    throw err;

                console.log('Updated bdns', bdns);

                createOrderDSU((err, result) => {
                   if (err)
                       throw err;
                   console.log("test finished: ", result);
                   testFinished();
                });
            });
        });
    });
}, 5000);    // you have 5 seconds for it to happen


