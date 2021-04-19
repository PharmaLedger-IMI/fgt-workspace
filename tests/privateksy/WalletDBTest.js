require("../../privatesky/psknode/bundles/testsRuntime");
const assert = require("double-check").assert;
const dc = require("double-check");
const db = require("../../privatesky/modules/opendsu/db");
const tir = require("../../privatesky/psknode/tests/util/tir");

assert.callback("DB Indexing test", (testFinishCallback) => {
    dc.createTestFolder("wallet", function (err, folder) {
        const no_retries = 10;

        function testPersistence(sreadSSI) {
            console.log("Persistence DSU is:", sreadSSI.getAnchorId());
            let mydb = db.getSharedDB(sreadSSI, "testDb");
            mydb.query("test", "key like /.*/g", undefined, 10, (err, records) => {
                console.log(err, records);
                testFinishCallback();
            });
        }

        tir.launchApiHubTestNode(no_retries, folder, function (err, port) {
            if (err) {
                throw err;
            }
            let keySSIApis = require("../../privatesky/modules/opendsu/keyssi");
            let storageSSI = keySSIApis.createSeedSSI("default");

            let mydb = db.getWalletDB(storageSSI, "testDb");
            mydb.insertRecord("test", "key1", { value: "v0" }, function (err, res) {
                mydb.updateRecord("test", "key1", { value: "v1" }, function (err, res) {
                    mydb.updateRecord("test", "key1", { value: "v2" }, function (err, res) {
                        testPersistence(mydb.getShareableSSI());
                    });
                });
            });
        });
    });
}, 5000);

