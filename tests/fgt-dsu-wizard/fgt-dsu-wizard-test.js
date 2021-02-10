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

function fail(reason, err){
    if (typeof reason === 'object'){
        err = reason;
        reason = "Unexpected error"
    }

    assert.forceFailTest(reason, err);
}

const wizard = require('../../fgt-dsu-wizard');
const dsuService = wizard.DSUService;

let domain = 'traceability';
let testName = 'OrderDSUTest'

assert.callback(testName, (cb) => {
    dc.createTestFolder(testName, (err, folder) => {
        tir.launchApiHubTestNode(10, folder, err => {
            if (err)
                fail("Could not launch Apihub", err);
            tir.addDomainsInBDNS(folder,  [domain], (err, bdns) => {
                if (err)
                    fail("Could not add domain", err);

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
                        fail("could not create dsu", err);
                    console.log("Order dsu created with keyssi", keySSI);

                    resolver.loadDSU(keySSI, (err, dsu) => {
                        if (err)
                            fail("could not re-load dsu", err);
                        assert.notNull(dsu, "loaded DSU can't be null");

                        dsu.readFile('/test', (err, data) => {
                            if (err)
                                fail("could not re-read data", err);
                            try{
                                assert.test("data equality test", () => {
                                    return JSON.stringify(testData) === data;
                                });
                            } catch (e){
                                fail("could not parse data", e);
                            }

                            cb();
                        });
                    });
                });
            });
        });
    });
}, 3000);


