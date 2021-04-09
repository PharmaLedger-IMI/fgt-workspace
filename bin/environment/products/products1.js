const Product = require('../../../fgt-dsu-wizard/model/Product');


const products = [];

const genProduct = function(index){
    const product = new Product({
        gtin: Math.floor(Math.random() * 999999999999),

    })
}

module.exports = products;