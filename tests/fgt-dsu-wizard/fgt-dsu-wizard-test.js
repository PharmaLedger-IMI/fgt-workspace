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

const wizard = require('../../fgt-dsu-wizard');
const dsuService = wizard.DSUService;

const noOfAgentsPerDomain = 2;

// Domain registering  -  What is this?
function getAgentName(index){
    return 'system' + index;
}
const agents = [...Array(noOfAgentsPerDomain).keys()].map(getAgentName);

let domain = 'traceability';




assert.callback('create ORDER DSU', (cb) => {
    //tir.addDomain(domain, agents, './constitution');
    dc.createTestFolder('OrderDSUTest', (err, folder) => {
        tir.launchApiHubTestNode(10, folder, err => {
            if (err)
                throw err;

            let initializer = function (ds, callback) {
                ds.addFileDataToDossier("/test", JSON.stringify({"id": 1, "cenas": "cenasasdsa"}), (err) => {
                    if (err)
                        return callback(err);
                    console.log("test file written");
                    callback();
                });
                console.log(ds);
            };

            // dsuService.create(domain, initializer, (err, keySSI) => {
            //     if (err)
            //         throw err;
            //

                cb();
            // });
        });
    });
}, 100000);

