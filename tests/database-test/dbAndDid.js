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
    messages: 1,
    timeout: 0
}

const config = argParser(defaultOps, process.argv)

let msgCount = 0;

let timeBeforeMessages, timeAfterMessages, timeBeforeLoad, timeAfterLoad, timeMessagesSent;


    w3cDID.createIdentity(config.didMethod, config.sender, (err, senderDID) => {
        if (err)
            throw err;

        const resolver = opendsu.loadApi('resolver');
        const keyssi = opendsu.loadApi('keyssi');

        const dsuKey = keyssi.createTemplateSeedSSI(config.domain, 'somestring', undefined, 'v0', undefined)
        resolver.createDSU(dsuKey, (err, dsu) => {

            const someData = {
                key1: 'some value',
                key2: 'other value'
            }

            dsu.writeFile('/info', JSON.stringify(someData), (err) => {
                if (err)
                    throw err;
               dsu.getKeySSIAsObject((err, keySSI) =>{
                   if (err)
                       throw err;
                   dsu = undefined;

                   // const forked = fork('dbAndDidChild.js');
                   // forked.on('message', (receiverDID) => {
                   //     console.log(`received created and listening`);
                   //     if (config.kill){
                   //         forked.kill('SIGINT');
                   //         console.log(`received process shutdown`);
                   //     }

                       const sendMessage = function(){
                           console.log("Sending message", JSON.stringify(someData), " to receiver ", config.receiver);
                           senderDID.sendMessage(JSON.stringify(someData), config.receiver /*receiverDID*/,  (err) => {
                               console.log("sendMessage callback");
                               if (err)
                                   return console.log(`Error sending message`, err);

                               console.log(`Message successfully sent`);
                               msgCount++;
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

                           timeBeforeLoad = Date.now();
                           console.log(`Before DSU load ${timeBeforeLoad}`);

                           resolver.loadDSU(keySSI, (err, dsu) => {
                               if (err)
                                   throw err;

                               timeAfterLoad = Date.now();
                               console.log(`After DSU load ${timeAfterLoad}. elapsed: ${timeAfterLoad - timeBeforeLoad}`);

                               dsu.readFile('/info', (err, data) => {
                                   if (err)
                                       throw err;

                                   console.log(`Time to read: ${Date.now() - timeAfterLoad}`);
                                   const result = JSON.parse(data);
                                   console.log(`Finished:`, result);
                               });
                           });
                       }

                       if (!config.timeout)
                           return runTest();

                       console.log(`Waiting for ${config.timeout} to run the test...`)
                       setTimeout(() => {
                           runTest();
                       }, config.timeout);
                   });
               //
               //     forked.send(config.receiver);
               // });
            });
        });
    });
