const Product = require('../../../fgt-dsu-wizard/model/Product');
const { generateProductName, generateGtin } = require('./../utils');
const products = [];

const genProduct = function(){
    const name = generateProductName();
    const product = new Product({
        gtin: generateGtin(),
        name: name,
        description: `This is the description for ${name}`
    });
}

[10].forEach(n => products.push(genProduct()));


module.exports = products;