const wizard = require('../../fgt-dsu-wizard');
const strategies = require('./strategy');
const resolver = require('opendsu').loadApi('resolver');

const model = require('../model');
const Order = model.Order;
const domain = 'traceability';
const endpoint = 'order';

/**
 * @param {strategies} strategy (defaults to strategies.SIMPLE)
 */
function OrderService(strategy){
    const orderLineService = new (require('./OrderLineService'))(strategy);

    let isSimple = strategies.SIMPLE === (strategy || strategies.SIMPLE);

    /**
     * Creates an order
     * @param {Order} order
     * @param {function} callback
     * @return {string} keySSI;
     */
    this.create = function(order, callback){
        if (isSimple){
            createSimple(order, callback);
        } else {
            createAuthorized(order, callback);
        }
    }

    let createSimple = function(order, callback){
        let keyGenFunction = require('../commands/setOrderSSI').createOrderSSI;
        let keySSI = keyGenFunction(order, domain);
        resolver.createDSUForExistingSSI(keySSI, (err, dsu) => {
            if (err)
                return callback(err);
            dsu.writeFile('/data', JSON.stringify(order), (err) => {
                if (err)
                    return callback(err);
                createOrderLines(order, (err, orderLines) => {
                    if (err)
                        return callback(err);
                    dsu.writeFile('/orderlines', JSON.stringify(orderLines.map(o => o.getIdentifier(true))), (err) => {
                        if (err)
                            return callback(err);
                        callback(undefined, keySSI);
                    });
                });
            });
        });
    }

    let createAuthorized = function(order, callback){
        const DSUService = wizard.DSUService;
        DSUService.create(domain, endpoint, (builder, cb) => {
            builder.addFileDataToDossier("/data", JSON.stringify(order), (err)=> {
                if (err)
                    return cb(err);
                createOrderLines(order, (err, orderLines) => {
                    if (err)
                        return cb(err);
                    builder.addFileDataToDossier('/orderlines', JSON.stringify(orderLines.map(o => o.getIdentifier(true))), (err) => {
                        if (err)
                            return callback(err);
                        cb();
                    });
                })
            });
        }, callback);
    }

    /**
     * Creates OrderLines DSUs for each orderLine in order
     * @param {Order} order
     * @param {function} callback
     * @return {Object[]} keySSIs
     */
    let createOrderLines = function(order, callback){
        let orderLines = [];

        let iterator = function(order, items, callback){
            let orderLine = items.shift();
            if (!orderLine)
                return callback(undefined, orderLines);
            orderLineService.create(orderLine, (err, keySSI) => {
                if (err)
                    return callback(err);
                orderLines.push(keySSI);
                iterator(order, items, callback);
            });
        }
        iterator(order, order.orderLines, callback);
    }
}

module.exports = OrderService;