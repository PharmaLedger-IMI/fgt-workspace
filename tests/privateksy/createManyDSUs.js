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
    const aSeedSSI = keyssispace.createTemplateSeedSSI(domain, `STWHS000001-WHS000001-${(new Date()).toISOString()}`, 'v0', undefined);
    resolver.createDSU(aSeedSSI, (err, dsuInstance) => {
        if (err) throw err;
        dsuInstance.writeFile('/data', JSON.stringify({"message": readableRandomStringMaker(10)}), (err) => {
            //Reached when data written to BrickStorage
            if (err) throw err;
            console.log("Data written succesfully! :) ");
            callback();       
        });
    });
}

function createBatchDSU(counter) {
    if (counter<=0) return;
    //Create a Batch DSU
    const aSeedSSI = keyssispace.createTemplateSeedSSI(domain, `WHS000001-WHS000001-${(new Date()).toISOString()}`, 'v0', undefined);
    resolver.createDSU(aSeedSSI, (err, dsuInstance) => {
        if (err) throw err;
        dsuInstance.writeFile('/data', JSON.stringify({"message": readableRandomStringMaker(100000)}), (err) => {
            //Reached when data written to BrickStorage
            if (err) throw err;
            console.log("Data written succesfully! :) ");
            createBatchStatusDSU(() => {
                createBatchDSU(counter-1);       
            });
        });
    });
}

createBatchDSU(10);


