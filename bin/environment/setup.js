process.env.NO_LOGS = true;

const { APPS } = require('./credentials/credentials3');
const { argParser } = require('./utils');

const {create} = require('./setupEnvironment');

const defaultOps = {
    app: APPS.MAH,                              // defines the mode of the setup
    credentials: undefined,                     // allows for the setup of predefined credentials
    products: './products/productsRandom.js',   // allows for pre-generated product data
    batchCount: 11,
    serialQuantity: 100,
    expiryOffset: 100,
    trueStock: false,                           // makes stock managers actually remove products from available for others down the line,
    exportCredentials: false,                   // export credentials for use in the Api-hubs front page
    attachLogic: false,                         // attaches listeners to the proper managers to replicate business logic
    logicMode: "simple",                        // Accepts 'simple' - pharmacy makes an order, wholesalers try to ship/ place an order, mah fulfills, etc... or 'complex' where pharmacies keep issuing orders and performing sales up to a point
    statusUpdateTimeout: 5000,                  // When attachLogic is true, sets the timeout between status updates
    timeoutMultiplier: 5                        // If attach logic is true, will wait x times the status update timeout until it ends the process
}

const conf = argParser(defaultOps, process.argv);

const parseResult = function(results){
    return Object.keys(Object.keys(results).map(key => {
        return {
            type: key,
            created: results[key].length ? results[key].map(p => {
                const relevant = {
                    id: p.credentials.id.secret,
                    ssi: p.ssi
                };
                if ([APPS.TEST].indexOf(conf.app) !== -1){
                    relevant['name'] = p.credentials.name.secret;
                    relevant['email'] = p.credentials.email.secret;
                    relevant['address'] = p.credentials.address.secret;
                }
            }) : 'none'
        };
    }))
}

const printResults = function (results, callback) {
    console.log(`Environment set for ${conf.app}`);
    // console.log(`Results:\n${JSON.stringify(results, jsonStringifyReplacer, 2)}`);
    console.log(`Ids per Participant:`);
    console.log(JSON.stringify(parseResult(results), undefined, 2))
    callback();
}

const exportCredentials = function(results, callback){
    if (!conf.exportCredentials)
        return callback();
    require('fs').writeFile('../../apihub-root/credentials.json', JSON.stringify(parseResult(results), undefined, 2), (err) => err
        ? callback(`Could not export Credentials`)
        : callback());
}

try {
    create(conf, (err, results) => {
        if (err)
            throw err;
        printResults(results, (err) => {
            if (err)
                throw err;
            exportCredentials(results, (err) => {
                if (err)
                    throw err;
                process.exit(0);
            });
        });
    });
} catch (e) {
    console.log(e.Message, e.stack, e);
    process.exit(1)
}
