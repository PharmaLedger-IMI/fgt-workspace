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
const Participant = wizard.Model.Participant;
const ParticipantService = wizard.Services.ParticipantService;

let domain = 'traceability';
let testName = 'ParticipantServiceTest'

let participantService = new ParticipantService(domain);

assert.callback('Launch API Hub', (cb) => {
    dc.createTestFolder(testName, (err, folder) => {
        tir.launchApiHubTestNode(10, folder, err => {
            if (err)
                throw err;
            tir.addDomainsInBDNS(folder,  [domain], (err, bdns) => {
                if (err)
                    throw err;
                console.log('Updated bdns', bdns);
                let participant1a = new Participant({id: "MAH332", name: "PName", email: "usr@dom", tin: "123456", address: "address etc..."});
                let inbox1a = { orderLines: [ "sRead1", "sRead2" ], shipmentLines: [], receivedOrders: [], receivedShipments: []};
                participantService.create(participant1a, inbox1a, (err, participant1aKeySSI) => {
                    assert.false(err);
                    assert.notNull(participant1aKeySSI);
                    console.log("participant key=",participant1aKeySSI.getIdentifier());
                    participantService.locateConstDSU(participant1a.id, (err, p1aDsu) => {
                        if (err)
                            throw err;
                        assert.notNull(p1aDsu);
                        //console.log(p1aDsu);
                        // creating a dup participant must fail
                        participantService.create(participant1a, undefined, (err, participant1bKeySSI) => {
                            //console.log("ERROR ",err);
                            assert.notNull(err);
                            cb();
                        });
                    });
                });
            });
        });
    });
}, 3000);


