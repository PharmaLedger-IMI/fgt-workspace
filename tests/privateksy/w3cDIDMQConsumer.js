// Ignore the test
//process.exit();

require("../../privatesky/psknode/bundles/testsRuntime");

const tir = require("../../privatesky/psknode/tests/util/tir");
const dc = require("double-check");
const assert = dc.assert;


const opendsu = require("opendsu");
const w3cDID = opendsu.loadApi('w3cdid');

function consume(did) {
    did.readMessage((err, msg) => {
        if(err)
            throw err;
        console.log(`${did.getIdentifier()} received message: ${msg}`);
        consume(did);
    });
}

assert.callback('w3cDID MQ Consumer test - never finishes', (testFinished) => {
    w3cDID.createIdentity("demo", "myfirstDemoIdentity", (err, did) => {
        if (err) {
            throw err;
        }
        console.log(`${did.getIdentifier()} waiting for messages`);
        consume(did);
    });
}, 3600000);

