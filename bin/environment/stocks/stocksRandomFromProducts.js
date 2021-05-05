const Stock = require('../../../fgt-dsu-wizard/model/Stock');

function getRandom(arr, n) {
    var result = new Array(n),
        len = arr.length,
        taken = new Array(len);
    if (n > len)
        throw new RangeError("getRandom: more elements taken than available");
    while (n--) {
        var x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
}


const getStockFromProductsAndBatchesObj = function(products, batchesObj, omitSerials){

    const getProducts = () => products
        ? products.slice()
        : require('../products/productsRandom')();

    const getBatches = (gtin) => batchesObj
        ? batchesObj[gtin + ''].slice()
        : require('../batches/batchesRandom')();

    const prods = getProducts();
    const stocks = [];
    prods.forEach(product => {
        const stock = new Stock(product);
        const numberOfBatches = Math.floor(Math.random() * stock.batches.length) || 1;
        stock.batches = getRandom(getBatches(product.gtin), numberOfBatches).map(b => {
            if (!b.quantity){
                const quantity = Math.floor(Math.random() * b.serialNumbers.length) || 1;
                const serials = getRandom(b.serialNumbers, quantity);
                b.quantity = quantity
                b.serialNumbers = omitSerials ? undefined : serials;
            } else {
                b.serialNumbers = omitSerials ? undefined : b.serialNumbers;
            }
            return b;
        });
        stocks.push(stock);
    });
    return stocks;
}

module.exports = {
    getStockFromProductsAndBatchesObj
}