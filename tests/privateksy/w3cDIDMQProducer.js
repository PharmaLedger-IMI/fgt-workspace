// Ignore the test
//process.exit();

require("../../privatesky/psknode/bundles/testsRuntime");

const tir = require("../../privatesky/psknode/tests/util/tir");
const dc = require("double-check");
const assert = dc.assert;


const opendsu = require("opendsu");
const w3cDID = opendsu.loadApi('w3cdid')
const keySSI = opendsu.loadApi("keyssi");

const firstDIDIdentifier = "did:demo:myfirstDemoIdentity"; // PASTE THE DID identifier here


assert.callback('w3cDID MQ Producer test', (testFinished) => {
    w3cDID.createIdentity("demo", "otherDemoIdentity", (err, did) => {
        if (err)
            throw err;
        setTimeout(() => {
            const msg = `Message created at ${Date.now()}`;
            did.sendMessage(msg, firstDIDIdentifier, (err) => {
                if (err) {
                    throw err;
                }
                console.log(`${did.getIdentifier()} sent message "${msg}" to ${firstDIDIdentifier}.`);
                setTimeout(() => {
                    // wait 1 sec for processing
                    testFinished();
                }, 1000);
            });
        }, 1000);
    });
}, 15000);

