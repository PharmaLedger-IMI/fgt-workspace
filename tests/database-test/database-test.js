process.env.NO_LOGS = true;

const path = require('path');

// update the require path!!!

require(path.join('../../privatesky/psknode/bundles', 'testsRuntime.js'));     // test runtime
require(path.join('../../privatesky/psknode/bundles', 'pskruntime.js'));       // the whole 9 yards, can be replaced if only smaller modules are needed
const tir = require("../../privatesky/psknode/tests/util/tir");                // the test server framework

const wizard = require('../../fgt-dsu-wizard');
const { impersonateDSUStorage } = require('../../bin/environment/utils');

const dc = require("double-check");
const assert = dc.assert;

let testName = 'Querying test';

const defaultOps = {
   keyssi: '8XFFaUQX2zUGpo6UiMo15Jp9Z6L7JckT3pbkkcRT6JuevpBxMdw1dhTgGTxPukuTkCAshxPm7nqSN13WsG9g8NqjEitX72s4tibH',
   gtin: 463013334241
}

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

let conf = argParser(process.argv);

assert.callback(testName, (testFinished) => {
    const resolver = require('opendsu').loadApi('resolver');

    resolver.loadDSU(conf.keyssi, (err, rootDSU) => {
        if (err)
           throw err;
        wizard.Managers.getParticipantManager(impersonateDSUStorage(rootDSU), true, (err, participant) => {
            if (err)
                throw err;
            const batchManager = wizard.Managers.getBatchManager(participant, true);

            batchManager.getAll(true, {
                query: `gtin like /${conf.gtin}/g`
            }, (err, queriedBatches) => {
                if (err)
                    throw err;
                if (!Array.isArray(queriedBatches))
                    throw new Error('wrong result type');
                if (!queriedBatches.length >= 1)
                    throw new Error('Invalid results')
                testFinished();           // this marks a successful test
            });
        });
   });
}, 3000);    // you have 3 seconds for it to happen


