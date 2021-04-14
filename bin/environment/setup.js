process.env.NO_LOGS = true;

const { APPS, getCredentials } = require('./credentials/credentials');
const { argParser } = require('./utils');

const getProducts = require('./products/productsRandom');

const defaultOps = {
    app: APPS.MAH,
    credentials: undefined,
    products: './products/productsRandom.js'
}

const results = {};
results[APPS.MAH] = [];
results[APPS.WHOLESALER] = [];
results[APPS.PHARMACY] = [];


const FULL = {}
FULL[APPS.MAH] = [getCredentials(APPS.MAH)];
FULL[APPS.WHOLESALER] = [getCredentials(APPS.WHOLESALER)];
FULL[APPS.PHARMACY] = [getCredentials(APPS.PHARMACY)];

const mapper = function(type, arr){
    return arr[type].map(a => ({"type": type, credentials: a}));
}

const setupFullEnvironment = function(actors, callback){
    if (!callback){
        callback = actors
        actors = FULL
    }

    const createIterator = function(participants, callback){
        const participant = participants.shift();
        if (!participant)
            return callback(undefined, actors);
        create(participant.type, participant.credentials, (err) => {
            if (err)
                return callback(err);
            return createIterator(participants, callback);
        });
    }

    const actorsCopy = [...mapper(APPS.MAH, actors),
            ...mapper(APPS.WHOLESALER, actors),
            ...mapper(APPS.PHARMACY, actors)];

    const setupMAHIterator = function(mahsCopy, callback){
        const mah = mahsCopy.shift();
        if (!mah)
            return callback(undefined, actors);
        setup(mah.type, mah.credentials,
            mah.manager,
            mah.credentials.products || getProducts(),
            mah.credentials.batches || undefined, (err) => {
                if (err)
                    return callback(err);
                return setupMAHIterator(mahsCopy, callback);
        });
    }

    const wholesalersCopy = mapper(APPS.WHOLESALER, actors);
    const pharmacyCopy = mapper(APPS.PHARMACY, actors);

    const setupWholesalerIterator = function(wholesalersCopy, products, batches, callback){
        const wholesaler = wholesalersCopy.shift();
        if (!wholesaler)
            return callback(undefined, );

        setup(wholesaler.type, wholesaler.credentials,
            wholesaler.manager,
            wholesaler.credentials.stock || getProducts(), (err) => err
                    ? callback(err)
                    : setupMAHIterator(wholesalersCopy, callback));
    }

    createIterator(actorsCopy, (err, actors) => {
        if (err)
            return callback(err);
        setupMAHIterator(mapper(APPS.MAH, actors), (err, productsObj) => {
           if (err)
               return callback(err);

        });
    });
}

const setupProdEnvironment = function(callback){
    const getProdParticipants = function(){
        return {}
    }
    return setupFullEnvironment(getProdParticipants(), (err) => {
        if (err)
            return callback(err);
        console.log("Production Environment setup");
        callback();
    });
}

const setup = function(type, credentials, manager, ...args){
    const callback = args.pop();

    const cb = function(ssi, type){
        return function(err, ...result){
            if (err)
                return callback(err);
            results[type].filter(r => r.ssi === ssi)[0].results = result;
            callback(undefined, ...result)
        }
    }

    switch(type){
        case APPS.MAH:
            const products = args.shift() || getProducts();
            const batches = args.shift() || undefined;
            return require('./createMah').setup(manager, products, batches, cb(credentials.ssi, APPS.MAH));
        case APPS.WHOLESALER:
            return require('./createWholesaler').setup(manager, ...args, cb(credentials.ssi, APPS.WHOLESALER));
        case APPS.PHARMACY:
            return require('./createPharmacy').setup(manager, ...args, cb(credentials.ssi, APPS.PHARMACY));
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
            return shouldSetup ? setup(type, result, manager, callback) : callback();
        }
    }

    switch(app){
        case APPS.MAH:
            return require('./createMah').create(credentials, cb(APPS.MAH));
        case APPS.WHOLESALER:
            return require('./createWholesaler').create(credentials, cb(APPS.WHOLESALER));
        case APPS.PHARMACY:
            return require('./createPharmacy').create(credentials, cb(APPS.PHARMACY));
        case APPS.FULL:
            return setupFullEnvironment(callback);
        case APPS.PROD:
            return setupProdEnvironment(callback);
        default:
            callback(`unsupported config: ${app}`);
    }
}

const conf = argParser(defaultOps, process.argv);

function jsonStringifyReplacer(key, value){
    if(key === 'manager' && value.constructor.name)
        return value.constructor.name;
    if (key === 'serialNumbers')
        return value.join(', ');
    return value;
}

create(conf.app, (err) => {
    if (err)
        throw err;
    console.log(`Environment set for ${conf.app}`);
    console.log(`Results:\n${JSON.stringify(results, jsonStringifyReplacer, 2)}`);
    process.exit(0);
});