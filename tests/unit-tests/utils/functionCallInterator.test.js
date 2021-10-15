process.env.NO_LOGS = true;
process.env.PSK_CONFIG_LOCATION = process.cwd();

const path = require('path');

const test_bundles_path = path.join('../../../privatesky/psknode/bundles', 'testsRuntime.js');
require(test_bundles_path);
const {argParser} = require('../../../bin/environment/utils');

const dc = require("double-check");
const assert = dc.assert;
const tir = require("../../../privatesky/psknode/tests/util/tir");

const utils = require('../../../pdm-dsu-toolkit/services/utils');

const {functionCallIterator} = utils;

const testMethod1 = function(key, arg1, callback){
    console.log(`Test method 1 called with`, key, arg1);
    assert.true(parseInt(key) === arg1/2);
    callback(undefined, true, key, arg1);
}

const testMethod2 = function(key, arg1, arg2, callback){
    console.log(`Test method 1 called with`, key, arg1, arg2);
    assert.true(parseInt(key) === arg1/2);
    assert.true(parseInt(key) === arg2/4);
    callback(undefined, true, key, arg1, arg2);
}


const keys = [1,2,3,4,5,6,7,8,9].map(k => k + '');
const args1 = keys.map(k => 2 * parseInt(k));
const args2 = keys.map(k => 4 * parseInt(k));


assert.callback("Function call iterator test", (testFinished) => {
    functionCallIterator(testMethod1, keys, args1, (err, results) => {
        assert.true(!err);
        console.log(results)
        functionCallIterator(testMethod2, keys, args1, args2, (err, results) => {
            assert.true(!err);
            console.log(results)
            testFinished();
        });
    });
}, 5000)