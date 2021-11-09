//import utils
const {isEqual, generateGtin, genDate, generateProductName, generateBatchNumber, generateRandomInt, validateGtin, calculateGtinCheckSum, generate2DMatrixCode, getRandom} = require('../pdm-dsu-toolkit/model/Utils');
const utils = require('../pdm-dsu-toolkit/model/Utils');
const {getProductManager, getBatchManager, getStockManager} = require('../fgt-dsu-wizard/managers')

const {Product, Batch, Stock } = require('../fgt-dsu-wizard/model');


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
        
        callback(undefined, product);
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
        
        callback(undefined, batch);
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
        counter = Math.floor(Math.random() * 4);
        batchList = [];
    }

    generateBatch(participantManager, product, (err, batch) =>{
        if(err)
            callback(err);

        batchList.push(batch);
        counter--;
        
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
 * @param {ParticipantManager} participantManager optional
 * @param {function(err, Stock)} callback
 */
const generateStock = function(participantManager,callback){
    
    if(!callback){
        callback = participantManager;
        participantManager = undefined;
    }

    if(!participantManager){
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

    if(participantManager){
        generateProduct(participantManager,(err, product) => {
            if(err)
               return callback(err);
            
            generateBatchesForProduct(participantManager, product, (err, batches) => {
                if(err)
                    return callback(err)
                
                const manager = getStockManager(participantManager);

                const stock = new Stock({
                    
                    name: generateProductName() ,
                    gtin: generateGtin(),
                    manufName:  generateProductName(),
                    description: generateProductName() + generateProductName() + generateProductName(),
                    batches: batches,
                    status: undefined,

                })

                manager.create(stock.gtin, stock, (err, keySSI) => {
                    if(err)
                        return callback(err);
                    
                    callback(undefined, stock);
                })
            })
        })
    }

}

/** 
 * @param {ParticipantManager} participantManager 
 * @param {Stock[]} stockList 
 * @param {function(err, Stock[])} callback
 */

const generateStocksWithManagers= function (participantManager, stockList, callback){

    if(!callback){
        callback = stockList;
        stockList = [];
    }
    
    generateStock(participantManager,(err, stock) => {
        if(err)
            return callback(err);
        
            stockList.push(stock);
            
        generateStock(participantManager,(err, stock) => {
            if(err)
                return callback(err);
            
                stockList.push(stock);
                
            generateStock(participantManager,(err, stock) => {
                if(err)
                    return callback(err);
                    
                stockList.push(stock);
                    
                generateStock(participantManager,(err, stock) => {
                    if(err)
                        return callback(err);
                        
                    stockList.push(stock);
                        
                    generateStock(participantManager,(err, stock) => {
                        if(err)
                            return callback(err);
                    
                        stockList.push(stock);
                        
                        callback(undefined, stockList);
                    })
                })
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

        generateIterator(participantManager,  genFunc, quantity,accumulator,callback);

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
    generateBatchesForProduct,
    generateBatches,
    generateStock,
    generateStocksWithManagers,
    generateSimpleIterator,
    copyList
   
    
}