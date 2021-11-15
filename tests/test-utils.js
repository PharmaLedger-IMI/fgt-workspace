//import utils
const {isEqual, generateGtin, genDate, generateProductName, generateBatchNumber, generateRandomInt, validateGtin, calculateGtinCheckSum, generate2DMatrixCode, getRandom} = require('../pdm-dsu-toolkit/model/Utils');
const utils = require('../pdm-dsu-toolkit/model/Utils');
const {getProductManager, getBatchManager, getStockManager} = require('../fgt-dsu-wizard/managers')

const {Product, Batch, Stock } = require('../fgt-dsu-wizard/model');
const Manager = require('../pdm-dsu-toolkit/managers/Manager');


/** 
 * @param {ParticipantManager} participantManager optional if received the product will be created on data base.
 * @param {function(err, Product)} callback
 */
const generateProduct = function(participantManager, callback){

    if(!callback){
        callback = participantManager;
        participantManager = undefined;
    }

    const product = new Product({
        name: generateProductName() ,
        gtin: generateGtin(),
        manufName:  generateProductName(),
        description: generateProductName() + generateProductName() + generateProductName(),    
    })

    if(!participantManager)
        return callback(undefined, product);

    const manager = getProductManager(participantManager)

    manager.create(product.gtin, product,(err, keySSI) => {
        if(err)
            return callback(err);
        
        manager.getOne(product.gtin, true, (err, result)=>{
            if(err)
                return callback(err);

            callback(undefined, result);
        })
    })
}

/** 
 * @param {ParticipantManager} participantManager optional if received the product will be created on data base.
 * @param {Product} product optional
 * @param {function(err, Batch)} callback
 */
const generateBatch = function(participantManager, product, callback){
    
    if(!callback){
        callback = participantManager; 
        product = undefined;       
        participantManager = undefined;
    }

    let serialNumbers = [];

    for(let i = 0; i < Math.floor(Math.random()*100); i++){
        serialNumbers.push(utils.generateSerialNumber(10));
    }

    const batch = new Batch({
        batchNumber: generateBatchNumber(),
        serialNumber: utils.generateSerialNumber(10),
        expiry: genDate(Math.ceil(Math.random()*100)),
        quantity: serialNumbers.length,
        serialNumbers: serialNumbers,
    });

    if(!participantManager)
        return callback(undefined, batch);
        
    const manager = getBatchManager(participantManager);

    manager.create(product, batch, (err, keySSI) => {
        if(err)
            return callback(err);
        
        manager.getOne(product.gtin, batch.batchNumber, true, (err, result) => {
            if(err)
                return callback(err);
        
            callback(undefined, result);
        })
        
    });
}

/** 
 * @param {ParticipantManager} participantManager 
 * @param {Product} product
 * @param {Batch[]} batchList do not insert
 * @param {Number} counter do not insert
 * @param {function(err, Batch[])} callback
 */

const generateBatchesForProduct = function(participantManager, product, batchList, counter, callback){

    if(!callback){
        callback = batchList;
        counter = 3;
        batchList = [];
    }

    generateBatch(participantManager, product, (err, batch) =>{
        if(err)
            callback(err);

        batchList.push(batch);
        counter--;

        console.log(counter);
        
        if(counter === 0)
            return callback(undefined, batchList);
        
        generateBatchesForProduct(participantManager,product,batchList,counter, callback);
    }); 
}

/** 
 * @param {Batch[]} batchList optional
 * @param {Number} counter 
 * @param {function(err, Batch[])} callback
 */
const generateBatches = function(batchList, counter, callback){
    if(!callback){
        callback = counter;
        counter = batchList;
        batchList = [];
    }

    for(let i = 0; i < counter; i++){

        generateBatch((err, batch) => {
            if(err)
                callback(err)
            
            batchList.push(batch);
        })

    }

    return callback(undefined, batchList);

}

/** 
 * @param {function(err, Stock)} callback
 */
const generateStock = function(callback){
    
        generateBatches(Math.floor(Math.random()* 5), (err, batches) =>{
            if(err)
                return callback(err)
                
            const stock =  new Stock({

                name: generateProductName() ,
                gtin: generateGtin(),
                manufName:  generateProductName(),
                description: generateProductName() + generateProductName() + generateProductName(),
                batches: batches,
                status: undefined,
                            
            }); 

            return callback(undefined, stock);
        })
}

/***
 * 
 * @param {function} func
 * @param {Number} counter
 * @param {Array} list
 * @param {function(err, list)} callback
 */
const generateIterator = function (func, counter, list, callback){
    if(!callback){
        callback = list;
        list = []
    }

    func((err, item) => {
        if(err)
            return callback(err)

        list.push(item);
        counter--;

        if(counter === 0)
            return callback(undefined, list);

        generateIterator(func, counter, list, callback);
    })
}

/***
 * 
 * @param {function} func
 * @param {Item[]} acc
 * @param {Array} list
 * @param {function(err, list)} callback
 */
 const manipulateIterator = function (func, list, acc, callback){
    
    if(!callback){
        callback = acc;
        acc = []
    }

    const item = list.shift();

    if(!item)
        return callback(undefined, acc);

    func(item, (err, result) => {
        if(err)
            return callback(err)

        acc.push(result);
        
        manipulateIterator(func, list, acc, callback);
    })
}

/***
 * 
 * @param {Manager} manager
 * @param {Item[]} itemList
 * @param {function} test
 * @param {Item[]}accumulator
 * @param {function(err , Item[])}callback
 */
const testIterator = function(manager, test, itemList, accumulator, callback){
   
    if(!callback){
        callback = accumulator; 
        accumulator = [];
    }
    
    const item = itemList.shift();

    if(!item)
        return callback(undefined,accumulator); 
    
    
    return test(manager , item ,(err, result) => {
        if(err)
            return callback(err);

        accumulator.push(result);
        testIterator(manager, test, itemList, accumulator, callback);
        });
}

/** 
 * @param {ParticipantManager} participantManager 
 * @param {function(err, Stock[])} callback
 */

const generateStockWithManagers= function (participantManager, callback){
    
    generateProduct(participantManager, (err, product)=>{
        if(err)
            return callback(err);
        
        generateBatchesForProduct(participantManager, product, (err, batches) => {
            if(err)
                return callback(err);
            
            const manager = getStockManager(participantManager);

            manager.getOne(product.gtin, true, (err, dbStock) => {
                if(err)
                    return callback(err);

                callback(undefined, dbStock);
            })        
        })
    })
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
    generateBatchesForProduct,
    generateBatches,
    generateStock,
    generateStockWithManagers,
    generateIterator,
    manipulateIterator,
    generateSimpleIterator,
    copyList
   
    
}