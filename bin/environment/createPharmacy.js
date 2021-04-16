process.env.NO_LOGS = true;

const path = require('path');

require(path.join('../../privatesky/psknode/bundles', 'openDSU.js'));       // the whole 9 yards, can be replaced if only
const dt = require('../../pdm-dsu-toolkit/services/dt');
const { getParticipantManager, getIssuedOrderManager } = require('../../fgt-dsu-wizard/managers');
const { Order, OrderLine } = require('../../fgt-dsu-wizard/model');
const { impersonateDSUStorage, argParser, instantiateSSApp } = require('./utils');

const { APPS } = require('./credentials/credentials');

const defaultOps = {
    app: "fgt-pharmacy-wallet",
    pathToApps: "../../",
    id: undefined
}

let conf = argParser(defaultOps, process.argv);


const setup = function (participantManager, products, wholesalers, stocks, callback) {
    // TODO move this to a function that generates issuedOrders ?
    const issuedOrderManager = getIssuedOrderManager(participantManager, true);

    let issuedOrders = [];

    let receivedShipments = [];

    // Order#1 - products[0] ordered to wholesalers[0]
    if (products.length <=0)
        return callback("Products has zero length.");
    if (wholesalers.length <=0)
        return callback("Wholesalers has zero length.");
    const product0 = products[0];
    issuedOrderManager.newBlank((err, order) => {
        if (err)
            return callback(err);
        order.senderId = wholesalers[0].id.secret;
        const orderLine1 = new OrderLine(product0.gtin, 1, order.requesterId, order.senderId);
        order.orderLines.push(orderLine1);
        issuedOrderManager.create(order, (err, keySSI) => {            
            if (err)
                return callback(err);
            issuedOrders.push(order);
            // last step
            callback(undefined, issuedOrders, receivedShipments);
        });
    });
}

const create = function (credentials, callback) {
    instantiateSSApp(APPS.PHARMACY, conf.pathToApps, dt, credentials, (err, walletSSI, walletDSU, credentials) => {
        if (err)
            throw err;
        const dsuStorage = impersonateDSUStorage(walletDSU.getWritableDSU());
        getParticipantManager(dsuStorage, true,(err, participantManager) => {
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




