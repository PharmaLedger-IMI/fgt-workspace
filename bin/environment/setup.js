process.env.NO_LOGS = true;

const { APPS, getCredentials } = require('./credentials/credentials');
const { argParser, jsonStringifyReplacer } = require('./utils');

const getProducts = require('./products/productsRandom');
const { getStockFromProductsAndBatchesObj } = require('./stocks/stocksRandomFromProducts');
const { getDummyWholesalers } = require('./credentials/credentials');

const defaultOps = {
    app: APPS.MAH,
    credentials: undefined,
    products: './products/productsRandom.js'
}

const results = {};
results[APPS.MAH] = [];
results[APPS.WHOLESALER] = [];
results[APPS.PHARMACY] = [];

const getSingle = () => {
    const SINGLE = {}
    SINGLE[APPS.MAH] = [getCredentials(APPS.MAH)];
    SINGLE[APPS.WHOLESALER] = [getCredentials(APPS.WHOLESALER)];
    SINGLE[APPS.PHARMACY] = [getCredentials(APPS.PHARMACY)];
    return SINGLE;
}

const getMultiple = () => {
    const MULTIPLE = {};
    MULTIPLE[APPS.MAH] = [getCredentials(APPS.MAH), getCredentials(APPS.MAH), getCredentials(APPS.MAH)];
    MULTIPLE[APPS.WHOLESALER] = [getCredentials(APPS.WHOLESALER), getCredentials(APPS.WHOLESALER), getCredentials(APPS.WHOLESALER), getCredentials(APPS.WHOLESALER)];
    MULTIPLE[APPS.PHARMACY] = [];
    return MULTIPLE;
}

const getProd = () => {
    const MULTIPLE = {};
    MULTIPLE[APPS.MAH] = [getCredentials(APPS.MAH, 'merkl')];
    MULTIPLE[APPS.WHOLESALER] = [];
    MULTIPLE[APPS.PHARMACY] = [];
    return MULTIPLE;
}

const mapper = function(type, arr){
    return arr[type].map(a => ({"type": type, credentials: a}));
}

const setupFullEnvironment = function(actors, callback){
    if (!callback){
        callback = actors
        actors = SINGLE
    }

    const createIterator = function(participants, callback){
        const participant = participants.shift();
        if (!participant)
            return callback();
        create(participant.type, participant.credentials, (err) => err
            ? callback(err)
            : createIterator(participants, callback));
    }

    const setupMAHIterator = function(mahsCopy, callback){
        const mah = mahsCopy.shift();
        if (!mah)
            return callback();
        console.log(`now setting up MAH with key ${mah.ssi}`);
        setup(APPS.MAH, mah,
            mah.credentials.products || getProducts(),
            mah.credentials.batches || undefined, (err) => err
                ? callback(err)
                : setupMAHIterator(mahsCopy, callback));
    }

    const setupWholesalerIterator = function(wholesalersCopy, products, batches, callback){
        const wholesaler = wholesalersCopy.shift();
        if (!wholesaler)
            return callback();
        console.log(`now setting up Wholesaler with key ${wholesaler.ssi}`);
        setup(APPS.WHOLESALER, wholesaler,
            wholesaler.credentials.stock || getStockFromProductsAndBatchesObj(products, batches), (err) => err
                    ? callback(err)
                    : setupWholesalerIterator(wholesalersCopy, products, batches, callback));
    }

    const setupPharmacyIterator = function(pharmaciesCopy, products, batches, wholesalers, callback){
        const pharmacy = pharmaciesCopy.shift();
        if (!pharmacy)
            return callback();
        console.log(`now setting up Pharmacy with key ${pharmacy.ssi}`);
        setup(APPS.PHARMACY, pharmacy, products,
            wholesalers, pharmacy.credentials.stock || getStockFromProductsAndBatchesObj(products, batches), (err) => err
                ? callback(err)
                : setupPharmacyIterator(pharmaciesCopy, products, batches, wholesalers, callback));
    }

    const actorsCopy = [...mapper(APPS.MAH, actors),
        ...mapper(APPS.WHOLESALER, actors),
        ...mapper(APPS.PHARMACY, actors)];

    createIterator(actorsCopy, (err, actors) => {
        if (err)
            return callback(err);
        setupMAHIterator(results[APPS.MAH].slice(), (err) => {
           if (err)
               return callback(err);

           // aggregate all existing products
           const allProducts = results[APPS.MAH].reduce((acc, mah) => {
               acc.push(...mah.results[0])
               return acc;
           }, []);

           // and all existing batches
            const allBatchesObj = results[APPS.MAH].reduce((acc, mah) => {
                Object.keys(mah.results[1]).forEach(key => {
                    if (key in acc)
                        console.warn(`batches are being overwritten`);
                    acc[key] = mah.results[1][key];
                });
                return acc;
            }, {});

            setupWholesalerIterator(results[APPS.WHOLESALER].slice(), allProducts, allBatchesObj, (err) => {
                if (err)
                    return callback (err);
                setupPharmacyIterator(results[APPS.PHARMACY].slice(), allProducts, allBatchesObj, results[APPS.WHOLESALER].map(w => w.credentials), (err) => {
                    if (err)
                        return callback(err);
                    callback();
                });
            });
        });
    });
}

