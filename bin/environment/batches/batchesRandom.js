const Batch = require('../../../fgt-dsu-wizard/model/Batch');
const { generateBatchNumber, genDate, generateGtin } = require('./../utils');

const genBatch = function(){
    const serialCount = Math.floor(Math.random() * 100) + 1;
    const serialNumbers = [];
    for (let i = 0; i <= serialCount; i++)
        serialNumbers.push(generateGtin());

    return new Batch({
        batchNumber: generateBatchNumber(),
        expiry: genDate(Math.floor(Math.random() * 100)),
        serialNumbers: serialNumbers
    });
}

const getBatches = () => Array.from(new Array(Math.floor(Math.random() * 11) + 1).keys()).map(n => genBatch());


module.exports = getBatches;