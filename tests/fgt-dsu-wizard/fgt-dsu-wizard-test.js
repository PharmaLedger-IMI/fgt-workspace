process.env.NO_LOGS = true;
process.env.PSK_CONFIG_LOCATION = process.cwd();

const path = require('path');

const test_bundles_path = path.join('../../privatesky/psknode/bundles', 'testsRuntime.js');
const pskruntime_path = path.join('../../privatesky/psknode/bundles', 'pskruntime.js');
require(test_bundles_path);
require(pskruntime_path);

const dc = require("double-check");
const assert = dc.assert;
const tir = require("../../privatesky/psknode/tests/util/tir");
const resolver = require('opendsu').loadApi('resolver');

const wizard = require('../../fgt-dsu-wizard');
const dsuService = wizard.DSUService;

let domain = 'traceability';
let testName = 'OrderDSUTest'

assert.callback(testName, (cb) => {
    dc.createTestFolder(testName, (err, folder) => {
        tir.launchApiHubTestNode(10, folder, err => {
            if (err)
                throw err;
            tir.addDomainsInBDNS(folder,  [domain], (err, bdns) => {
                if (err)
                    throw err;

                console.log('Updated bdns', bdns);

                let testData = {"id": 1, "cenas": "cenasasdsa"};

                let initializer = function (ds, callback) {
                    ds.addFileDataToDossier("/test", JSON.stringify(testData), (err) => {
                        if (err)
                            return callback(err);
                        console.log("test file written");
                        callback();
                    });
                };

                let endpointData = {
                    endpoint: 'order',
                    data:{
                        orderId: 'sadsadsadasd',
                        requesterId: "sadasdasd"
                    }
                }

                dsuService.create(domain, endpointData, initializer, (err, keySSI) => {
                    if (err)
                        throw err;
                    console.log("Order dsu created with keyssi", keySSI);

                    resolver.loadDSU(keySSI, (err, dsu) => {
                        if (err)
                            throw err;
                        assert.notNull(dsu, "loaded DSU can't be null");

                        dsu.readFile('/test', (err, data) => {
                            if (err)
                                throw err;
                            assert.equal(JSON.stringify(testData), JSON.stringify(JSON.parse(data.toString())), "data equality 2");
                            assert.equal(JSON.stringify(testData), data.toString(), "data equality 3");
                            cb();
                        });
                    });
                });
            });
        });
    });
}, 3000);


