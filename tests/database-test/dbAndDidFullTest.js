process.env.NO_LOGS = true;

// update the require path!!!
const getProductManager = require('../../fgt-dsu-wizard/managers/ProductManager');
const {create, setup } = require('../../bin/environment/createMah');
const { getCredentials, APPS } = require('../../bin/environment/credentials/credentials');

create(getCredentials(APPS.MAH, Math.floor(Math.random() * 999999999) + 1), (err, credentials, walletSSI, participantManager) => {
    if (err)
        throw err;
    setup(participantManager, undefined, undefined, (err, productsObj, batchesObj) => {
        if (err)
            throw err;
        const gtin = Object.keys(batchesObj)[0];
        const expectedBatches = batchesObj[gtin];
        const productManager = getProductManager(participantManager, true);

        const messages = ['message', 'other message', 'another message', 'one more',
            'just one more', 'are we there yet', 'just a litle more', 'maybe its enough', 'no not yet']

        const mockDID = 'WHS451289339';

        const messageCallback = function(err, ...args){
            if (err)
                return console.log(`Error sending message`, err);
            console.log(...args);
        }

        const timeBeforeMessages = Date.now();
        console.log(`Before Messages: ${timeBeforeMessages}`);

        messages.forEach(m => participantManager.sendMessage(mockDID, 'someApi', m, messageCallback));

        const timeAfterMessages = Date.now();
        console.log(`After Messages: ${timeAfterMessages}. elapsed: ${timeAfterMessages-timeBeforeMessages} ms`);
        const timeBeforeQuery = Date.now();
        console.log(`Before Query: ${timeBeforeMessages}`);

        // make a query
        productManager.getAll(true, {
            query: `gtin like /.*/g`
        }, (err, products) => {
            const timeAfterQuery = Date.now();
            console.log(`After Messages: ${timeAfterQuery}. elapsed: ${timeAfterQuery-timeBeforeQuery} ms`);

            //process.exit(0);
        });
    })
});