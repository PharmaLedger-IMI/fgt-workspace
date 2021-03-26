process.env.NO_LOGS = true;
process.env.PSK_CONFIG_LOCATION = process.cwd();

const path = require('path');

require(path.join('../../privatesky/psknode/bundles', 'testsRuntime.js'));     // test runtime
require(path.join('../../privatesky/psknode/bundles', 'pskruntime.js'));       // the whole 9 yards, can be replaced if only smaller modules are needed
const tir = require("../../privatesky/psknode/tests/util/tir");                // the test server framework

const dc = require("double-check");
const assert = dc.assert;
const resolver = require('opendsu').loadApi('resolver');

let domain = 'traceability';
let testName = 'DSUService test';

const model = require('../../fgt-dsu-wizard/model');
const strategies = require('../../pdm-dsu-toolkit/services/strategy');
const OrderLine = model.OrderLine;
const Order =  model.Order;
const OrderStatus = model.OrderStatus;

let strategyInUse = strategies.SIMPLE;

let orderLines = [];

for (let i = 0; i< 3; i++){
    orderLines.push(new OrderLine(97 * i + 1, 100 + 10 * i, 1, 100));
}

function getOrder(){
    let order = new Order(1, 1, 100, "address", "created", orderLines);
    return order;
    //return JSON.parse(JSON.stringify(order));
}

function createOrderDSU(strategy, order, callback){
    const orderService = new (require('../../fgt-dsu-wizard/services/OrderService'))(domain, strategy);
    orderService.create(order, callback);
}

/**
 *
 * @param {function} keySSI
 * @param {function} callback
 */
function validateOrder(keySSI, callback){
    if (typeof keySSI !== 'string')
        keySSI = keySSI.getIdentifier();

    console.log("Validating dsu...");
    let newlyGenKeySSI = require('../../fgt-dsu-wizard/commands/setOrderSSI').createOrderSSI(getOrder(), "traceability");
    assert.equal(keySSI, newlyGenKeySSI.getIdentifier(), "Keys do not match")
    console.log("OK - Keys match")

    let order = getOrder();

    resolver.loadDSU(keySSI, (err, dsu) => {
        if (err)
            return callback(err);
        assert.notNull(dsu, "DSU cannot be null");
        dsu.readFile("/info", (err, data) => {
            if (err)
                return callback(err);
            if (!data)
                return callback("no data found");

            try {
                // data may have a trailing 0x0d carriage-return
                // Uncommenting the line below, does not help to pin-point where the 0x0d was added...
                // data = Buffer.from(JSON.stringify(JSON.parse(data.toString())));
                assert.equal(JSON.stringify(order), data.toString(), "data does not match");
                console.log("OK - data matches");
            } catch (e){
                return callback(e);
            }

            dsu.readFile("/lines", (err, orderLines) => {
                if (err)
                    return callback(err);
                assert.notNull(orderLines);
                orderLines = JSON.parse(orderLines);
                validateOrderLines(order.orderLines, orderLines, (err) => {
                    if (err)
                        return callback(err);
                    dsu.readFile("/status/info", (err, data) => {
                        if (err) {
                            console.log("error reading status");
                            return callback(err);
                        }
                        assert.equal(JSON.stringify(OrderStatus.CREATED), data.toString(), "Mounted status do not match");
                        callback();
                    });
                });
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
        dsu.readFile("/info", (err, data) => {
            if (err)
                return callback(err);
            try {
                assert.equal(JSON.stringify(orderLine), data.toString());
                console.log(`OK - Orderline data matches ${data}`);
                validateOrderLines(orderLines, keySSIs, callback);
            } catch (e){
                return callback(e);
            }
        })
    });
}

assert.callback('Launch API Hub', (testFinished) => {
    dc.createTestFolder(testName, (err, folder) => {
        tir.launchApiHubTestNode(10, folder, err => {
            if (err)
                throw err;
            tir.addDomainsInBDNS(folder,  [domain], (err, bdns) => {    // not needed if you're not working on a custom domain
                if (err)
                    throw err;

                console.log('Updated bdns', bdns);

                createOrderDSU(strategyInUse, getOrder(), (err, keySSI) => {
                    if (err)
                        throw err;
                    validateOrder(keySSI, (err) => {
                        if (err)
                            throw err;
                        testFinished();
                    });
                });
            });
        });
    });
}, 300000);    // you have 300 seconds for it to happen


