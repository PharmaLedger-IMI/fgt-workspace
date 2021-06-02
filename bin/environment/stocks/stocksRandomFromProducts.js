const Stock = require('../../../fgt-dsu-wizard/model/Stock');

function getRandom(trueStock, arr, n) {

    if (trueStock){
        var trueResult = [];
        for (let i = 0; i < Math.min(arr.length, n); i++)
            trueResult.push(arr.splice(Math.floor(arr.length * Math.random()), 1));
        return trueResult;
    }

    var result = new Array(n),
        len = arr.length,
        taken = new Array(len);
    if (n > len)
        return getRandom(trueStock, arr, Math.floor(n * 0.8));
        //throw new RangeError("getRandom: more elements taken than available");
    while (n--) {
        var x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
}


const getStockFromProductsAndBatchesObj = function(quantity, trueStock, products, batchesObj, omitSerials){

    const getProducts = () => products
        ? trueStock ? products : products.slice()
        : require('../products/productsRandom')();

    const getBatches = (gtin) => batchesObj
        ? trueStock ? batchesObj[gtin + ''] : batchesObj[gtin + ''].slice()
        : require('../batches/batchesRandom')();

    const prods = getProducts();
    const stocks = [];
    prods.forEach(product => {
        const stock = new Stock(product);
        const batchesForProd = getBatches(stock.gtin);
        const numberOfBatches = Math.floor(Math.random() * (batchesForProd.length / 2) + batchesForProd.length / 2) || Math.floor(batchesForProd.length / 2) || 1;
        stock.batches = getRandom(false, batchesForProd, numberOfBatches).map(b => {
            const prodQuantity = Math.floor(Math.random() * quantity) || 1;
            const serials = getRandom(trueStock, b.serialNumbers, prodQuantity);
            b.serialNumbers = omitSerials ? undefined : serials;
            b.quantity = b.serialNumbers.length;
            return b;
        });
        stocks.push(stock);
    });
    return stocks;
}

const getFullStockFromProductsAndBatchesObj = function(products, batchesObj){

    const getProducts = () => products
        ? products
        : require('../products/productsRandom')();

    const getBatches = (gtin) => batchesObj
        ? batchesObj[gtin + '']
        : require('../batches/batchesRandom')();

    const prods = getProducts();
    const stocks = [];
    prods.forEach(product => {
        const stock = new Stock(product);
        const batchesForProd = getBatches(stock.gtin);
        stock.batches = batchesForProd.map(b => {
            b.quantity = b.serialNumbers.length;
            return b;
        });
        stocks.push(stock);
    });
    return stocks;
}

module.exports = {
    getStockFromProductsAndBatchesObj,
    getFullStockFromProductsAndBatchesObj
}