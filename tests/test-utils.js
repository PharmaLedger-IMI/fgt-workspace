//import utils
const Participant = require('../fgt-dsu-wizard/model/Participant');
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
    if(callback === accumulator)
        accumulator = [];
    
    const item = itemList.shift();
    if(!item)
        return callback(undefined,accumulator); 
    
    accumulator.push(item);
    if(!list)
        return test(manager , item ,(err, result) => {
            if(err)
                return callback(err);
            testIterator(manager, test, itemList, accumulator, callback);
        });
    const itemTwo = list.shift();
    test(item , itemTwo ,(err, result) => {
        if(err)
            return callback(err);
        testIterator(manager, test, itemList, accumulator, list, callback);
    });
}

/***
 * 
 * @param {ParticipantManager} participantManager
 * @param {function} genFunc
 * @param {Number} quantity
 * @param {Array}accumulator
 * @param {function(err, accumulator)} callback
 */

 const generateIterator = function(participantManager, genFunc, quantity, accumulator, callback){
    if(!callback){
        callback = accumulator;
    }
    
    if(callback === accumulator){
        accumulator = [];
    }

    if(quantity <= 0){
        return callback(undefined,accumulator); 
    }

    genFunc(participantManager, (err, item) => {
        if(err)
            callback(err);

        accumulator.push(item);
        quantity--;

        generateIterator(participantManager, genManagerFunc, genFunc, quantity,accumulator,callback);

    })
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