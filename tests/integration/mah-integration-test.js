process.env.NO_LOGS = true;
process.env.PSK_CONFIG_LOCATION = process.cwd();

const path = require('path');

require(path.join('../../privatesky/psknode/bundles', 'testsRuntime.js'));     // test runtime
require(path.join('../../privatesky/psknode/bundles', 'pskruntime.js'));       // the whole 9 yards, can be replaced if only
require(path.join('../../fgt-mah-ssapp/code/scripts/bundles', 'wizard.js'))

const dc = require("double-check");
const assert = dc.assert;

let domains = ['traceability'];
let testName = 'MAH integration Test';

const defaultOps = {
    timeout: 3000,
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

    testFinished()
}

let conf = argParser(process.argv);
if (conf.fakeServer)
    launchTestServer(conf.timeout, runTest)
else
    runTest(() => {
        console.log(`Test ${testName} finished`);
    });



