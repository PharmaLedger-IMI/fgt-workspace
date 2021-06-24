const path = require('path');

require(path.join('../../privatesky/psknode/bundles', 'testsRuntime.js'));     // test runtime
require(path.join('../../privatesky/psknode/bundles', 'pskruntime.js'));
const tir = require("../../privatesky/psknode/tests/util/tir");                // the test server framework

const dc = require("double-check");
const assert = dc.assert;


const dataBaseAPI = require("opendsu").loadApi('db');
const keySSIApis = require('opendsu').loadApi('keyssi');


const {DB} = require('../../fgt-dsu-wizard/constants');
const {Stock, Batch} = require('../../fgt-dsu-wizard/model');


const getStock = function(callback){
    require('fs').readFile('./stock1.json', (err, data) => {
        if (err)
            return callback(err);
        try {
            const initialStock = JSON.parse(data);
            callback(undefined, new Stock(initialStock));
        } catch (e){
            return callback(e);
        }
    })
}

const getBatch = function(i, callback){
    require('fs').readFile(`./stock${i}.json`, (err, data) => {
        if (err)
            return callback(err);
        try {
            const batch = JSON.parse(data);
            callback(undefined, new Batch(batch));
        } catch (e){
            return callback(e);
        }
    })
}

const getModel = function(callback){
   getStock((err, stock) => {
       if (err)
           return callback(err);
       getBatch(1, (err, batch1) => {
           if (err)
               return callback(err);
           getBatch(2, (err, batch2) => {
               if (err)
                   return callback(err);
               callback(undefined, stock, batch1, batch2);
           })
       })
   })
}


assert.callback("DB Updating test", (testFinishCallback) => {
    dc.createTestFolder("wallet", function (err, folder) {
        const no_retries = 10;

        function testPersistence(sreadSSI){
            console.log("Persistence DSU is:", sreadSSI.getAnchorId());
            let mydb = dataBaseAPI.getSharedDB(sreadSSI, "testDb");
            mydb.getRecord("test", "key1", function(err,res){
                console.log("Result is", res);
                assert.equal(res.__version, 2);
                assert.equal(res.value,"v2");
                testFinishCallback();
            })
        }

        const indexTable = function(db, table, props, callback){
            db.getIndexedFields(table, (err, indexes) => {
                if (err)
                    return callback(err);
                const newIndexes = [];

                const indexIterator = function(propsClone, callback){
                    const index = propsClone.shift();
                    if (!index)
                        return callback(undefined, newIndexes);
                    if (indexes.indexOf(index) !== -1)
                        return indexIterator(propsClone, callback);
                    db.addIndex(table, index, (err) => {
                        if (err)
                            return callback(`Could not add index ${index} on table ${table}`);
                        newIndexes.push(index);
                        indexIterator(propsClone, callback);
                    });
                }

                indexIterator(indexes.slice(), (err, updatedIndexes) => err
                    ? callback(`Could not update indexes for table ${table}`)
                    : callback(undefined, updatedIndexes));
            })
        }

        const updateRecord = function(db, table, key, batch, callback){
            db.getRecord(table, key, (err, record) => {
                if (err)
                    return callback(err);
                console.log(`retrieved record in version ${record.__version}`)
                record.batches.push(batch);
                db.updateRecord(table, key, record, (err) => {
                    if (err)
                        return callback(err);
                    console.log(`updated record`)
                    callback();
                })
            })
        }

        tir.launchApiHubTestNode(no_retries, folder, function (err, port) {
            if (err)
                throw err;

            let storageSSI = keySSIApis.createSeedSSI("default");

            let db = dataBaseAPI.getWalletDB(storageSSI, "testDb");

            const indexes = ['name', 'gtin', 'manufName', '__timestamp'];

            indexTable(db, DB.stock, indexes, (err, updatedIndexes) => {
                if (err)
                    throw err;
                console.log(`${DB.stock} table's indexes updated: ${updatedIndexes.join(', ')}`);

                getModel((err, stock, b1, b2) => {
                    if (err)
                        throw err;

                    db.insertRecord(DB.stock, stock.gtin, stock, (err) => {
                        if (err)
                            throw err;
                        console.log(`record inserted`);

                        updateRecord(db, DB.stock, stock.gtin, b1, (err) => {
                            if (err)
                                throw err;
                            updateRecord(db, DB.stock, stock.gtin, b2, (err) => {
                                if (err)
                                    throw err;
                                db.getRecord(DB.stock, stock.gtin, (err, record) => {
                                    if (err)
                                        throw err;

                                    const s = new Stock(record);
                                    stock.batches.push(b1, b2);
                                    assert.equal(s.getQuantity(), stock.getQuantity());
                                    assert.equal(record.__version, 2);
                                    testFinishCallback();
                                });
                            });
                        });
                    });
                });
            });
        });
    });
}, 5000);

