// Ignore the test
//process.exit();

const domain = "traceability";
//const domain = "default";
const hint = undefined;
const NUM_BATCHES = 100;

//Load openDSU enviroment
require("../../privatesky/psknode/bundles/openDSU");

const opendsu = require("opendsu");
const resolver = opendsu.loadApi("resolver");
const keyssispace = opendsu.loadApi("keyssi");
const db = opendsu.loadApi("db");
const pskcrypto = require("pskcrypto");


// GLOBALS!

let WALLET_DB = undefined; // wallet database DSU

let GTIN = Date.now(); // due to creation of Const DSUs based on GTIN, you may have to edit GTIN between runs

const TABLE_BATCH = "batch";
const TABLE_STOCK = "stock";

// from https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
function readableRandomStringMaker(length) {
    for (var s = ''; s.length < length; s += 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.charAt(Math.random() * 62 | 0));
    return s;
}

const ARRAY_OF_SERIALNUMBERS = [];
(function (){
    for(var i=0 ; i< 10000; i++) {
        ARRAY_OF_SERIALNUMBERS.push(readableRandomStringMaker(10));
    }
})();

function createBatchStatusDSU(callback) {
    //Create a BatchStatus DSU, that would be shared between participants
    const aSeedSSI = keyssispace.createTemplateSeedSSI(domain, `STWHS000001-WHS000001-${(new Date()).toISOString()}`, 'v0', hint);
    resolver.createDSU(aSeedSSI, (err, dsuInstance) => {
        if (err) throw createOpenDSUErrorWrapper("createBatchStatusDSU.createDSU", err);
        dsuInstance.beginBatch();
        dsuInstance.writeFile('/info', JSON.stringify({ "message": readableRandomStringMaker(10) }), (err) => {
            //Reached when data written to BrickStorage
            if (err) throw createOpenDSUErrorWrapper("createBatchStatusDSU.writeFile", err);
            dsuInstance.writeFile('/log', JSON.stringify({ "log": readableRandomStringMaker(10) }), (err) => {
                if (err) throw createOpenDSUErrorWrapper("createBatchStatusDSU.writeFile2", err);
                dsuInstance.commitBatch((err) => {
                    if (err) throw createOpenDSUErrorWrapper("createBatchStatusDSU.commitBatch", err);
                    dsuInstance.getKeySSIAsObject(callback);
                });
            });
        });
    });
}

function readBatchDSU(gtin, batchNumber, callback) {
    const aKeySSI = keyssispace.createArraySSI(domain, [gtin, batchNumber], 'v0', hint);
    resolver.loadDSU(aKeySSI, (err, dsu) => {
        if (err)
            return callback(err);
        dsu.readFile("/info", (err, data) => {
            if (err)
                return callback(err);
            const batchRecord = JSON.parse(data.toString());
            return callback(undefined, batchRecord);
        });
    });
}

function createBatchDSUs(counter) {
    if (counter <= 0) return; // recursive stop ? 
    if (counter % 2 == 0) GTIN++; // each GTIN has 2 batches

    //Create one Batch DSU, and the update DB records
    const gtin = GTIN;
    const batchNumber = `B${counter}`
    const dbKey = `${gtin}-${batchNumber}`;
    const aConstSSI = keyssispace.createArraySSI(domain, [gtin, batchNumber], 'v0', hint);
    console.log(`Going to create a new Const DSU Batch ${dbKey}`)
    resolver.createDSUForExistingSSI(aConstSSI, (err, dsuInstance) => {
        if (err) throw createOpenDSUErrorWrapper("createBatchDSUs.createDSUForExistingSSI", err);
        dsuInstance.beginBatch();
        const batchRecord = { "serialNumbers": ARRAY_OF_SERIALNUMBERS };
        dsuInstance.writeFile('/info', JSON.stringify(batchRecord), (err) => {
            if (err) throw createOpenDSUErrorWrapper("write /info", err);
            //console.log("BatchData written succesfully! :) ");
            createBatchStatusDSU((err, statusSSI) => {
                if (err) throw createOpenDSUErrorWrapper("createBatchStatusDSU", err);
                console.log(`BatchStatus DSU created with SSI ${statusSSI.getIdentifier(true)}`);
                dsuInstance.mount("/status", statusSSI.getIdentifier(true), (err) => {
                    if (err) throw createOpenDSUErrorWrapper("mount /status", err);
                    dsuInstance.commitBatch((err) => {
                        if (err) throw createOpenDSUErrorWrapper("dsuInstance.commitBatch", err);
                        dsuInstance.getKeySSIAsObject((err, batchSSI) => {
                            if (err) throw createOpenDSUErrorWrapper("dsuInstance.getKeySSIAsObject", err);
                            console.log(`Batch DSU created with SSI ${batchSSI.getIdentifier(true)}`);
                            WALLET_DB.beginBatch();
                            WALLET_DB.insertRecord(TABLE_BATCH, dbKey, batchRecord, (err) => {
                                if (err) throw createOpenDSUErrorWrapper("WALLET_DB.insertRecord(TABLE_BATCH", err);
                                // get stock record for GTIN
                                WALLET_DB.getRecord(TABLE_STOCK, gtin, (err, stockRecord) => {
                                    if (err) {
                                        // does not exist for the first time
                                        console.log(err.message);
                                        readBatchDSU(gtin, batchNumber, (err, dsuBatch) => {
                                            if (err) throw createOpenDSUErrorWrapper("readBatchDSU", err);
                                            console.log("dsuBatch", dsuBatch);
                                            WALLET_DB.insertRecord(TABLE_STOCK, gtin, dsuBatch, (err) => {
                                                if (err) throw createOpenDSUErrorWrapper("WALLET_DB.insertRecord(TABLE_STOCK", err);
                                                WALLET_DB.commitBatch((err) => {
                                                    if (err) throw createOpenDSUErrorWrapper("WALLET_DB.commitBatch", err);
                                                    console.log("stockRecord", stockRecord);
                                                    createBatchDSUs(counter - 1);
                                                });
                                            });
                                        });
                                    } else {
                                        console.log("stockRecord", stockRecord);
                                        readBatchDSU(gtin, batchNumber, (err, dsuBatch) => {
                                            if (err) throw createOpenDSUErrorWrapper("readBatchDSU", err);
                                            console.log("dsuBatch", dsuBatch);
                                            WALLET_DB.updateRecord(TABLE_STOCK, gtin, { "prevStock": stockRecord, "newStock": dsuBatch }, (err) => {
                                                if (err) throw createOpenDSUErrorWrapper("WALLET_DB.updateRecord(TABLE_STOCK", err);
                                                WALLET_DB.commitBatch((err) => {
                                                    if (err) throw createOpenDSUErrorWrapper("WALLET_DB.commitBatch", err);
                                                    createBatchDSUs(counter - 1);
                                                });
                                            });
                                        });
                                    };
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
        dsuInstance.getKeySSIAsObject((err, walletSSI) => {
            if (err) throw err;
            console.log(`WalletDB keySSI`, walletSSI.getIdentifier(true));
            const dbSSI = walletSSI.derive();
            let dbInstance = db.getWalletDB(dbSSI, 'mydb');
            dbInstance.on('initialised', () => {
                console.log(`Database Cached ${dbSSI.getIdentifier(true)}`);
                WALLET_DB = dbInstance;
                createBatchDSUs(NUM_BATCHES);
            });
        });
    });
}

// main
createWalletDb();

