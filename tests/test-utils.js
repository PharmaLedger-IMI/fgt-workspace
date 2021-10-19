//import utils
const Participant = require('../fgt-dsu-wizard/model/Participant');
const {isEqual, generateGtin, genDate, generateProductName, generateBatchNumber, generateRandomInt, validateGtin, calculateGtinCheckSum, generate2DMatrixCode, getRandom} = require('../pdm-dsu-toolkit/model/Utils');
const utils = require('../pdm-dsu-toolkit/model/Utils');

const {Product, Batch } = require('../fgt-dsu-wizard/model');



const generateProduct = function(manager, callback){

    if(!callback){
        callback = manager;
        manager = undefined;
    }

    if(!manager)
        return callback( new Product({
            name: generateProductName() ,
            gtin: generateGtin(),
            manufName:  generateProductName(),
            description: generateProductName() + generateProductName() + generateProductName(),         
        }));
}

const generateSimpleIterator = function(func, numOfTimes, list, callback){

    if(!callback){
        callback = list;
        list = [];
    }

    if(numOfTimes < 1)
        return callback(undefined, list);
    
    numOfTimes--;
    
    func((item) => {
        
        list.push(item);

        generateSimpleIterator(func,numOfTimes,list,callback);

    })

}

const copyList = function(list, callback){

    let copyList = [];

    for(let i = 0; i < list.length; i++){

        copyList.push(list[i]);

    }

    if(copyList.length !== list.length)
        return callback('Unable to copy List!');

    callback(undefined, copyList);

}




/**
 * 
 * @param manager
 * @param itemList
 * @param test
 * @param accumulator
 * @param callback
 * @returns {*}
 */

 const generateBatch = function(productQuantity){

    let serials = [];
    if(!productQuantity)
        productQuantity = Math.ceil(Math.random()*100);

    for(let i = 0; i < productQuantity; i++){

        serials.push(utils.generateSerialNumber());

    }

    return new Batch({
        batchNumber: generateBatchNumber(),
        serialNumber: utils.generateSerialNumber(),
        expiry: genDate(Math.ceil(Math.random()*100)),
        quantity: productQuantity,
        serialNumbers: serials,
    });

}













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
    
    
    if(!list)
        return test(manager , item ,(err, result) => {
            if(err)
                return callback(err);
                accumulator.push(result);
            testIterator(manager, test, itemList, accumulator, callback);
        });
    const itemTwo = list.shift();
    test(manager, item , itemTwo ,(err, result) => {
        if(err)
            return callback(err);
            console.log(result)
            accumulator.push(result);
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
    generateProduct,
    generateBatch,
    generateSimpleIterator,
    copyList
   
    
}