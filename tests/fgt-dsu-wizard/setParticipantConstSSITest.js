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
const setParticipantConstSSI = require('../../fgt-dsu-wizard/commands/setParticipantConstSSI.js');

let domain = 'traceability';
let testName = 'setParticipantConstSSITest'

assert.callback('Launch API Hub', (cb) => {
    dc.createTestFolder(testName, (err, folder) => {
        tir.launchApiHubTestNode(10, folder, err => {
            if (err)
                throw err;
            tir.addDomainsInBDNS(folder,  [domain], (err, bdns) => {
                if (err)
                    throw err;
                console.log('Updated bdns', bdns);
                let participant1a =  {id: "MAH332"};
                let participant1b =  {id: participant1a.id};
                let participant2 =  {id: "WHS642"};
                let aKeySSI1a = setParticipantConstSSI.createParticipantConstSSI(participant1a, domain);
                assert.notNull(aKeySSI1a);
                assert.true(aKeySSI1a instanceof Object);
                assert.true(typeof aKeySSI1a.getIdentifier(true) === 'string');
                console.log("Done "+aKeySSI1a.getIdentifier(true));
                let aKeySSI1b = setParticipantConstSSI.createParticipantConstSSI(participant1b, domain);
                // test that for the same participant IDs, the same key identifier is generated.
                assert.equal(aKeySSI1a.getIdentifier(true), aKeySSI1b.getIdentifier(true));
                let aKeySSI2 = setParticipantConstSSI.createParticipantConstSSI(participant2, domain);
                // test that for distinct participant IDs, distinct key identifiers are generated.
                assert.notEqual(aKeySSI1a.getIdentifier(true), aKeySSI2.getIdentifier(true));
                cb();
            });
        });
    });
}, 3000);


