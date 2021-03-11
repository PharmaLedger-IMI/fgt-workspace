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
const setInboxSSI = require('../../fgt-dsu-wizard/commands/setInboxSSI.js');

let domain = 'traceability';
let testName = 'setInboxSSITest'

assert.callback('Launch API Hub', (cb) => {
    dc.createTestFolder(testName, (err, folder) => {
        tir.launchApiHubTestNode(10, folder, err => {
            if (err)
                throw err;
            tir.addDomainsInBDNS(folder,  [domain], (err, bdns) => {
                if (err)
                    throw err;
                console.log('Updated bdns', bdns);
                let inbox1 =  {stuff: "some stuff"};
                let aKeySSI1 = setInboxSSI.createInboxSSI(inbox1, domain);
                assert.notNull(aKeySSI1);
                assert.true(aKeySSI1 instanceof Object);
                assert.true(typeof aKeySSI1.getIdentifier(true) === 'string');
                console.log("Done "+aKeySSI1.getIdentifier(true));
                cb();
            });
        });
    });
}, 3000);


