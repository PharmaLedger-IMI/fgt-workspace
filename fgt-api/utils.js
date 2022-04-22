const path = require("path");
const fs = require("fs");
const cors = require("cors");

const {getResolver, getKeySSISpace} = require('../pdm-dsu-toolkit/services/utils');
const getParticipantManager = require('../fgt-dsu-wizard/managers/ParticipantManager');
const {instantiateSSApp, loadWallet, impersonateDSUStorage} = require('../bin/environment/utils');
const {APPS} = require('../bin/environment/credentials/credentials3');
const {encodeBase64} = require('./utils/basicAuth');
const {argParser} = require("./utils/argParser");

const AppBuilderService = require('../pdm-dsu-toolkit/services/dt/AppBuilderService');

const dt = {
    AppBuilderService
}

const log = function(message, ...args){
    if (!message)
        return;
    console.log(`[FGT-API - ${Date.now()}] - ${message}`, ...args);
}

const getCredentials = function(basePath, walletName, callback){
    const credentialsFilePath = path.join(basePath, walletName, "credentials.json");
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
        const argConfig = argParser({token: `${encodeBase64(credentials.pass.secret)}`}, process.argv);
        process.env.PARTICIPANT_ID = credentials.id.secret;
        process.env.TOKEN = argConfig.token;
        instantiateSSApp(walletName, "..", dt, credentials, (err, walletSSI, walletDSU) => {
            if (err) {
                console.log(`The wallet couldn't be created. Trying to load with credentials...` );
                return loadWallet(walletName, "..", dt, credentials, callback);
            }
            callback(undefined, walletSSI, walletDSU, credentials);
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

const initApis = function(express, apis, port, walletName, ...managerInitMethods){
    log(`InitApi: ${walletName} on :${port}`);

    if (Object.keys(apis).length !== managerInitMethods.length)
        throw new Error("Must be exists a initialized manager for each API.");

    const credentialPath = path.join(process.cwd(), "config");
    instantiate(credentialPath, walletName, (err, walletSSI, walletDSU) => {
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
                    server.use(function (req, res, next) {
                        res.contentType('application/json');
                        next();
                    });
                    server.use(cors());
                    server.use(express.urlencoded({extended: true}));
                    server.set('query parser', 'simple');

                    Object.values(apis).forEach(api => {
                        try {
                            new api(server, participantManager)
                        } catch (e) {
                            log(e);
                        }
                    });

                    server.listen(port);
                });
            });
        }

        walletDSU.getKeySSIAsObject((err, keySSI) => {
            if (err)
                throw err;
            load(keySSI.getIdentifier(), (err, walletDSU) => {
                if (err)
                    throw err;
                init(walletDSU);
            });
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
    initApis,
    APPS,
    log
}