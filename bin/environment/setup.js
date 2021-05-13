process.env.NO_LOGS = true;

const { APPS } = require('./credentials/credentials');
const { argParser } = require('./utils');

const {create} = require('./setupEnvironment');

const defaultOps = {
    app: APPS.MAH,
    credentials: undefined,
    products: './products/productsRandom.js'
}

const processPendingMessages = function (callback) {
    switch (conf.app) {
        case APPS.SINGLE:
            // This is for --app=single - there is one MAH, WHS and PHA.
            // jpsl: Wait for messages ? There should be a better way...
            setTimeout(() => {
                return callback();
            }, 1000);
            /*
            setTimeout(() => {
                //console.log(results);
                // jpsl: Is there a simpler way to get the whsManager ? Yes if one had used and WholesalerFactory pattern.
                let aWhsManager = results['fgt-wholesaler-wallet'][0].manager;
                //console.log(aWhsManager);
                //aWhsManager.getMessages((err,records) => { console.log("err",err,"records",records); });
                require('./createWholesaler').processOrders(aWhsManager, (err) => {
                    //setTimeout(()=>{ callback(err); }, 3000);
                    return callback(err);
                });
            }, 1000);
            */
            break;
        default:
            return callback();
    }
}

const printResults = function (results, callback) {
    console.log(`Environment set for ${conf.app}`);
    // console.log(`Results:\n${JSON.stringify(results, jsonStringifyReplacer, 2)}`);
    console.log(`Ids per Participant:`);
    console.log(JSON.stringify(Object.keys(results).map(key => {
        return {
            type: key,
            created: results[key].length ? results[key].map(p => ({
                id: p.credentials.id.secret,
                ssi: p.ssi
            })) : 'none'
        };
    }), undefined, 2))
    callback();
}

const conf = argParser(defaultOps, process.argv);

create(conf.app, (err, results) => {
    if (err)
        throw err;
    // jpsl: TODO discuss with Tiago the processing of pending messages.
    processPendingMessages((err) => {
        if (err)
            throw err;
        printResults(results, (err) => {
            if (err)
                throw err;
            process.exit(0);
        });
    });
});