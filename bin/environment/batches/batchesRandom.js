const Batch = require('../../../fgt-dsu-wizard/model/Batch');
const { generateBatchNumber, genDate, generateGtin } = require('./../utils');

const genBatch = function(quantity = 100, expiryOffset = 100, randomize = false){
    const serialCount = Math.floor((randomize ? Math.random() : 1)  * quantity) + (randomize? 1 : 0);
    const serialNumbers = [];
    for (let i = 0; i <= serialCount; i++)
        serialNumbers.push(generateGtin());

    return new Batch({
        batchNumber: generateBatchNumber(),
        expiry: genDate(Math.floor(Math.random() * expiryOffset) + 1),
        serialNumbers: serialNumbers
    });
}

const getBatches = (batchCount = 11, quantity = 100, expiryOffset = 100, randomize = true) => {
    return Array.from(new Array(Math.floor((randomize ? Math.random() : 1) * batchCount) + (randomize? 1 : 0)).keys())
        .map(n => genBatch(quantity, expiryOffset, randomize));
}



module.exports = getBatches;