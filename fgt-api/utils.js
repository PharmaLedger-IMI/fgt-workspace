const path = require("path");
const fs = require("fs");

const {functionCallIterator, getResolver, getKeySSISpace} = require('../pdm-dsu-toolkit/services/utils');
const {getParticipantManager} = require('../fgt-dsu-wizard/managers/ParticipantManager');
const {instantiateSSApp} = require('../bin/environment/utils');
const {APPS} = require('../bin/environment/credentials/credentials3');

const AppBuilderService = require('../pdm-dsu-toolkit/services/dt/AppBuilderService');

const dt = {
    AppBuilderService
}

const getCredentials = function(basePath, walletName, callback){
    const credentialsFilePath = path.join(process.cwd(), "config", "credentials.json");
    if (!fs.existsSync(credentialsFilePath))
        return callback(`No credentials file found`);

    fs.readFile(credentialsFilePath, (err, credentials) => {
        if (err)
            return callback(`No credentials file found`);
        try {
            credentials = JSON.parse(credentials);
        } catch (e) {
            return callback(e);
        }
        callback(undefined, credentials);
    });
}

const instantiate = function(basePath, walletName, callback){
    getCredentials(basePath, (err, credentials) => {
        if (err)
            return callback(err);
        instantiateSSApp(walletName, basePath, dt, credentials, (err, walletSSI, walletDSU) => {
            if (err)
                return callback(err);
            callback(undefined, walletSSI, walletDSU);
        });
    });
}

const load = function(keySSI, callback){
    try {
        keySSI = getKeySSISpace().parse(keySSI);
    } catch (e) {
        return callback(e);
    }

    getResolver().loadDSU(keySSI, (err, dsu) => {
        if (err)
            return callback(err);
        callback(undefined, keySSI, dsu);
    });
}

const getSeed = function(basePath, walletName, callback){
    const seedFilePath = path.join(process.cwd(), "config", "seed");
    if (!fs.existsSync(seedFilePath))
        return instantiate(basePath, walletName, callback);

    fs.readFile(seedFilePath, (err, data) => {
        if (err){
            console.log(`Could not read seed file. Trying to instantiate`);
            return instantiate(basePath, walletName, callback);
        }
        callback(undefined, data);
    });
}


const initApis = function(server, apis, walletName){
    getSeed(process.cwd(), walletName, (err, keySSI) => {
        if (err)
            throw err;
        load(keySSI, (err, walletDSU) => {
            if (err)
                throw err;
            getParticipantManager(walletDSU.getWritableDSU(), (err, participantManager) => {
                if (err)
                    throw err;
                Object.values(apis).forEach(api => {
                    try {
                        (new api)(server, participantManager)
                    } catch (e) {
                        console.log(e);
                    }
                });
            });
        });
    });
}

module.exports = {
    functionCallIterator,
    initApis,
    APPS
}