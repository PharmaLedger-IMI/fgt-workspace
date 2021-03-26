process.env.NO_LOGS = true;

const path = require('path');

require(path.join('../../privatesky/psknode/bundles', 'openDSU.js'));       // the whole 9 yards, can be replaced if only
const dt = require('./../../pdm-dsu-toolkit/services/dt');

let domains = ['traceability'];
let testName = 'Wallet Builder Test';

const defaultOps = {
    timeout: 30000000,
    fakeServer: true
}

const argParser = function(args){
    let config = JSON.parse(JSON.stringify(defaultOps));
    if (!args)
        return config;
    args = args.slice(2);
    const recognized = Object.keys(config);
    const notation = recognized.map(r => '--' + r);
    args.forEach(arg => {
        if (arg.includes('=')){
            let splits = arg.split('=');
            if (notation.indexOf(splits[0]) !== -1)
                config[splits[0].substring(2)] = eval(splits[1]);
        }
    });
    return config;
}

const launchTestServer = function(timeout, testFunction){     // the test server framework
    require(path.join('../../privatesky/psknode/bundles', 'testsRuntime.js'));     // test runtime
    require(path.join('../../privatesky/psknode/bundles', 'pskruntime.js'));       // the whole 9 yards, can be replaced if only

    const dc = require("double-check");
    const assert = dc.assert;
    const tir = require("../../privatesky/psknode/tests/util/tir");
    assert.callback('Launch API Hub', (testFinished) => {
        dc.createTestFolder(testName, (err, folder) => {
            tir.launchApiHubTestNode(10, folder, err => {
                if (err)
                    throw err;
                tir.addDomainsInBDNS(folder,  domains, (err, bdns) => {    // not needed if you're not working on a custom domain
                    if (err)
                        throw err;
                    console.log('Updated bdns', bdns);
                    testFunction(testFinished);
                });
            });
        });
    }, timeout);
}

const runTest = function(testFinished){
    const secretsObj = {
        name: {
            secret: "Company Name",
            public: true
        },
        address: {
            secret: "Address",
            public: true
        },
        tin: {
            secret: "Tin Number",
            public: true
        },
        email: {
            secret: "email",
            public: true
        },
        password: {
            secret: Math.random() * 100000000000
        }
    };

    const appService = new (dt.AppBuilderService)({vault: "server"});
    const SEED = '65FmT6jYpmQXh9ETs68RdMxy7LL7pkECirykrCHiqbSMeuETvLRVfxQCyrUQkxSXrGCeDDwiyvQjQURnKRzy6iMr3bQRCasZ';
    appService.clone(secretsObj, SEED, true, (err, dsu) => {
        if (err)
            throw err;
        testFinished()
    });
}

let conf = argParser(process.argv);
if (conf.fakeServer){
    process.env.PSK_CONFIG_LOCATION = process.cwd();
    launchTestServer(conf.timeout, runTest)
} else
    runTest(() => {
        console.log(`Test ${testName} finished`);
    });



