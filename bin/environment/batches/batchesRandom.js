const Batch = require('../../../fgt-dsu-wizard/model/Batch');
const { generateBatchNumber, genDate, generateGtin } = require('./../utils');

const genBatch = function(quantity = 100, expiryOffset = 100){
    const serialCount = Math.floor(Math.random() * quantity) + 1;
    const serialNumbers = [];
    for (let i = 0; i <= serialCount; i++)
        serialNumbers.push(generateGtin());

    return new Batch({
        batchNumber: generateBatchNumber(),
        expiry: genDate(Math.floor(Math.random() * expiryOffset) + 1),
        serialNumbers: serialNumbers
    });
}

const getBatches = (batchCount = 11, quantity = 100, expiryOffset = 100) =>
    Array.from(new Array(Math.floor(Math.random() * batchCount) + 1).keys())
        .map(n => genBatch(quantity, expiryOffset));


module.exports = getBatches;