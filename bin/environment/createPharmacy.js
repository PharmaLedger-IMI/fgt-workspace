process.env.NO_LOGS = true;

const path = require('path');

require(path.join('../../privatesky/psknode/bundles', 'openDSU.js'));       // the whole 9 yards, can be replaced if only
const dt = require('../../pdm-dsu-toolkit/services/dt');
const { getParticipantManager, getProductManager, getBatchManager } = require('../../fgt-dsu-wizard/managers');
const { impersonateDSUStorage, argParser, instantiateSSApp } = require('./utils');

const { APPS } = require('./credentials/credentials');

const defaultOps = {
    app: "fgt-pharmacy-wallet",
    pathToApps: "../../",
    id: undefined
}

let conf = argParser(process.argv);


const setup = function (participant, issuedOrders, receivedShipments, callback) {
    callback(undefined, issuedOrders, receivedShipments);
}

const create = function (credentials, callback) {
    instantiateSSApp(APPS.PHARMACY, conf.pathToApps, dt, credentials, (err, walletSSI, walletDSU, credentials) => {
        if (err)
            throw err;
        const dsuStorage = impersonateDSUStorage(walletDSU.getWritableDSU());
        getParticipantManager(dsuStorage, (err, participantManager) => {
            if (err)
                throw err;
            console.log(`${conf.app} instantiated\ncredentials:`);
            console.log(credentials)
            console.log(`ID: ${credentials.id.secret}`);
            console.log(`SSI: ${walletSSI}`);
            callback(undefined, credentials, walletSSI, participantManager);
        });
    });
}

module.exports = {
    create,
    setup
};




