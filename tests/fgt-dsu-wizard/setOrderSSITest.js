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
const setOrderSSI = require('../../fgt-dsu-wizard/commands/setOrderSSI.js');

let domain = 'traceability';
let testName = 'setOrderSSITest'

assert.callback('Launch API Hub', (cb) => {
    dc.createTestFolder(testName, (err, folder) => {
        tir.launchApiHubTestNode(10, folder, err => {
            if (err)
                throw err;
            tir.addDomainsInBDNS(folder,  [domain], (err, bdns) => {
                if (err)
                    throw err;
                console.log('Updated bdns', bdns);
                let aKeySSI = setOrderSSI.createOrderSSI({"orderId": "ORDER001", "requesterId": "TPPH0124"}, domain);
                assert.notNull(aKeySSI);
                assert.true(aKeySSI instanceof Object);
                assert.true(typeof aKeySSI.getIdentifier(true) === 'string');
                console.log("Done "+aKeySSI.getIdentifier(true));
                cb();
            });
        });
    });
}, 3000);


