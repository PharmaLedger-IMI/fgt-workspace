// Ignore the test as it is failing!
//process.exit();

/**
 * Options:
 * (optional) --fakeServer=true (default) or -fakeServer=false  
 */
process.env.NO_LOGS = true;
process.env.PSK_CONFIG_LOCATION = process.cwd();

const path = require('path');

require(path.join('../../privatesky/psknode/bundles', 'testsRuntime.js'));     // test runtime
require(path.join('../../privatesky/psknode/bundles', 'pskruntime.js'));       // the whole 9 yards, can be replaced if only

const dc = require("double-check");
const assert = dc.assert;
const opendsu = require("opendsu");
const resolver = opendsu.loadApi("resolver");
const keyssispace = opendsu.loadApi("keyssi");

let domains = ['traceability'];
let testName = 'pdm-db-dsu integration Test';

const defaultOps = {
    timeout: 3000,
    fakeServer: true
}

const argParser = function (args) {
    let config = JSON.parse(JSON.stringify(defaultOps));
    if (!args)
        return config;
    args = args.slice(2);
    const recognized = Object.keys(config);
    const notation = recognized.map(r => '--' + r);
    args.forEach(arg => {
        if (arg.includes('=')) {
            let splits = arg.split('=');
            if (notation.indexOf(splits[0]) !== -1)
                config[splits[0].substring(2)] = eval(splits[1]);
        }
    });
    return config;
}

const launchTestServer = function (timeout, testFunction) {     // the test server framework
    const tir = require("../../privatesky/psknode/tests/util/tir");
    assert.callback('Launch API Hub', (testFinished) => {
        dc.createTestFolder(testName, (err, folder) => {
            tir.launchApiHubTestNode(10, folder, err => {
                if (err)
                    throw err;
                tir.addDomainsInBDNS(folder, domains, (err, bdns) => {    // not needed if you're not working on a custom domain
                    if (err)
                        throw err;
                    console.log('Updated bdns', bdns);
                    testFunction((err)=>{
                        if (err) {
                            console.log("TEST HAS FAILED", err);
                            assert.false(err);
                        } else
                            testFinished();
                    });
                });
            });
        });
    }, timeout);
}

let mainDsu = undefined; // Emulated SSApp DSU. Initialized on createMainDSU.

const DatabaseJson = require('../../pdm-db-dsu').DatabaseJson;

let database1 = undefined; // DatabaseJsobBase
const key1 = "key1";
const value1 = "A value for key 1";
const key2 = "key2";
const value2 = "A value for key 2";

// setup mainDsu (emulates an SSApp DSU) and the participantManager.
function createMainDSU(callback) {
    keyssispace.createSeedSSI(domains[0], function (err, aSeedSSI) {
        console.log("mainDSU (SSApp) seedSSI identifier: " + aSeedSSI.getIdentifier(true));
        //Create a main DSU
        resolver.createDSU(aSeedSSI, (err, dsuInstance) => {
            //Reached when DSU created
            if (err)
                return callback(err);
            mainDsu = dsuInstance;
            // set DSUStorage methods on mainDsu
            mainDsu.getObject = function (path, callback) {
                mainDsu.readFile(path, function (err, res) {
                    if (err)
                        return callback(err);
                    try {
                        res = JSON.parse(res.toString());
                    } catch (err) {
                        return callback(err);
                    }
                    callback(undefined, res);
                });
            };
            mainDsu.enableDirectAccess = function(callback) {
                callback(undefined, true);
            };
            callback();
        });
    });
};

function createDatabase1(callback) {
    database1 = new DatabaseJson(mainDsu);
    callback(); // never fails.
}

function testSetKey1AndKey2(callback) {
    database1.set(key1, value1, (err) => {
        if (err)
            return callback(err);
        database1.set(key2, value2, callback);
    });
};

function testGetKey1(callback) {
    database1.get(key1, (err, value) => {
        if (err)
            return callback(err);
        assert.true(value1 == value);
        //console.log(value1);
        //console.log(value);
        callback();
    });
};

function testList(callback) {
    database1.list("", (err, keys) => {
        if (err)
            return callback(err);
        console.log(keys);
        assert.true(keys.includes(key1));
        assert.true(keys.includes(key2));
        callback();
    });
};

const runTest = function (testFinished) {
    createMainDSU(function (err) {
        if (err)
            return testFinished(err);
        createDatabase1(function (err) {
            if (err)
                return testFinished(err);
            testSetKey1AndKey2(function (err) {
                if (err)
                    return testFinished(err);
                testGetKey1(function (err) {
                    if (err)
                        return testFinished(err);
                    testList(function (err) {
                        testFinished();                        
                    });
                });
            });
        });
    });
}

let conf = argParser(process.argv);
if (conf.fakeServer)
    launchTestServer(conf.timeout, runTest)
else
    runTest((err) => {
        if (err) {
            console.log("FAILED", err);
        }
        console.log(`Test ${testName} finished`);
    });



