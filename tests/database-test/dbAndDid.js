process.env.NO_LOGS = true;

const { fork } = require('child_process');

require("../../privatesky/psknode/bundles/testsRuntime");

const tir = require("../../privatesky/psknode/tests/util/tir");
const dc = require("double-check");
const assert = dc.assert;

const opendsu = require("opendsu");
const w3cDID = opendsu.loadApi('w3cdid');

const identities = {
    receiver: 'receiverWc3DIDString',
    sender: 'senderWc3DIDString'
}

const messagesToSend = 10;

let msgCount = 0;

let timeBeforeMessages, timeAfterMessages, timeBeforeLoad, timeAfterLoad, timeMessagesSent;

assert.callback('W3cDID MQ & readDSU stress test (hangs the browser)', (finished) => {
    w3cDID.createIdentity("demo", identities.sender, (err, senderDID) => {
        if (err)
            throw err;

        const resolver = opendsu.loadApi('resolver');
        const keyssi = opendsu.loadApi('keyssi');

        const dsuKey = keyssi.createTemplateSeedSSI('traceability', 'somestring', undefined, 'v0', undefined)
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

                   const forked = fork('dbAndDidChild.js');
                   forked.on('message', (receiverDID) => {
                       console.log(`received created and listening`);
                       //forked.kill('SIGINT');
                       //console.log(`received process shutdown`);

                       const sendMessage = function(){
                           senderDID.sendMessage(JSON.stringify(someData), receiverDID,  (err) => {
                               if (err)
                                   return console.log(`Error sending message`);
                               console.log(`Message successfully sent`);
                               msgCount++;
                               if (msgCount === messagesToSend){
                                   timeMessagesSent = Date.now();
                                   console.log(`all messages sent in ${timeMessagesSent - timeAfterMessages}ms. closing test in 1 second`)
                                   setTimeout(() => process.exit(0), 1000);
                               }
                           });
                       }

                       timeBeforeMessages = Date.now();
                       console.log(`Before Messages: ${timeBeforeMessages}`)
                       for (let i = 0; i < messagesToSend; i++)
                           sendMessage();
                       timeAfterMessages = Date.now();
                       console.log(`After Messages: ${timeAfterMessages}. Elapsed: ${timeAfterMessages - timeBeforeMessages}`);

                       timeBeforeLoad = Date.now();
                       console.log(`Before DSU load ${timeBeforeLoad}`)
                       resolver.loadDSU(keySSI, (err, dsu) => {
                           if (err)
                               throw err;
                           timeAfterLoad = Date.now();
                           console.log(`After DSU load ${timeAfterLoad}. elapsed: ${timeAfterLoad - timeBeforeLoad}`)
                           dsu.readFile('/info', (err, data) => {
                               if (err)
                                   throw err;
                               console.log(`Time to read: ${Date.now() - timeAfterLoad}`);
                               const result = JSON.parse(data);
                               finished();
                           })
                       })
                   });

                   forked.send(identities.receiver);
               });
            });
        });
    });
}, 3600000)