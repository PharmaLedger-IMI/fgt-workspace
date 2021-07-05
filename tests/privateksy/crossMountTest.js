
//Load openDSU enviroment
require("../../privatesky/psknode/bundles/openDSU");
const wizard = require('../../fgt-dsu-wizard');


//Load openDSU SDK
const opendsu = require("opendsu");

//Load resolver library
const resolver = opendsu.loadApi("resolver");

//Load keyssi library
const keyssispace = opendsu.loadApi("keyssi");

const INFO_PATH = 'info';
const mountPath1 = 'mounta'
const mountPath2 = 'mountb'

const dummyData = {
    key1: "stugg",
    key2: "sdfsdfsdf",
    key3: [
        {stif: "sdfsdfgdg"}
    ]
}

function getDummyDSU(callback){
    const key = keyssispace.createTemplateSeedSSI('traceability', 'random', undefined, 'v0', undefined);
    resolver.createDSU(key, (err, dsu) => {
        if (err)
            return callback(err);
        dsu.writeFile(INFO_PATH, JSON.stringify(dummyData), (err) => {
            if (err)
                return callback(err);
            dsu.getKeySSIAsObject((err, keySSI) => {
                if (err)
                    return callback(err);
                callback(undefined, keySSI.getIdentifier());
            })
        })
    })
}

function doCrossMount(path, keySSIToLoad, keySSIToMount, callback){
    resolver.loadDSU(keySSIToLoad, (err, dsu) => {
        if (err)
            return callback(err);
        dsu.mount(path, keySSIToMount, (err) => {
            if (err)
                return callback(err);
            console.log(`Mounted ${keySSIToMount} in ${keySSIToLoad}'s ${path}`)
            dsu.getKeySSIAsObject((err, key) => {
                if (err)
                    return callback(err);
                callback(undefined, key.getIdentifier());
            });
        });
    });
}

try {

    getDummyDSU((err, keySSI) => {
        if (err)
            throw err;
        const keySSI1 = keySSI;
        getDummyDSU((err, keySSI) => {
            if (err)
                throw err;
            const keySSI2 = keySSI;
            doCrossMount(mountPath1, keySSI1, keySSI2, (err, key1) => {
                if (err)
                    throw err;
                if (keySSI1 !== key1)
                    throw 'Invalid key'
                doCrossMount(mountPath2, keySSI2, keySSI1, (err, key2) => {
                    if (err)
                        throw err;
                    if (keySSI2 !== key2)
                        throw 'Invalid key'
                    console.log(`test finished`);
                })
            })
        })
    })


} catch (ex ) {

    console.log("Exception:");
    console.log( ex );
}





