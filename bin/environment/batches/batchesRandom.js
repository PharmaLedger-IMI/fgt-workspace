const Batch = require('../../../fgt-dsu-wizard/model/Batch');
const { generateBatchNumber, genDate, generateGtin } = require('./../utils');

const genBatch = function(){
    return new Batch({
        batchNumber: generateBatchNumber(),
        expiry: genDate(Math.floor(Math.random() * 100)),
        serialNumbers: new Array(Math.floor(Math.random() * 100)).map(n => generateGtin())
    });
}

const getBatches = () => Array.from(new Array(Math.floor(Math.random() * 11)).keys()).map(n => genBatch());


module.exports = getBatches;