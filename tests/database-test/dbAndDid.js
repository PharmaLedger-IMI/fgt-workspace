process.env.NO_LOGS = true;

const { fork } = require('child_process');

const { argParser } = require('../../bin/environment/utils');

require("../../privatesky/psknode/bundles/openDSU");

const opendsu = require("opendsu");
const w3cDID = opendsu.loadApi('w3cdid');

const defaultOps = {
    receiver: 'myfirstDemoIdentity', //'receiverWc3DIDString' + Math.floor(Math.random() * 10000000),
    sender: 'senderWc3DIDString' + Math.floor(Math.random() * 10000000),
    kill: false,
    domain: 'traceability',
    didMethod: 'demo',
    messages: 10,
    timeout: 0
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
    const forked = fork('dbAndDidChild.js');
    forked.on('message', (receiverDID) => {
        console.log(`received created and listening`);
        if (config.kill){
           forked.kill('SIGINT');
           console.log(`received process shutdown`);
        }

        const sendMessage = function(receiver){
           console.log("Sending message", JSON.stringify(someData), " to receiver ", config.receiver);
           senderDID.sendMessage(JSON.stringify(someData), receiver.getIdentifier(),  (err) => {
               if (err)
                   return console.log(`Error sending message`, err);
               msgCount++;
               console.log(`Message successfully sent ${msgCount}`);
               if (msgCount === config.messages){
                   timeMessagesSent = Date.now();
                   console.log(`all messages sent in ${timeMessagesSent - timeAfterMessages}ms. closing test in 3 second`)
                   setTimeout(() => process.exit(0), 3000);
               }
           });
        }

        const runTest = function(){
           timeBeforeMessages = Date.now();
           console.log(`Before Messages: ${timeBeforeMessages}`);
           w3cDID.createIdentity(config.didMethod, config.receiver, (err, receiver) => {
               if(err)
                   throw err;

               for (let i = 0; i < config.messages; i++)
                   sendMessage(receiver);

               timeAfterMessages = Date.now();
               console.log(`After Messages: ${timeAfterMessages}. Elapsed: ${timeAfterMessages - timeBeforeMessages}`);
           });
        }

        runTest();
    });

    forked.send({
        id: config.receiver,
        didMethod: config.didMethod,
        messages: config.messages
    });
});
