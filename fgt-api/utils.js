const path = require("path");
const fs = require("fs");

const {functionCallIterator, getResolver, getKeySSISpace} = require('../pdm-dsu-toolkit/services/utils');
const getParticipantManager = require('../fgt-dsu-wizard/managers/ParticipantManager');
const {instantiateSSApp, impersonateDSUStorage} = require('../bin/environment/utils');
const {APPS} = require('../bin/environment/credentials/credentials3');

const AppBuilderService = require('../pdm-dsu-toolkit/services/dt/AppBuilderService');

const dt = {
    AppBuilderService
}

const log = function(message, ...args){
    if (!message)
        return;
    console.log(`[FGT-API][${Date.now()}] - ${message}`, ...args);
}

const getCredentials = function(basePath, walletName, callback){
    const credentialsFilePath = path.join(process.cwd(), "..", "fgt-api", "config", "credentials.json");
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
    getCredentials(basePath, walletName, (err, credentials) => {
        if (err)
            return callback(err);
        instantiateSSApp(walletName, "..", dt, credentials, (err, walletSSI, walletDSU) => {
            if (err)
                return callback(err);
            callback(undefined, walletSSI, walletDSU);
        });
    });
}

const load = function(keySSI, callback){
    try {
        keySSI = getKeySSISpace().parse(keySSI.toString());
    } catch (e) {
        return callback(e);
    }

    getResolver().loadDSU(keySSI, (err, dsu) => {
        if (err)
            return callback(err);
        callback(undefined, dsu);
    });
}

const getSeed = function(basePath, walletName, callback){
    const seedFilePath = path.join(process.cwd(), "..", "fgt-api", "config", "seed");
    if (!fs.existsSync(seedFilePath))
        return instantiate(basePath, walletName, callback);

    fs.readFile(seedFilePath, (err, data) => {
        if (err){
            log(`Could not read seed file. Trying to instantiate`);
            return instantiate(basePath, walletName, callback);
        }
        callback(undefined, data);
    });
}

const saveSeed = function(seed, callback){
    const seedFilePath = path.join(process.cwd(), "..", "fgt-api", "config", "seed");
    fs.writeFile(seedFilePath, seed.toString(), callback);
}


const initApis = function(express, apis, walletName, ...managerInitMethods){

    getSeed(process.cwd(), walletName, (err, keySSI, walletDSU) => {
        if (err)
            throw err;

        const init = function(wallet){
            getParticipantManager(impersonateDSUStorage(wallet.getWritableDSU()), (err, participantManager) => {
                if (err)
                    throw err;
                initManagers(participantManager, ...managerInitMethods, (err) => {
                    if (err)
                        throw err;

                    const server = express();

                    Object.values(apis).forEach(api => {
                        try {
                            new api(server, participantManager)
                        } catch (e) {
                            console.log(e);
                        }
                    });

                    server.listen(8081);
                });
            });
        }

        if (walletDSU){
            walletDSU.getKeySSIAsObject((err, keySSI) => {
                if (err)
                    return callback(err);
                saveSeed(keySSI.getIdentifier(), (err) => {
                    if (err)
                        return callback(err);
                    init(walletDSU);
                });
            });
        }

        load(keySSI, (err, walletDSU) => {
            if (err)
                throw err;
            init(walletDSU);
        });
    });
}

const initManagers = function(participantManager, ...managerInitMethods){
    const callback = managerInitMethods.pop();

    const initIterator = function(managerInits, callback){
        const managerInit = managerInits.shift();
        if (!managerInit)
            return callback();
        managerInit(participantManager, (err, manager) => {
            if (err)
                return callback(err);
            log(`Manager ${manager.tableName} booted for ${participantManager.getIdentity().id}`);
            initIterator(managerInits, callback);
        });
    }

    initIterator(managerInitMethods.slice(), (err) => {
        if (err)
            return callback(err);
        callback(undefined);
    });
}

module.exports = {
    functionCallIterator,
    initApis,
    APPS,
    log
}