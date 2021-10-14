//import utils
const {isEqual, generateGtin, genDate, generateProductName, generateBatchNumber, generateRandomInt, validateGtin, calculateGtinCheckSum, generate2DMatrixCode, getRandom} = require('../pdm-dsu-toolkit/model/Utils');
const utils = require('../pdm-dsu-toolkit/model/Utils');

/***
 * 
 * @param manager
 * @param itemList
 * @param test
 * @param accumulator
 * @param callback
 * @returns {*}
 */

 const testIterator = function(manager, test, itemList, accumulator,...args){
    const callback = args.length > 0? args.pop(): accumulator;
    const list = args.pop();

    if(callback === accumulator){
        accumulator = [];
    }

    const item = itemList.shift();

    if(!item){
        return callback(undefined,accumulator); 
    }

    accumulator.push(item);

    if(!!list){
        const itemTwo = list.shift();

        test(item , itemTwo ,(err, result) => {
            if(err)
                return callback(err);

            testIterator(manager, test, itemList, accumulator, list, callback);
        })
    }
    if(!list){
        test(manager , item ,(err, result) => {
            if(err)
                return callback(err);

            testIterator(manager, test, itemList, accumulator, callback);

        })
    }

}








module.exports ={
    getRandom,
    generate2DMatrixCode,
    generateProductName,
    generateGtin,
    validateGtin,
    calculateGtinCheckSum,
    generateBatchNumber,
    generateRandomInt,
    genDate,
    isEqual,
    testIterator,
    
}