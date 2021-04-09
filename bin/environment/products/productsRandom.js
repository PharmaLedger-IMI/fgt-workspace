const Product = require('../../../fgt-dsu-wizard/model/Product');
const { generateProductName, generateGtin } = require('./../utils');

const genProduct = function(){
    const name = generateProductName();
    return new Product({
        gtin: generateGtin(),
        name: name,
        description: `This is the description for ${name}`
    });
}

const getProducts = () => Array.from(new Array(Math.floor(Math.random() * 11)).keys()).map(n => genProduct());


module.exports = getProducts;