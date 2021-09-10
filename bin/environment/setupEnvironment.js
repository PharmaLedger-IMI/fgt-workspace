process.env.NO_LOGS = true;

const { APPS, getCredentials } = require('./credentials/credentials3');

const getProducts = require('./products/productsRandom');
const { getStockFromProductsAndBatchesObj, getFullStockFromProductsAndBatchesObj } = require('./stocks/stocksRandomFromProducts');
const { getDummyWholesalers } = require('./credentials/credentials3');
const {MSD, PFIZER, ROCHE, BAYER, NOVO_NORDISK, GSK, TAKEDA, generatePharmacyCredentials, generateWholesalerCredentials} = require('./credentials/credentialsTests');

const { ROLE } = require('../../fgt-dsu-wizard/model/DirectoryEntry');

const submitEvent = require('./listeners/eventHandler');

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
    MULTIPLE[APPS.PHARMACY] = [getCredentials(APPS.PHARMACY), getCredentials(APPS.PHARMACY)];
    return MULTIPLE;
}

const getProd = () => {
    const MULTIPLE = {};
    MULTIPLE[APPS.MAH] = [PFIZER, MSD, ROCHE];
    MULTIPLE[APPS.WHOLESALER] = [generateWholesalerCredentials(), generateWholesalerCredentials(), generateWholesalerCredentials(), generateWholesalerCredentials()];
    MULTIPLE[APPS.PHARMACY] = [generatePharmacyCredentials(), generatePharmacyCredentials(), generatePharmacyCredentials(), generatePharmacyCredentials(), generatePharmacyCredentials(), generatePharmacyCredentials()];
    return MULTIPLE;
}

getFakeTest = () => {
    const SINGLE = {}
    SINGLE[APPS.MAH] = [getCredentials(APPS.MAH, undefined, true), getCredentials(APPS.MAH, undefined, true)];
    SINGLE[APPS.WHOLESALER] = [getCredentials(APPS.WHOLESALER)];
    SINGLE[APPS.PHARMACY] = [getCredentials(APPS.PHARMACY)];
    return SINGLE;
}

const getTest = () => {
    const MULTIPLE = {};
    MULTIPLE[APPS.MAH] = [PFIZER, MSD, ROCHE, BAYER, NOVO_NORDISK, GSK, TAKEDA];
    MULTIPLE[APPS.WHOLESALER] = [
        generateWholesalerCredentials(undefined, "PDM the Wholesaler", undefined, "London, England")
    ];
    MULTIPLE[APPS.PHARMACY] = [
        generatePharmacyCredentials(undefined, "PDM the Pharmacy", undefined, "Avenida da Liberdade, Lisboa, Portugal")
    ];
    return MULTIPLE;
}

const mapper = function(type, arr){
    return arr[type].map(a => ({"type": type, credentials: a}));
}


let conf = undefined;

const setupFullEnvironment = function(actors, callback){
    if (!callback){
        callback = actors
        actors = getSingle();
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
        setup(conf, APPS.MAH, mah,
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
        setup(conf, APPS.WHOLESALER, wholesaler,
            wholesaler.credentials.stock || getStockFromProductsAndBatchesObj(80, conf.trueStock, products, batches), (err) => err
                ? callback(err)
                : setupWholesalerIterator(wholesalersCopy, products, batches, callback));
    }

    const setupPharmacyIterator = function(pharmaciesCopy, products, batches, wholesalers, callback){
        const pharmacy = pharmaciesCopy.shift();
        if (!pharmacy)
            return callback();
        console.log(`now setting up Pharmacy with key ${pharmacy.ssi}`);
        setup(conf, APPS.PHARMACY, pharmacy, products,
            wholesalers, pharmacy.credentials.stock || getStockFromProductsAndBatchesObj(20, conf.trueStock, products, batches), (err) => err
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
                    returnResults(callback);
                });
            });
        });
    });
}

const setupSingleTraceability = function(actors, callback){
    if (!callback){
        callback = actors
        actors = getSingle();
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
        setup(conf, APPS.MAH, mah,
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
        setup(conf, APPS.WHOLESALER, wholesaler,
            [], (err) => err
                ? callback(err)
                : setupWholesalerIterator(wholesalersCopy, products, batches, callback));
    }

    const setupPharmacyIterator = function(pharmaciesCopy, products, batches, wholesalers, callback){
        const pharmacy = pharmaciesCopy.shift();
        if (!pharmacy)
            return callback();
        console.log(`now setting up Pharmacy with key ${pharmacy.ssi}`);
        setup(conf, APPS.PHARMACY, pharmacy, products, batches,
            wholesalers, [], (err) => err
                ? callback(err)
                : setupPharmacyIterator(pharmaciesCopy, products, batches, wholesalers, callback));
    }

    const actorsCopy = [...mapper(APPS.MAH, actors),
        ...mapper(APPS.WHOLESALER, actors),
        ...mapper(APPS.PHARMACY, actors)];

    createIterator(actorsCopy, (err) => {
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

            const allProductsBackup = allProducts.slice();

            // and all existing batches
            const allBatchesObj = results[APPS.MAH].reduce((acc, mah) => {
                Object.keys(mah.results[1]).forEach(key => {
                    if (key in acc)
                        console.warn(`batches are being overwritten`);
                    acc[key] = mah.results[1][key];
                });
                return acc;
            }, {});
            setupDirectories(actors, allProductsBackup, (err) => {
                if (err)
                    return callback(err);
                setupWholesalerIterator(results[APPS.WHOLESALER].slice(), allProducts, allBatchesObj, (err) => {
                    if (err)
                        return callback (err);

                    if (conf.attachLogic)
                        submitEvent(conf, (err) => {
                            return callback(undefined, results);
                        });

                    setupPharmacyIterator(results[APPS.PHARMACY].slice(), allProductsBackup, allBatchesObj, results[APPS.WHOLESALER].map(w => w.credentials), (err) => {
                        if (err)
                            return callback(err);
                        if (!conf.attachLogic)
                            return returnResults(callback);
                    });
                });
            });
        });
    });
}


