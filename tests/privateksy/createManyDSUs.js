// Ignore the test
//process.exit();

const domain = "traceability";
//const domain = "default";
const hint = undefined;

let GTIN = 140000; // due to creation of Const DSUs based on GTIN, you may have to edit GTIN between runs


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

// from https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
function readableRandomStringMaker(length) {
    for (var s = ''; s.length < length; s += 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.charAt(Math.random() * 62 | 0));
    return s;
}

function createBatchStatusDSU(callback) {
    //Create a BatchStatus DSU
    const aSeedSSI = keyssispace.createTemplateSeedSSI(domain, `STWHS000001-WHS000001-${(new Date()).toISOString()}`, 'v0', hint);
    resolver.createDSU(aSeedSSI, (err, dsuInstance) => {
        if (err) throw err;
        dsuInstance.beginBatch();
        dsuInstance.writeFile('/info', JSON.stringify({ "message": readableRandomStringMaker(10) }), (err) => {
            //Reached when data written to BrickStorage
            if (err) throw err;
            dsuInstance.writeFile('/log', JSON.stringify({ "log": readableRandomStringMaker(10) }), (err) => {
                dsuInstance.commitBatch((err) => {
                    if (err) throw err;
                    dsuInstance.getKeySSIAsObject(callback);
                });
            });
        });
    });
}

function readBatchDSU(gtin, batchNumber, callback) {
    const aKeySSI = keyssispace.createArraySSI(domain, [gtin, batchNumber], 'v0', hint);
    resolver.loadDSU(aKeySSI, (err, dsu) => {
        callback(err, dsu);
    });
}

function createBatchDSUs(counter) {
    if (counter <= 0) return;
    if (counter % 2 == 0) GTIN++;

    //Create a Batch DSU
    const gtin = GTIN;
    const batchNumber = `B${counter}`
    const dbKey = `${gtin}-${batchNumber}`;
    const aConstSSI = keyssispace.createArraySSI(domain, [gtin, batchNumber], 'v0', hint);
    console.log(`Going to create a new Const DSU Batch ${dbKey}`)
    resolver.createDSUForExistingSSI(aConstSSI, (err, dsuInstance) => {
        if (err) throw createOpenDSUErrorWrapper("createBatchDSUs.createDSUForExistingSSI", err);
        dsuInstance.beginBatch();
        const batchRecord = { "serialNumbers": readableRandomStringMaker(100000) };
        dsuInstance.writeFile('/info', JSON.stringify(batchRecord), (err) => {
            if (err) throw createOpenDSUErrorWrapper("write /info", err);
            //console.log("BatchData written succesfully! :) ");
            createBatchStatusDSU((err, statusSSI) => {
                if (err) throw createOpenDSUErrorWrapper("createBatchStatusDSU", err);
                console.log(`BatchStatus DSU created with SSI ${statusSSI.getIdentifier(true)}`);
                dsuInstance.mount("/status", statusSSI.getIdentifier(true), (err) => {
                    if (err) throw createOpenDSUErrorWrapper("mount /status", err);
                    dsuInstance.getKeySSIAsObject((err, batchSSI) => {
                        if (err) throw createOpenDSUErrorWrapper("dsuInstance.getKeySSIAsObject", err);
                        console.log(`Batch DSU created with SSI ${batchSSI.getIdentifier(true)}`);
                        WALLET_DB.beginBatch();
                        WALLET_DB.insertRecord(TABLE_BATCH, dbKey, batchRecord, (err) => {
                            if (err) throw createOpenDSUErrorWrapper("WALLET_DB.insertRecord(TABLE_BATCH", err);
                            // get stock record for GTIN
                            WALLET_DB.getRecord(TABLE_STOCK, gtin, (err, stockRecord) => {
                                // does not exist for the first time
                                if (err) {
                                    console.log(err.message);
                                    readBatchDSU(gtin, batchNumber, (err, dsuBatch) => {
                                        if (err) throw createOpenDSUErrorWrapper("readBatchDSU", err);
                                        console.log("dsuBatch", dsuBatch);
                                        WALLET_DB.insertRecord(TABLE_STOCK, gtin, batchRecord, (err) => {
                                            if (err) throw createOpenDSUErrorWrapper("WALLET_DB.insertRecord(TABLE_STOCK", err);
                                            WALLET_DB.commitBatch((err) => {
                                                if (err) throw createOpenDSUErrorWrapper("WALLET_DB.commitBatch", err);
                                                //console.log("stockRecord", stockRecord);
                                                dsuInstance.commitBatch((err) => {
                                                    if (err) throw createOpenDSUErrorWrapper("dsuInstance.commitBatch", err);
                                                    createBatchDSUs(counter - 1);
                                                });
                                            });
                                        });    
                                    });
                                } else {
                                    //console.log("stockRecord", stockRecord);
                                    getBatch(gtin, batchNumber, (err, dsuBatch) => {
                                        if (err) throw createOpenDSUErrorWrapper("getBatch", err);
                                        console.log("dsuBatch", dsuBatch);
                                        WALLET_DB.updateRecord(TABLE_STOCK, gtin, { "prevStock": stockRecord, "newStock": batchRecord }, (err) => {
                                            if (err) throw createOpenDSUErrorWrapper("WALLET_DB.updateRecord(TABLE_STOCK", err);
                                            WALLET_DB.commitBatch((err) => {
                                                if (err) throw createOpenDSUErrorWrapper("WALLET_DB.commitBatch", err);
                                                dsuInstance.commitBatch((err) => {
                                                    if (err) throw createOpenDSUErrorWrapper("dsuInstance.commitBatch", err);
                                                    createBatchDSUs(counter - 1);
                                                });
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
                createBatchDSUs(100);
            });
        });
    });
}

// main
createWalletDb();