const setup = function(type, result, ...args){
    const callback = args.pop();

    const cb = function(ssi, type){
        return function(err, ...result){
            if (err)
                return callback(err);
            results[type].filter(r => r.ssi === ssi)[0].results = result;
            callback(undefined, ...result)
        }
    }

    let products, batches;

    switch(type){
        case APPS.MAH:
            products = args.shift() || getProducts();
            batches = args.shift();
            return require('./createMah').setup(result.manager, products, batches, cb(result.ssi, APPS.MAH));
        case APPS.WHOLESALER:
            products = args.shift() || getProducts();
            batches = args.shift();
            return require('./createWholesaler').setup(result.manager, getStockFromProductsAndBatchesObj(products, batches) , cb(result.ssi, APPS.WHOLESALER));
        case APPS.PHARMACY:
            products = args.shift() || getProducts();
            const wholesalers = args.shift() || getDummyWholesalers();
            const stocks = args.shift() || getStockFromProductsAndBatchesObj(products);
            return require('./createPharmacy').setup(result.manager, products, wholesalers, stocks, cb(result.ssi, APPS.PHARMACY));
        default:
            callback(`unsupported config: ${type}`);
    }
}

const create = function(app, credentials, callback){
    let shouldSetup = false;
    if (!callback){
        callback = credentials;
        credentials = getCredentials(app);
        shouldSetup = true;
    }

    const cb = function(type){
        return function(err, credentials, ssi, manager){
            if (err)
                return callback(err);
            const result = {
                credentials: credentials,
                ssi: ssi,
                manager: manager
            };
            results[type].push(result);
            return shouldSetup ? setup(type, result, callback) : callback();
        }
    }

    switch(app){
        case APPS.MAH:
            return require('./createMah').create(credentials, cb(APPS.MAH));
        case APPS.WHOLESALER:
            return require('./createWholesaler').create(credentials, cb(APPS.WHOLESALER));
        case APPS.PHARMACY:
            return require('./createPharmacy').create(credentials, cb(APPS.PHARMACY));
        case APPS.SINGLE:
            return setupFullEnvironment(getSingle(), callback);
        case APPS.MULTIPLE:
            return setupFullEnvironment(getMultiple(), callback);
        case APPS.PROD:
            return setupFullEnvironment(getProd(), callback);
        default:
            callback(`unsupported config: ${app}`);
    }
}

const conf = argParser(defaultOps, process.argv);

create(conf.app, (err) => {
    if (err)
        throw err;
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
        } ;
    }), undefined, 2));
    process.exit(0);
});