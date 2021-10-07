process.exit(0); //to skip the test

const path = require('path');

try{
    require('opendsu');
} catch(e) {
    try{
        require(path.join('../privatesky/psknode/bundles', 'openDSU.js'));       // the whole 9 yards, can be replaced if only
    } catch(e1) {
        console.log(e1);
        process.exit(1);
    }
}

const getParticipantManager = require('../fgt-dsu-wizard/managers/ParticipantManager');
const {PARTICIPANT_MOUNT_PATH, INFO_PATH} = require("../fgt-dsu-wizard/constants");

const utils = require('../fgt-dsu-wizard/services/').utils;

function impersonateDSUStorage(dsu, valueMap){
    dsu.directAccessEnabled = false;
    dsu.enableDirectAccess = (callback) => callback();

    const setObject = function(path, data, callback) {
        if (path in valueMap)
            return callback();

        try {
            dsu.writeFile(path, JSON.stringify(data), callback);
        } catch (e) {
            callback(createOpenDSUErrorWrapper("setObject failed", e));
        }
    }

    const getObject = function(path, callback) {
        if (path in valueMap)
            return callback(undefined, valueMap[path])

        dsu.readFile(path, (err, data) => {
            if (err)
                return callback(createOpenDSUErrorWrapper("getObject failed" ,err));

            try{
                data = JSON.parse(data);
            } catch (e){
                return callback(createOpenDSUErrorWrapper(`Could not parse JSON ${data.toString()}`, e));
            }
            callback(undefined, data);
        });
    }

    dsu.getObject = getObject;
    dsu.setObject = setObject;
    return dsu;
}

const getRootDSU = function(domain, data, callback){
    if (!callback){
        callback = data;
        data = ''
    }

    const keySpace = utils.getKeySSISpace();
    const resolver = utils.getResolver();
    const rootSSI = keySpace.createTemplateSeedSSI(domain, typeof data === 'string' ? data : data.join(''), undefined, undefined);

    const createDBStructure = function(domain, callback){
        const dbSSI = keySpace.createTemplateSeedSSI(domain, 'db', undefined, undefined);
        const innerDbSSI = keySpace.createTemplateSeedSSI(domain, 'innerdb', undefined, undefined);

        resolver.createDSU(dbSSI, (err, dbDSU) => {
            if (err)
                return callback(err);
            resolver.createDSU(innerDbSSI, (err, innerDbDSU) => {
                if (err)
                    return callback(err);
                innerDbDSU.getKeySSIAsString((err, innerSSI) => {
                    if (err)
                        return callback(err);
                    dbDSU.mount('/data', innerSSI, (err) => {
                        if (err)
                            return callback(err);
                        dbDSU.getKeySSIAsString((err, dbSSI) => {
                            if (err)
                                return callback(err);
                            callback(undefined, dbSSI);
                        });
                    });
                });
            });
        });

    }
    resolver.createDSU(rootSSI, (err, dsu) => {
        if (err)
            return callback(err);
        createDBStructure(domain, (err, dbSSI) => {
            if (err)
                return callback(err);
            dsu.mount('/db', dbSSI, (err) => {
                if (err)
                    return callback(err);
                callback(undefined, dsu);
            });
        });
    });
}

const getFakeDSUStorage = function(domain, identity, callback){
    getRootDSU(domain, (err, dsu) => {
        if (err)
            return callback(err);
        const valueMap = {};
        const idPath = `${PARTICIPANT_MOUNT_PATH}/id${INFO_PATH}`;
        valueMap[idPath] = identity;
        const fakeDSUStorage = impersonateDSUStorage(dsu, valueMap);
        callback(undefined, fakeDSUStorage);
    });
}

const getMockParticipantManager = function(domain, identity, callback){
    getFakeDSUStorage(domain, identity,(err, dsuStorage) => {
        if (err)
            return callback(err);
        getParticipantManager(dsuStorage, (err, manager) => {
            if (err)
                return callback(err);
            callback(undefined, manager);
        });
    });
}

module.exports = {
    getMockParticipantManager
}