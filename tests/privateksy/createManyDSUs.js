// Ignore the test
//process.exit();

const domain = "traceability";
//const domain = "default";
const hint = undefined;


//Load openDSU enviroment
require("../../privatesky/psknode/bundles/openDSU");

const opendsu = require("opendsu");
const resolver = opendsu.loadApi("resolver");
const keyssispace = opendsu.loadApi("keyssi");
const db = opendsu.loadApi("db");
const pskcrypto = require("pskcrypto");
const getBatches = require("../../bin/environment/batches/batchesRandom");


// GLOBALS!

let WALLET_DB = undefined;

const TABLE_BATCH = "batch";
const TABLE_STOCK = "stock";

let GTIN = 100000;

// from https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
function readableRandomStringMaker(length) {
  for (var s=''; s.length < length; s += 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.charAt(Math.random()*62|0));
  return s;
}

function insertRecord(tableName, key, record, callback) {
    WALLET_DB.insertRecord(tableName, key, record, (err) => {
        callback(err);
    });
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

function getBatch(gtin, batchNumber, callback) {
    const aKeySSI = keyssispace.createArraySSI(domain, [gtin, batchNumber], 'v0', hint);
    resolver.loadDSU(aKeySSI, (err, dsu) => {
        if (err) throw err;
        callback(undefined, dsu);
    });
}

function createBatchDSUs(counter) {
    if (counter<=0) return;
    if (counter%2==0) GTIN++;

    //Create a Batch DSU
    const gtin = GTIN;
    const batchNumber = `B${counter}`
    const dbKey = `${gtin}-${batchNumber}`;
    const aSeedSSI = keyssispace.createArraySSI(domain, [gtin, batchNumber], 'v0', hint);
    resolver.createDSU(aSeedSSI, (err, dsuInstance) => {
        if (err) throw err;
        dsuInstance.beginBatch();
        const batchRecord = {"serialNumbers": readableRandomStringMaker(100000)};
        dsuInstance.writeFile('/info', JSON.stringify(batchRecord), (err) => {
            if (err) throw err;
            //console.log("BatchData written succesfully! :) ");
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
                            WALLET_DB.beginBatch();
                            insertRecord(TABLE_BATCH, dbKey, batchRecord, (err) => {
                                if (err) throw err;
                                WALLET_DB.commitBatch((err) => {
                                    if (err) throw err;
                                    // get stock record for GTIN
                                        console.log("stockRecord", stockRecord);
                                        createBatchDSUs(counter-1);                       
                                    });
                                });
                            });
                        });            
                    });
                });
            });
        });
    });
}


function createWalletDb() {
    const aSeedSSI = keyssispace.createTemplateSeedSSI(domain, `WALLET`, 'v0', hint);
    resolver.createDSU(aSeedSSI, (err, dsuInstance) => {
        dsuInstance.getKeySSIAsObject((err, walletSSI)=> {
            if (err) throw err;
            console.log(`WalletDB keySSI`, walletSSI.getIdentifier(true));
            const dbSSI = walletSSI.derive();
            let dbInstance = db.getWalletDB(dbSSI, 'mydb');
            dbInstance.on('initialised', () => {
                console.log(`Database Cached ${dbSSI.getIdentifier(true)}`);
                WALLET_DB = dbInstance;
                createBatchDSUs(100);
            });
        });
    });
}

// main
createWalletDb();

