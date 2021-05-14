process.env.NO_LOGS = true;

const { fork } = require('child_process');

const { argParser } = require('../../bin/environment/utils');

require("../../privatesky/psknode/bundles/openDSU");

const opendsu = require("opendsu");
const w3cDID = opendsu.loadApi('w3cdid');

const defaultOps = {
    receiver: 'myfirstDemoIdentity', //'receiverWc3DIDString' + Math.floor(Math.random() * 10000000),
    sender: 'senderWc3DIDString' + Math.floor(Math.random() * 10000000),
    domain: 'traceability',
    didMethod: 'demo',
    messages: 10,
    kill: false,
    timeout: 200
}

const config = argParser(defaultOps, process.argv)

let msgCount = 0;

let timeBeforeMessages, timeAfterMessages, timeMessagesSent;

const someData = {
    key1: 'value',
    key2: 'looooooooooooooooooooooonger vaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaalue'
}

w3cDID.createIdentity(config.didMethod, config.sender, (err, senderDID) => {
    if (err)
        throw err;
    // const forked = fork('dbAndDidChild.js');
    // forked.on('message', (receiverDID) => {
    //     console.log(`received created and listening`);

        const sendMessage = function(){
           console.log("Sending message", JSON.stringify(someData), " to receiver ", config.receiver);
           senderDID.sendMessage(JSON.stringify(someData), `did:demo:myfirstDemoIdentity`/*receiverDID*/,  (err) => {
               if (err)
                   return console.log(`Error sending message`, err);
               msgCount++;
               console.log(`Message successfully sent ${msgCount}`);
               if (msgCount === config.messages){
                   timeMessagesSent = Date.now();
                   console.log(`all messages sent in ${timeMessagesSent - timeAfterMessages}ms. closing test in 1 second`)
                   setTimeout(() => process.exit(0), 1000);
               }
           });
        }

        const runTest = function(){
           timeBeforeMessages = Date.now();
           console.log(`Before Messages: ${timeBeforeMessages}`);

           for (let i = 0; i < config.messages; i++)
               sendMessage();

           timeAfterMessages = Date.now();
           console.log(`After Messages: ${timeAfterMessages}. Elapsed: ${timeAfterMessages - timeBeforeMessages}`);

           setTimeout(() => console.log('after 10- sec'), 10000);
        }

        // if (config.kill){
        //     forked.send({terminate: true});
        //     return setTimeout(() => runTest(), 100); // on a timer just to allow the child to properly terminate
        // }

        runTest();
    // });
    //
    // forked.send({
    //     id: config.receiver,
    //     didMethod: config.didMethod,
    //     messages: config.messages,
    //     timeout: config.timeout
    // });
});
