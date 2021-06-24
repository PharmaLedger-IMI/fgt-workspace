const {create} = require('../../bin/environment/createMah');
const {APPS, getCredentials} = require('../../bin/environment/credentials/credentials');
const {getProductManager, getBatchManager, getStockManager} = require('../../fgt-dsu-wizard/managers');



const getManagers = function(participantManager, callback){
    getProductManager(participantManager, (err, productManager) => {
        if (err)
            return callback(err);
        getBatchManager(participantManager, (err, batchManager) => {
            if (err)
                return callback(err);
            callback(undefined, productManager, batchManager, participantManager.getManager(StockManager));
        })
    })
}

create(getCredentials(APPS.MAH), (err, credentials, walletSSI, participantManager) => {
    if (err)
        throw err;
    console.log(`MAH created with SSI ${walletSSI}`);

    getManagers(participantManager, (err, productManager, batchManager, stockManager) => {
        if (err)
            throw err;
        console.log(`Instantiated relevant managers`);
        process.exit(0);
    })
})
