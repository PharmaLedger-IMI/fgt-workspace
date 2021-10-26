const path = require('path');

require(path.join('../../privatesky/psknode/bundles', 'testsRuntime.js'));     // test runtime
require(path.join('../../privatesky/psknode/bundles', 'pskruntime.js'));
const tir = require("../../privatesky/psknode/tests/util/tir");                // the test server framework

const dc = require("double-check");
const assert = dc.assert;

const utils = require('../test-utils');


const dataBaseAPI = require("opendsu").loadApi('db');
const keySSIApis = require('opendsu').loadApi('keyssi');


const {DB} = require('../../fgt-dsu-wizard/constants');
const {Product} = require('../../fgt-dsu-wizard/model');

const {DBLock} = require('../../pdm-dsu-toolkit/managers');

const getProduct = function (){

    return new Product({
        name: utils.generateProductName(),
        gtin: utils.generateGtin(),
        manufName: utils.generateProductName(),
        description: utils.generateBatchNumber(),
    })
}

const cb = function(err, dbLock, ...results){
    if (err)
        return dbLock.cancelBatch(err2 => {
            callback(err);
        });
    callback(undefined, ...results);
}

const transaction = function (db, dbLock, tableName, callback){

    const dbAction = function(db, dbLock, tableName, callback){
        console.log('dbAction')
        try{
            dbLock.beginBatch(tableName);
        } catch (e){
            console.log('Rescheduling');
            return dbLock.batchSchedule(() => dbAction(db, dbLock, tableName, callback));
        }

        let product = getProduct();
        let product2 = getProduct();
        console.log(dbLock);

        db.insertRecord(DB.products, product.gtin, product, (err, something) => {
            if(err)
                return cb(err);

            console.log(something);
            db.insertRecord(DB.products, product2.gtin, product2, (err, something) => {
                if(err)
                    return cb(err);
            
                dbLock.commitBatch(tableName,false, (err) => {
                    if(err)
                        return cb(err);

                    callback(undefined);
                })        
            })
        })
    }

    dbAction(db, dbLock, tableName, callback);
}





assert.callback("DB Lock test", (testFinishCallback) => {
    dc.createTestFolder("wallet", function (err, folder) {
        const no_retries = 10;

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

            const dbLock = new DBLock(db, 1000);

            const indexes = ['name', 'gtin', 'manufName', '__timestamp'];

            indexTable(db, DB.products, indexes, (err, updatedIndexes) => {
                if (err)
                    throw err;
                console.log(`${DB.stock} table's indexes updated: ${updatedIndexes.join(', ')}`);

                transaction(db, dbLock, DB.products, (err)=> {
                    if(err)
                        throw err;
                        
                    console.log(1)

                    


                })

                transaction(db, dbLock, DB.products, (err) => {
                    if(err)
                        throw err;
                        console.log(2)



                })

                transaction(db, dbLock, DB.products, (err) => {
                    if(err)
                        throw err;

                        console.log(3)


                    
                })

                transaction(db, dbLock, DB.products, (err) => {
                    if(err)
                        throw err;


                        console.log(4);

                    
                })


                // getModel((err, stock, b1, b2) => {
                //     if (err)
                //         throw err;

                //     db.insertRecord(DB.stock, stock.gtin, stock, (err) => {
                //         if (err)
                //             throw err;
                //         console.log(`record inserted`);

                //         updateRecord(db, DB.stock, stock.gtin, b1, (err) => {
                //             if (err)
                //                 throw err;
                //             updateRecord(db, DB.stock, stock.gtin, b2, (err) => {
                //                 if (err)
                //                     throw err;
                //                 db.getRecord(DB.stock, stock.gtin, (err, record) => {
                //                     if (err)
                //                         throw err;

                //                     const s = new Stock(record);
                //                     stock.batches.push(b1, b2);
                //                     assert.equal(s.getQuantity(), stock.getQuantity());
                //                     assert.equal(record.__version, 2);
                                    
                                });
                //             });
                //         });
                //     });
                // });
            //});
        });
    });
}, 5000);
