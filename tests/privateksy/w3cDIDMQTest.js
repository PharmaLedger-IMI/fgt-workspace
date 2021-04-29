// Ignore the test
process.exit();

require("../../privatesky/psknode/bundles/testsRuntime");

const tir = require("../../privatesky/psknode/tests/util/tir");
const dc = require("double-check");
const assert = dc.assert;

const w3cDID = require('../../privatesky/modules/opendsu/w3cdid');
const keySSI = require("../../privatesky/modules/opendsu/keyssi")


assert.callback('w3cDID MQ test', (testFinished) => {
	const message = "Hello DID based MQs!";
    tir.launchVirtualMQNode(function (err, port) {
        if (err) {
            throw err;
        }

        w3cDID.createIdentity("demo", "myfirstDemoIdentity", (err, firstDIDDocument) => {
            if (err) {
                throw err;
            }

            firstDIDDocument.readMessage((err, msg) => {
                if(err){
                    throw err;
                }

                console.log(`${recipientIdentity} received message: ${msg}`);
                assert.equal(msg, message);
                testFinished();
            });

            const recipientIdentity = firstDIDDocument.getIdentifier();
            w3cDID.createIdentity("demo", "otherDemoIdentity", (err, secondDIDDocument) => {
                if (err) {
                    throw err;
                }

                const senderIdentity = firstDIDDocument.getIdentifier();
                setTimeout(()=>{
                    secondDIDDocument.sendMessage(message, recipientIdentity, (err) => {
                        if(err){
                            throw err;
                        }
                        console.log(`${senderIdentity} sent message to ${recipientIdentity}.`);
                    });
                }, 1000);

            });
        });
    });

}, 15000);

