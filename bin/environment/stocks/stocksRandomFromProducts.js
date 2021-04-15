const Stock = require('../../../fgt-dsu-wizard/model/Stock');

const getStockFromProductsAndBatchesObj = function(products, batchesObj){
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
        stock.batches = getBatches(product.gtin).map(b => {
            b.quantity = b.quantity || Math.floor(Math.random() * b.serialNumbers.length);
            return b;
        });
        stocks.push(stock);
    });
    return stocks;
}

module.exports = {
    getStockFromProductsAndBatchesObj
}