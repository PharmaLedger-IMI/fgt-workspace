process.env.NO_LOGS = true;

const { APPS, getCredentials } = require('./credentials/credentials');
const { argParser } = require('./utils');

const getProducts = require('./products/productsRandom');
const getBatches = require('./batches/batchesRandom');

const defaultOps = {
    app: APPS.MAH,
    credentials: undefined,
    products: './products/productsRandom.js'
}

const result = {};
result[APPS.MAH] = [];
result[APPS.WHOLESALER] = [];
result[APPS.PHARMACY] = [];


const FULL = {}
FULL[APPS.MAH] = [getCredentials(APPS.MAH)];
FULL[APPS.WHOLESALER] = [getCredentials(APPS.WHOLESALER)];
FULL[APPS.PHARMACY] = [getCredentials(APPS.PHARMACY)];

const setupFullEnvironment = function(actors, callback){
    if (!callback){
        callback = actors
        actors = FULL
    }

    const mapper = function(type, arr){
        return arr[type].map(a => ({"type": type, credentials: a}));
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

    const wholesalersCopy =

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
        return function(err, ...results){
            const callback = results.pop();
            if (err)
                return callback(err);
            result[type].filter(r => r.ssi === ssi)
        }
    }

    switch(type){
        case APPS.MAH:
            return require('./createMah').setup(credentials, cb(credentials.ssi, APPS.MAH));
        case APPS.WHOLESALER:
            return require('./createWholesaler').create(credentials, cb(credentials.ssi, APPS.WHOLESALER));
        case APPS.PHARMACY:
            return require('./createPharmacy').create(credentials, cb(credentials.ssi, APPS.PHARMACY));
        default:
            callback(`unsupported config: ${type}`);
    }
}

const create = function(app, credentials, callback){
    const cb = function(type){
        return function(err, credentials, ssi, manager){
            if (err)
                return callback(err);
            result[type].push({
                credentials: credentials,
                ssi: ssi,
                manager: manager
            });
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
create(conf.app, (err) => {
    if (err)
        throw err;
    console.log(`Environment set for ${conf.app}`);
    console.log(`Results:\n${JSON.stringify(result, undefined, 2)}`);
    process.exit(0);
});