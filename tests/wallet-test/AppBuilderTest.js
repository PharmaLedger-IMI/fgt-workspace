process.env.NO_LOGS = true;

const path = require('path');

require(path.join('../../privatesky/psknode/bundles', 'openDSU.js'));       // the whole 9 yards, can be replaced if only
const dt = require('./../../pdm-dsu-toolkit/services/dt');

let domains = ['traceability'];
let testName = 'Application Builder test';

const defaultOps = {
    timeout: 30000000,
    fakeServer: false,
    app: "fgt-wholesaler-wallet",
    pathToApps: "../../"
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
            if (notation.indexOf(splits[0]) !== -1) {
                let result
                try {
                    result = eval(splits[1]);
                } catch (e) {
                    result = splits[1];
                }
                config[splits[0].substring(2)] = result;
            }
        }
    });
    return config;
}

let conf = argParser(process.argv);

const launchTestServer = function(timeout, testFunction){     // the test server framework
    require(path.join('../../privatesky/psknode/bundles', 'testsRuntime.js'));     // test runtime
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


const generateSecrets = function(tin) {
    return {
        "name": {
            "secret": "PDM",
            "public": true,
            "required": true
        },
        "id": {
            "secret": "id",
            "public": true,
            "required": true
        },
        "email": {
            "secret": "wholesaler@pdmfc.com",
            "public": true,
            "required": true
        },
        "tin": {
            "secret": tin,
            "public": true,
            "required": true
        },
        "address": {
            "required": true,
            "secret": "address"
        },
        "pass": {
            "required": true,
            "secret": "pass"
        },
        "passrepeat": {
            "required": true,
            "secret": "pass"
        }
    }
};

const parseEnvJS = function(strEnv){
    return JSON.parse(strEnv.replace(/^export\sdefault\s/, ''));
}

const getEnvJs = function(app, callback){
    const appPath = path.join(process.cwd(), conf.pathToApps, "trust-loader-config", app, "loader", "environment.js");
    require('fs').readFile(appPath, (err, data) => {
        if (err)
            return callback(`Could not find Application ${app} at ${{appPath}} : ${err}`);
        return callback(undefined, parseEnvJS(data.toString()));
    });
}

const runTest = function(testFinished){
    getEnvJs(conf.app, (err, env) => {
        if (err)
            throw err;

        let config = require("opendsu").loadApi("config");
        config.autoconfigFromEnvironment(env);

        const appService = new (dt.AppBuilderService)(env);
        const credentials = generateSecrets(Math.round(Math.random() * 999999999));
        appService.buildWallet(credentials, (err, keySII, dsu) => {
            if (err)
                throw err;
            console.log(`App ${env.appName} created with credentials ${JSON.stringify(credentials, undefined, 2)}.\nSSI: ${{keySII}}`);
            testFinished();
        });
    });
}

if (conf.fakeServer){
    process.env.PSK_CONFIG_LOCATION = process.cwd();
    launchTestServer(conf.timeout, runTest)
} else
    runTest(() => {
        console.log(`Test ${testName} finished`);
    });



