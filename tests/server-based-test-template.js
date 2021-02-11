process.env.NO_LOGS = true;
process.env.PSK_CONFIG_LOCATION = process.cwd();

const path = require('path');

// update the require path!!!

require(path.join('../privatesky/psknode/bundles', 'testsRuntime.js'));     // test runtime
require(path.join('../privatesky/psknode/bundles', 'pskruntime.js'));       // the whole 9 yards, can be replaced if only smaller modules are needed
const tir = require("../privatesky/psknode/tests/util/tir");                // the test server framework

const dc = require("double-check");
const assert = dc.assert;

let domain = 'test_domain';
let testName = 'Test Template';

assert.callback('Launch API Hub', (testFinished) => {
    dc.createTestFolder(testName, (err, folder) => {
        tir.launchApiHubTestNode(10, folder, err => {
            if (err)
                throw err;
            tir.addDomainsInBDNS(folder,  [domain], (err, bdns) => {    // not needed if you're not working on a custom domain
                if (err)
                    throw err;

                console.log('Updated bdns', bdns);

                // do stuff

                testFinished();           // this marks a successful test
            });
        });
    });
}, 3000);    // you have 3 seconds for it to happen


