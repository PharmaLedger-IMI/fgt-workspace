// Ignore the test
//process.exit();

require("../../privatesky/psknode/bundles/testsRuntime");

const tir = require("../../privatesky/psknode/tests/util/tir");
const dc = require("double-check");
const assert = dc.assert;


const opendsu = require("opendsu");
const w3cDID = opendsu.loadApi('w3cdid');

const firstDIDIdentifier = "did:demo:myfirstDemoIdentity"; // PASTE THE DID identifier here

const timeout = 0;
const messages = 10;

assert.callback('w3cDID MQ Producer test', (testFinished) => {
    w3cDID.createIdentity("demo", "otherDemoIdentity", (err, did) => {
        if (err)
            throw err;

        const sendMessage = function(){
            const msg = `Message created at ${Date.now()}`;
            did.sendMessage(msg, firstDIDIdentifier, (err) => {
                if (err) {
                    throw err;
                }
                console.log(`${did.getIdentifier()} sent message "${msg}" to ${firstDIDIdentifier}.`);
            });
        }

        if (!timeout){
            for (let i = 0; i < messages; i++) {
                sendMessage()
            }
        } else {
            let counter = 0;

            const iterator = function(){
                console.log(`sending message ${++counter}`);
                sendMessage();
                if (counter < messages)
                    setTimeout(() => iterator(), timeout);
                else{
                    console.log(`PRODUCER: All messages sent`);
                    testFinished()
                }
            }
        }
    });
}, 45000);

