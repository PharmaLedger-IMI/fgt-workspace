process.env.NO_LOGS = true;

const path = require('path');

require(path.join('../../privatesky/psknode/bundles', 'openDSU.js'));       // the whole 9 yards, can be replaced if only
const dt = require('../../pdm-dsu-toolkit/services/dt');
const { getParticipantManager, getProductManager, getBatchManager } = require('../../fgt-dsu-wizard/managers');
const { impersonateDSUStorage } = require('./utils');

const defaultOps = {
    app: "fgt-pharmacy-wallet",
    pathToApps: "../../",
    id: undefined
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

const generateSecrets = function(id) {
    return {
        "name": {
            "secret": "PDM the Pharmacy",
            "public": true,
            "required": true
        },
        "id": {
            "secret": id,
            "public": true,
            "required": true
        },
        "email": {
            "secret": "pharmacy@pdmfc.com",
            "public": true,
            "required": true
        },
        "tin": {
            "secret": 500000000,
            "public": true,
            "required": true
        },
        "address": {
            "required": true,
            "secret": "This in an Address"
        },
        "pass": {
            "required": true,
            "secret": "This1sSuchAS3curePassw0rd"
        },
        "passrepeat": {
            "required": true,
            "secret": "This1sSuchAS3curePassw0rd"
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

const instantiateSSApp = function(callback){
    getEnvJs(conf.app, (err, env) => {
        if (err)
            throw err;

        let config = require("opendsu").loadApi("config");
        config.autoconfigFromEnvironment(env);

        const appService = new (dt.AppBuilderService)(env);
        const id = conf.id || Math.round(Math.random() * 999999999);
        console.log(`Generating ${conf.app} with ID: ${id}`);
        const credentials = generateSecrets(id);
        appService.buildWallet(credentials, (err, keySII, dsu) => {
            if (err)
                throw err;
            console.log(`App ${env.appName} created with credentials ${JSON.stringify(credentials, undefined, 2)}.\nSSI: ${{keySII}}`);
            callback(undefined, keySII, dsu, credentials);
        });
    });
}

instantiateSSApp((err, walletSSI, walletDSU, credentials) => {
    if (err)
        throw err;
    const dsuStorage = impersonateDSUStorage(walletDSU.getWritableDSU());
    getParticipantManager(dsuStorage, (err, participantManager) => {
        if (err)
            throw err;
        console.log("Done");
    });
});







