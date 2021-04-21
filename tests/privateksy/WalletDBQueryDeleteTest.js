require("../../privatesky/psknode/bundles/testsRuntime");
const assert = require("double-check").assert;
const dc = require("double-check");
const db = require("../../privatesky/modules/opendsu/db");
const tir = require("../../privatesky/psknode/tests/util/tir");

assert.callback("DB query+deleteRecord test", (testFinishCallback) => {
    dc.createTestFolder("wallet", function (err, folder) {
        const no_retries = 10;

        function testPersistence(sreadSSI) {
            console.log("Persistence DSU is:", sreadSSI.getAnchorId());
            let mydb = db.getSharedDB(sreadSSI, "testDb");
            mydb.query("test", "__timestamp > 0", undefined, 10, (err, records) => {
                console.log(err, records);
                const record = records[1];
                mydb.deleteRecord("test", record.key, (err, aRecord) => {
                    console.log("deletedRecord", err, aRecord);
                    testFinishCallback();
                });
            });
        }

        tir.launchApiHubTestNode(no_retries, folder, function (err, port) {
            if (err) {
                throw err;
            }
            let keySSIApis = require("../../privatesky/modules/opendsu/keyssi");
            let storageSSI = keySSIApis.createSeedSSI("default");

            let mydb = db.getWalletDB(storageSSI, "testDb");

            mydb.insertRecord("test", "123", { "api": "receivedOrders", "message": "Payload1", "key": "123" }, function (err, res) {
                mydb.insertRecord("test", "456", { "api": "receivedOrders", "message": "Payload2", "key": "456" }, function (err, res) {
                    mydb.insertRecord("test", "789", { "api": "receivedOrders", "message": "Payload3", "key": "789" }, function (err, res) {
                        testPersistence(mydb.getShareableSSI());
                    });
                });
            });
        });
    });
}, 5000);

