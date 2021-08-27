const Order = require('../../../fgt-dsu-wizard/model/Order');
const OrderLine = require('../../../fgt-dsu-wizard/model/OrderLine');
const OrderStatus = require('../../../fgt-dsu-wizard/model/OrderStatus');
const {APPS} = require('../credentials/credentials3');
const {generateRandomInt} = require("../utils");

const issueOrder = function(issuedOrderManager, senderId, products, quantities, callback){
    const identity = issuedOrderManager.getIdentity();
    const order = new Order(Date.now(), identity.id, senderId, identity.address, OrderStatus.CREATED, products.map((p, i) => {
        return new OrderLine(p.gtin, quantities[i], identity.id, senderId, OrderStatus.CREATED);
    }));
    issuedOrderManager.create(order, (err) => {
        if (err)
            return callback(err);
        callback(undefined, order);
    });
}

const selectedRandomProducts = function(products, howMany){
    const result = [];
    while (result.length < howMany){
        const randomIndex = generateRandomInt(0, products.length -1);
        const randomProduct = products[randomIndex];
        if (result.find(p => p.gtin = randomProduct.gtin))
            continue;
        result.push(randomProduct);
    }
    return result;
}

const getRandomQuantities = function(products, min = 10, max = 100){
    const getQuantity = function(){
        return Math.floor(Math.random() * (max - min)) + min;
    }
    return products.map( (_) => getQuantity());
}

const productStrategyRandom = function(products){
    const selected = selectedRandomProducts(products, 1);
    return {
        products: selected,
        quantities: getRandomQuantities(selected)
    }
}

const getTensQuantities = function(gtin, batches){
    const maxQuantity = batches[gtin].reduce((ac, b) => ac + b.getQuantity(), 0);

    const quantityToRequest = Math.max((Math.ceil((maxQuantity / 100) * 10) / 10), 1);
    return Math.floor(quantityToRequest);
}

const productStrategyAll = function(products, batches){
    const selected = products.slice();
    return {
        products: selected,
        quantities: selected.map(p => getTensQuantities(p.gtin, batches))
    }
}

const singleOrderPerWholesaler = function(issuedOrderManager, wholesalers, productStrategy, products, batches, callback){
    const wholesalerIterator = function(whss, accum, callback){
        if (!callback){
            callback = accum;
            accum = [];
        }
        const whs = whss.shift();
        if (!whs)
            return callback();
        const selectedProducts = productStrategy(products, batches);
        issueOrder(issuedOrderManager, whs.id.secret, selectedProducts.products, selectedProducts.quantities, (err, order) => {
            if (err)
                return callback(err);
            accum.push(order);
            wholesalerIterator(whss, accum, callback);
        });

    }
    wholesalerIterator(wholesalers.slice(), callback)
}

const orderInitiator = function(conf, participantManager, products, stocksObj, batches, wholesalers, callback){
    if (products.length <=0)
        return callback("Products has zero length.");
    if (wholesalers.length <=0)
        return callback("Wholesalers has zero length.");


    let issuedOrderManager;
    try{
        issuedOrderManager = participantManager.getManager("IssuedOrderManager");
    } catch (e) {
        return callback(e);
    }

    switch(conf.app){
        case APPS.SIMPLE_TRACEABILITY:
            return singleOrderPerWholesaler(issuedOrderManager, wholesalers, productStrategyAll, products, batches, callback);
        case APPS.TEST:
            return singleOrderPerWholesaler(issuedOrderManager, wholesalers, productStrategyAll, products, batches, callback);
        default:
            console.error(`NOT IMPLEMENTED`);
            return callback()
    }
}

module.exports = orderInitiator;