const setupDirectories = function(actors, allProducts, callback){

    const getRole = function(app){
        switch(app){
            case APPS.WHOLESALER:
                return ROLE.WHS;
            case APPS.MAH:
                return ROLE.MAH;
            case APPS.PHARMACY:
                return ROLE.PHA;
            default:
                throw new Error(`Invalid Role`);
        }
    }

    const actorIterator = function(actorsCopy, ...others){
        const callback = others.pop();
        const actor = actorsCopy.shift();
        if (!actor)
            return callback();

        console.log(`Storing actor directory entries for ${actor.credentials.id.secret}`)

        const otherIterator = function(othersCopy, callback){
            const other = othersCopy.shift();
            if (!other)
                return callback();
            const role = getRole(other.type)
            actor.manager.directoryManager.saveEntry(role, other.credentials.id.secret, (err) => {
                if (err)
                    return callback(err);
                console.log(`Directory entry for ${other.credentials.id.secret} as a ${role} stored`)
                otherIterator(othersCopy, callback);
            });
        }

        otherIterator(others.slice(), (err) => err
            ? callback(err)
            : actorIterator(actorsCopy, callback));
    }

    const doActors = function(callback){
        let othersCopy =[...mapper(APPS.WHOLESALER, actors),
            ...mapper(APPS.PHARMACY, actors)];

        actorIterator(results[APPS.MAH].slice(), ...othersCopy, (err) => {
            if (err)
                return callback(err);

            othersCopy = [...mapper(APPS.MAH, actors),
                ...mapper(APPS.PHARMACY, actors)];

            actorIterator(results[APPS.WHOLESALER].slice(), ...othersCopy, (err) => {
                if (err)
                    return callback(err);

                othersCopy = [...mapper(APPS.MAH, actors),
                    ...mapper(APPS.WHOLESALER, actors)];

                actorIterator(results[APPS.PHARMACY].slice(), ...othersCopy, (err) => {
                    if (err)
                        return callback(err);

                    callback();
                });
            });
        });
    }

    const doProducts = function(products, callback){

        const actorIterator = function(actorsCopy, ...products){
            const callback = products.pop();
            const actor = actorsCopy.shift();
            if (!actor)
                return callback();

            console.log(`Storing Product directory entries for ${actor.credentials.id.secret}`)

            const productIterator = function(productsCopy, callback){
                const product = productsCopy.shift();
                if (!product)
                    return callback();
                actor.manager.directoryManager.saveEntry(ROLE.PRODUCT, product.gtin, (err) => {
                    if (err)
                        return callback(err);
                    console.log(`Directory entry for ${product.gtin} as a ${ROLE.PRODUCT} stored`);
                    productIterator(productsCopy, callback);
                });
            }

            productIterator(products.slice(), (err) => err
                ? callback(err)
                : actorIterator(actorsCopy, callback));
        }

        actorIterator(results[APPS.WHOLESALER].slice(), ...products, (err) => {
            if (err)
                return callback(err);
            actorIterator(results[APPS.PHARMACY].slice(), ...products, (err) => {
                if (err)
                    return callback(err);
                callback();
            });
        });

    }

    doActors((err) => {
        if (err)
            return callback(err);
        doProducts(allProducts,(err) => {
            if (err)
                return callback(err);
            callback();
        })
    });

}

const returnResults = function(callback){
    callback(undefined, results);
}

const setup = function(conf, type, result, ...args){
    const callback = args.pop();

    const cb = function(ssi, type){
        return function(err, ...result){
            if (err)
                return callback(err);
            results[type].filter(r => r.ssi === ssi)[0].results = result;
            callback(undefined, ...result)
        }
    }

    let products, batches, stocks;

    switch(type){
        case APPS.MAH:
            products = args.shift() || getProducts();
            batches = args.shift();
            return require('./createMah').setup(conf, result.manager, products, batches, cb(result.ssi, APPS.MAH));
        case APPS.WHOLESALER:
            if (args.length === 1){
                stocks = args.shift();
            } else {
                products = args.shift() || getProducts();
                batches = args.shift();
                stocks = getStockFromProductsAndBatchesObj(products, batches);
            }
            return require('./createWholesaler').setup(conf, result.manager, stocks , cb(result.ssi, APPS.WHOLESALER));
        case APPS.PHARMACY:
            products = args.shift() || getProducts();
            batches = args.shift();
            const wholesalers = args.shift() || getDummyWholesalers();
            stocks = args.shift() || getStockFromProductsAndBatchesObj(products);
            return require('./createPharmacy').setup(conf, result.manager, products, batches, wholesalers, stocks, cb(result.ssi, APPS.PHARMACY));
        default:
            callback(`unsupported config: ${type}`);
    }
}

const create = function(config, credentials, callback){
    let app;
    if (typeof config === 'string'){
        app = config;
    } else {
        app = config.app;
        conf = config;
    }

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
            results[type] = results[type] || [];
            results[type].push(result);
            return shouldSetup ? setup(type, result, callback) : callback(undefined, result);
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
        case APPS.SIMPLE_TRACEABILITY:
            return setupSingleTraceability(getFakeTest(), callback);
        case APPS.TEST:
            return setupSingleTraceability(getTest(), callback);
        case APPS.PROD:
            return setupFullEnvironment(getProd(), callback);
        default:
            callback(`unsupported config: ${app}`);
    }
}

module.exports = {
    create
}