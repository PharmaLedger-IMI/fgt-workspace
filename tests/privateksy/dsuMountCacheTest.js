process.env.NO_LOGS = true;

const { fork } = require('child_process');

// require("../../../../psknode/bundles/testsRuntime");
//
// const tir = require("../../../../psknode/tests/util/tir");

require("../../privatesky/psknode/bundles/testsRuntime");
const tir = require("../../privatesky/psknode/tests/util/tir");

const dc = require("double-check");
const assert = dc.assert;

const keyssi = require('opendsu').loadApi('keyssi');
const resolver = require('opendsu').loadApi('resolver');

const argParser = function(defaultOpts, args){
    let config = JSON.parse(JSON.stringify(defaultOpts));
    if (!args)
        return config;
    args = args.slice(2);
    const recognized = Object.keys(config);
    const notation = recognized.map(r => '--' + r);
    args.forEach(arg => {
        if (arg.includes('=')){
            let splits = arg.split('=');
            if (notation.indexOf(splits[0]) !== -1) {
                let result
                try {
                    result = eval(splits[1]);
                } catch (e) {
                    result = splits[1];
                }
                config[splits[0].substring(2)] = result;
            }
        }
    });
    return config;
}


// All these variables can be changed from the cmd line like so 'node w3cDIDStressTest.js --messages=12 ...'
const defaultOps = {
    updates: 10,               // number of messages
    updateTimeout: 1000,         // timeout between messages. 2ms seems to be the minimum before it breaks (in my pc). 10 seems to safely work
    kill: false,                // decides if kills the consumer after boot or not (to test with consumer online/offline)
    timeout: 200,                // timeout between the consumer started listening and actually sending the messages (or killing the consumer)
    assertTimeout: 1000000
}

const config = argParser(defaultOps, process.argv)

const INFO_PATH = '/info';
const SHIPMENT_PATH = '/shipment';

const mockOrder = {
    id: Math.floor(Math.random() * 10000000),
    data: "some data"
}

const createMockOrderDSU = function(callback){
    const orderKey = keyssi.createTemplateSeedSSI('default');
    resolver.createDSU(orderKey, (err, orderDSU) => {
        if (err)
            return callback(err);
        orderDSU.writeFile(INFO_PATH, JSON.stringify(mockOrder), (err) => {
            if (err)
                return callback(err);
            orderDSU.getKeySSIAsObject((err, keySSI) => {
                if (err)
                    return callback(err);
                console.log(`order dsu created with SSI ${keySSI.getIdentifier()}`)
                callback(undefined, keySSI)
            })
        });
    });
}

const updateMockOrderDSU = function(shipmentSSI, orderSSI, callback){
    resolver.loadDSU(orderSSI, (err, orderDSU) => {
        if (err)
            return callback(err);
        orderDSU.listMountedDSUs('/', (err, mounts) => {
            if (err)
                return callback(err);

            mounts = mounts.reduce((accum, m) => {
                accum[m.path] = m.identifier;
                return accum;
            }, {});

            if (mounts[SHIPMENT_PATH.substring(1)]) {
                if (mounts[SHIPMENT_PATH.substring(1)] !== shipmentSSI)
                    return callback(`KeySIS do not match/already existing`);
                return callback();
            }
            orderDSU.mount(SHIPMENT_PATH, shipmentSSI, (err) => {
                if (err)
                    return callback(err);
                callback()
            })
        });
    });
}

const cb = function(err, fork, ...results){
    if (err){
        if (fork)
            fork.send({terminate: err.message || err});
        throw err;
    }

    const finishedCB = results.pop();
    console.log(...results);
    finishedCB();
    setTimeout(() => {
        process.exit(err ? 1 : 0);
    }, 1000)
}

const evaluateTest = function(err, testFinished){
   assert.true(err === undefined)
    testFinished()

}

assert.callback('DSU cache Test', (testFinished) => {
    tir.launchVirtualMQNode(function (err, port) {
        if (err)
            return cb(err);
        const forked = fork('dsuMountCacheTestChild.js');

        let orderSSI;

        forked.on('message', (args) => {
            const {shipmentSSI, err, testResult} = args;
            if (err)
                return cb(err, forked);
            console.log(`Received ShipmentSSI: ${shipmentSSI}`);

            if (testResult){
                return evaluateTest(err, testFinished);
            }

            updateMockOrderDSU(shipmentSSI, orderSSI, err => {
                if (err)
                    return cb(err, forked);
                forked.send({
                    id: mockOrder.id,
                    orderSSI: orderSSI.derive().getIdentifier(),
                    runTest: true
                })
            });
        });

        createMockOrderDSU((err, orderKeySSI) => {
            if (err)
                return cb(err, forked);
            orderSSI = orderKeySSI;
            forked.send({
                id: mockOrder.orderId,
                orderSSI: orderKeySSI.derive().getIdentifier()
            });
        });
    });
}, config.assertTimeout);

