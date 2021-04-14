process.env.NO_LOGS = true;

const APPS = {
    MAH: 'fgt-mah-wallet',
    WHOLESALER: 'fgt-wholesaler-wallet',
    PHARMACY: 'fgt-pharmacy-wallet',
    FULL: 'full',
    PROD: 'prod'
}


const defaultOps = {
    app: APPS.MAH,
}

const result = {};
result[APPS.MAH] = [];
result[APPS.WHOLESALER] = [];
result[APPS.PHARMACY] = [];


const argParser = function(args){
    let config = JSON.parse(JSON.stringify(defaultOps));
    if (!args)
        return config;
    args = args.slice(2);
    const recognized = Object.keys(config);
    const notation = recognized.map(r => '--' + r);
    args.forEach(arg => {
        if (arg.includes('=')){
            let splits = arg.split('=');
            if (notation.indexOf(splits[0]) !== -1) {
                let result
                try {
                    result = eval(splits[1]);
                } catch (e) {
                    result = splits[1];
                }
                config[splits[0].substring(2)] = result;
            }
        }
    });
    return config;
}

const setupFullEnvironment = function(products, batches, callback){
    if (!callback){
        callback = batches;
        batches = undefined;
    }
    if (!callback){
        callback = products;
        products = undefined;
    }

    execute(APPS.MAH, (err, mahCredentials, products, batches) => {
        if (err)
            return callback(err);
        result[APPS.MAH].push({
            credentials: mahCredentials,
            products: products,
            batches: batches
        });

        execute(APPS.WHOLESALER, (err, wholesalerCredentials, products, batches, stocks) => {
            if (err)
                return callback(err);
            result[APPS.MAH].push({
                credentials: mahCredentials,
                products: products,
                batches: batches
            });
        });
    });
}

const setupProdEnvironment = function(callback){

}


const execute = function(config, callback){
    switch(config.app){
        case APPS.MAH:
            return require('./createMah')((err, mahCredentials, products, batches) => {
                if (err)
                    return callback(err);
                result[APPS.MAH].push({
                    credentials: mahCredentials,
                    products: products,
                    batches: batches
                });
                callback()
            });
        case APPS.WHOLESALER:
            return require('./createWholesaler')((err, wholesalerCredentials, products, batches, stocks) => {
                if (err)
                    return callback(err);
                result[APPS.MAH].push({
                    credentials: wholesalerCredentials,
                    stocks: stocks
                });
                callback()
            });
        case APPS.PHARMACY:
            return require('./createPharmacy')(callback);
        case APPS.FULL:
            return setupFullEnvironment(callback);
        case APPS.PROD:
            return setupProdEnvironment(callback);
        default:
            callback(`unsupported config: ${config.app}`);
    }
}

const conf = argParser(process.argv);
execute(conf, (err) => {
    if (err)
        throw err;
    console.log(`Environment set for ${conf.app}`);
    console.log(`Results:\n${JSON.stringify(result, undefined, 2)}`);
    process.exit(0);
});