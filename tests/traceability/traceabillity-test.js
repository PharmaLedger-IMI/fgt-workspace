process.env.NO_LOGS = true;

const { APPS } = require('../../bin/environment/credentials/credentials3');

const {create} = require('../../bin/environment/setupEnvironment');

const testOpts = {
    app: APPS.SIMPLE_TRACEABILITY,                              // defines the mode of the setup
    credentials: undefined,                     // allows for the setup of predefined credentials
    products: './products/productsRandom.js',   // allows for pre-generated product data
    batchCount: 11,
    serialQuantity: 100,
    expiryOffset: 100,
    trueStock: true,                           // makes stock managers actually remove products from available for others down the line,
    exportCredentials: false,                   // export credentials for use in the Api-hubs front page
    attachLogic: true,                         // attaches listeners to the proper managers to replicate business logic
    statusUpdateTimeout: 5000                   // When attachLogic is true, sets the timeout between status updates
}

const cb = function(err, ...results){
    if (err)
        throw err;
    console.log(`Results:`, ...results);
    process.exit(0)
}


create(testOpts, (err, results) => {
    if (err)
        return cb(err);
    cb(undefined, results);

});
