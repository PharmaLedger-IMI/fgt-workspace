process.env.NO_LOGS = true;

const { fork } = require('child_process');

const { argParser } = require('../../bin/environment/utils');

require("../../privatesky/psknode/bundles/openDSU");

const opendsu = require("opendsu");
const w3cDID = opendsu.loadApi('w3cdid');

const defaultOps = {
    receiver: 'receiverWc3DIDString' + Math.floor(Math.random() * 10000000),
    sender: 'senderWc3DIDString' + Math.floor(Math.random() * 10000000),
    domain: 'traceability',
    didMethod: 'demo',
    messages: 10,
    messageTimeout: 2,
    kill: false,    // decides if kills the consumer after boot or not
    timeout: 200    // timeout between the consumer started listening and actually sending the messages (or killing the consumer)
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
        console.log(`PRODUCER: received created and listening`);

        const sendMessage = function(){
           console.log("PRODUCER: Sending message", JSON.stringify(someData), " to receiver ", config.receiver);
           senderDID.sendMessage(JSON.stringify(someData), receiverDID,  (err) => {
               if (err)
                   return console.log(`PRODUCER: Error sending message`, err);
               msgCount++;
               console.log(`PRODUCER: Message successfully sent ${msgCount}`);
               if (msgCount === config.messages){
                   timeMessagesSent = Date.now();
                   console.log(`PRODUCER: all messages sent in ${timeMessagesSent - timeAfterMessages}ms. closing test in 1 second`)
                   setTimeout(() => process.exit(0), 1000);
               }
           });
        }

        const runTest = function(){
           timeBeforeMessages = Date.now();
           console.log(`PROCUCER: Before Messages: ${timeBeforeMessages}`);

           if (!config.messageTimeout){
               for (let i = 0; i < config.messages; i++)
                   sendMessage();

           } else {
               let counter = 0;
               const iterator = function(){
                   console.log(`PRODUCER: sending message ${++counter}`);
                   sendMessage();
                   if (counter < config.messages)
                       setTimeout(() => iterator(), config.messageTimeout);
                   else{
                       timeAfterMessages = Date.now();
                       console.log(`PRODUCER: After Messages: ${timeAfterMessages}. Elapsed: ${timeAfterMessages - timeBeforeMessages}`);
                       setTimeout(() => console.log('PRODUCER: 10 seconds since messages sent...'), 10000);
                   }
               }
               setTimeout(() => iterator(), config.timeout);
           }


        }

        if (config.kill){
            forked.send({terminate: true});
            return setTimeout(() => runTest(), 100); // on a timer just to allow the child to properly terminate
        }

        runTest();
    });

    forked.send({
        id: config.receiver,
        didMethod: config.didMethod,
        messages: config.messages,
        timeout: config.timeout
    });
});
