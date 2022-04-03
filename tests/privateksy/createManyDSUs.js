// Ignore the test
process.exit();

const domain = "traceability";
//const domain = "default";
const hint = undefined;

//Load openDSU enviroment
require("../../privatesky/psknode/bundles/openDSU");

//Load openDSU SDK
const opendsu = require("opendsu");

//Load resolver library
const resolver = opendsu.loadApi("resolver");

//Load keyssi library
const keyssispace = opendsu.loadApi("keyssi");

const pskcrypto = require("pskcrypto");

// from https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
function readableRandomStringMaker(length) {
  for (var s=''; s.length < length; s += 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.charAt(Math.random()*62|0));
  return s;
}

function createBatchStatusDSU(callback) {
    //Create a BatchStatus DSU
    const aSeedSSI = keyssispace.createTemplateSeedSSI(domain, `STWHS000001-WHS000001-${(new Date()).toISOString()}`, 'v0', hint);
    resolver.createDSU(aSeedSSI, (err, dsuInstance) => {
        if (err) throw err;
        dsuInstance.beginBatch();
        dsuInstance.writeFile('/info', JSON.stringify({"message": readableRandomStringMaker(10)}), (err) => {
            //Reached when data written to BrickStorage
            if (err) throw err;
            dsuInstance.writeFile('/log', JSON.stringify({"log": readableRandomStringMaker(10)}), (err) => {
                dsuInstance.commitBatch((err) => {
                    if (err) throw err;
                    dsuInstance.getKeySSIAsObject(callback);
                });
            });
        });
    });
}

function createBatchDSUs(counter) {
    if (counter<=0) return;
    //Create a Batch DSU
    const aSeedSSI = keyssispace.createTemplateSeedSSI(domain, `GTIN${counter*10000}-BATCH${counter}`, 'v0', hint);
    resolver.createDSU(aSeedSSI, (err, dsuInstance) => {
        if (err) throw err;
        dsuInstance.beginBatch();
        dsuInstance.writeFile('/info', JSON.stringify({"serialNumbers": readableRandomStringMaker(100000)}), (err) => {
            if (err) throw err;
            console.log("Data written succesfully! :) ");
            createBatchStatusDSU((err, statusSSI) => {
                if (err) throw err;
                console.log(`BatchStatus DSU created with SSI ${statusSSI.getIdentifier(true)}`);
                dsuInstance.mount("/status", statusSSI.getIdentifier(true), (err) => {
                    if (err) throw err;
                    dsuInstance.commitBatch((err) => {
                        if (err) throw err;
                        dsuInstance.getKeySSIAsObject((err, batchSSI)=> {
                            if (err) throw err;
                            console.log(`Batch DSU created with SSI ${batchSSI.getIdentifier(true)}`);
                            createBatchDSUs(counter-1);                       
                        });            
                    });
                });
            });
        });
    });
}

// main
createBatchDSUs(100);


