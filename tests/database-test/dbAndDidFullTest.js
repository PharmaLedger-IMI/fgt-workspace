process.env.NO_LOGS = true;

// update the require path!!!
const {create} = require('../../bin/environment/setupEnvironment');
const { APPS } = require('../../bin/environment/credentials/credentials');

create(APPS.SINGLE, (err, results) => {
    if (err)
        throw err;
    console.log(results);

    const whsReceivedOrderManager = results['fgt-wholesaler-wallet'][0].manager.receivedOrderManager;

});