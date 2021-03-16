process.env.NO_LOGS = true;
process.env.PSK_CONFIG_LOCATION = process.cwd();

const path = require('path');

// link ref wizrad.bunlles
//
// db.bundle
//
// import db from ......
//
// Manager(db)
//
// class Database{
//
//     get(key);
//
//     list(key);
//
//     set(key, value);
//
// }
//
// /**
//  * tradingPartrtnerId => DID => ConstSSI
//  * mount constSSI => /receiver
//  * import from /receiver/toInbox
//  *
//  * toInbox.send(api, keyssi)
//  */
// class toInbox{
//     send(api, keyssi){
//         /**
//          *
//          *   load inboxDSU (the secretSSI has to be here)
//          *   call the set method on the inbox dsu
//          *   <pre>
//          *   set('hardcoded_key', value){
//          *      copy of set method
//          *   }
//          *   </pre>>
//          *
//          *   in an Authorized version this inbox can have a public key, that the api-hub can verify.
//          *   right now security is just for show
//          */
//     }
// }

// /**
//  * @param {Archive} dsu
//  */
// class JsonDatabase{
//     constructor(dsu){
//
//     }
//     get(key){
//         console.log("read mount");
//     }
//
//     list(path){
//         let args = path.split("/");
//         return db[arg1][arg2]
//     }
//
//     set(key, value);
// }
//
// class MountDatabase{
//
//     get(key){
//         console.log("read mount return info");
//     }
//
//     // list(/order/received)
//     list(path){
//         listMounts(path)
//     }
//
//     // set ('/order/receved/keyssi', keyssi)
//     set(key, value){
//         console.log("mount keysii to key");
//     }
// }
//
//
//
// const db= require('../../fgr-dsu-db');

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

function getDummyOrder(){
    let order = new Order(refOrderId, refRequesterId, refSenderId, 'address')
    order.orderLines = JSON.parse(JSON.stringify(gtinsToOrder));
    return order;
}

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
                dsu.writeFile("/orderLines", JSON.stringify(orderLines.map(o => o.getIdentifier())), (err) => {
                    if (err)
                        return callback(err);
                    console.log("OrderLine data saved to order DSU");
                    callback(undefined, keySSI);
                });
            });
        });
    });
}

/**
 *
 * @param {function} keySSI
 * @param {function} callback
 */
function validateOrder(keySSI, callback){
    console.log("Validating dsu...");
    let newlyGenKeySSI = require('../../fgt-dsu-wizard/commands/setOrderSSI').createOrderSSI(getDummyOrder(), "traceability");
    assert.equal(keySSI.getIdentifier(true), newlyGenKeySSI.getIdentifier(true), "Keys do not match")
    console.log("OK - Keys match")

    let order = getDummyOrder();

    resolver.loadDSU(keySSI, (err, dsu) => {
        if (err)
            return callback(err);
        assert.notNull(dsu, "DSU cannot be null");
        dsu.readFile("/data", (err, data) => {
            if (err)
                return callback(err);
            if (!data)
                return callback("no data found");

            try {
                assert.equal(JSON.stringify(order), data.toString(), "data does not match");
                console.log("OK - data matches");
            } catch (e){
                return callback(e);
            }

            dsu.readFile("/orderLines", (err, orderLines) => {
                if (err)
                    return callback(err);
                assert.notNull(orderLines);
                orderLines = JSON.parse(orderLines);
                validateOrderLines(order.orderLines, orderLines, callback);
            });
        });
    });
}

function validateOrderLines(orderLines, keySSIs, callback){
    let orderLine = orderLines.shift();
    let keySSI = keySSIs.shift();

    if (!orderLine || !keySSI)
        return callback();

    resolver.loadDSU(keySSI, (err, dsu) => {
       if (err)
           return callback(err);
       console.log(`OK - orderline ${keySSI} loaded`);
       dsu.readFile("/data", (err, data) => {
           if (err)
               return callback(err);
           try {
               let dataObj = JSON.parse(data);
               let gtin = Object.keys(orderLine)[0];
               assert.equal(gtin, dataObj.gtin, "gtins do not match");
               assert.equal(orderLine[gtin], dataObj.quantity, "quantities do not match");

               console.log(`OK - Orderline data matches ${data}`);
               validateOrderLines(orderLines, keySSIs, callback);
           } catch (e){
               return callback(e);
           }
       })
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

                createOrderDSU((err, keySSI) => {
                   if (err)
                       throw err;
                   console.log("Order DSU created: ", keySSI);
                   validateOrder(keySSI, (err, result) => {
                       if (err)
                           throw err;

                       testFinished();
                   });
                });
            });
        });
    });
}, 5000);    // you have 5 seconds for it to happen


