process.env.NO_LOGS = true;

const path = require('path');

// update the require path!!!
const getBatchManager = require('../../fgt-dsu-wizard/managers/BatchManager');
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
       const batchManager = getBatchManager(participantManager, true);

       batchManager.getAll(true, {
           query: `gtin like /${gtin}/g`
       }, (err, queriedBatches) => {
           if (err)
               throw err;
           if (!Array.isArray(queriedBatches))
               throw new Error('wrong result type');
           if (queriedBatches.length !== expectedBatches.length)
               throw new Error('Invalid results')
           process.exit(0);
       });
   })
});


