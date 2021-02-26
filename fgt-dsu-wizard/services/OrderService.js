const utils = require('./utils');

/**
 * @param {string} domain: anchoring domain. defaults to 'default'
 * @param {strategy} strategy
 */
function OrderService(domain, strategy){
    const strategies = require('./strategy');
    const model = require('../model');
    const Order = model.Order;
    const endpoint = 'order';

    domain = domain || "default";
    const orderLineService = new (require('./OrderLineService'))(domain, strategy);

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
        let templateKeySSI = keyGenFunction(order, domain);
        const resolver = utils.getResolver();
        resolver.createDSUForExistingSSI(templateKeySSI, (err, dsu) => {
            if (err)
                return callback(err);
            dsu.writeFile('/data', JSON.stringify(order), (err) => {
                if (err)
                    return callback(err);
                createOrderLines(order, (err, orderLines) => {
                    if (err)
                        return callback(err);
                    dsu.writeFile('/lines', JSON.stringify(orderLines.map(o => o.getIdentifier(true))), (err) => {
                        if (err)
                            return callback(err);
                        dsu.getKeySSIAsObject((err, keySSI) => {
                            if (err)
                                return callback(err);
                            callback(undefined, keySSI);
                        });
                    });
                });
            });
        });
    }

    let createAuthorized = function(order, callback){
        const DSUService = utils.getDSUService();

        let getEndpointData = function (order){
            return {
                endpoint: endpoint,
                data: {
                    orderId: order.orderId,
                    requesterId: order.requesterId
                }
            }
        }

        DSUService.create(domain, getEndpointData(order), (builder, cb) => {
            builder.addFileDataToDossier("/data", JSON.stringify(order), (err)=> {
                if (err)
                    return cb(err);
                createOrderLines(order, (err, orderLines) => {
                    if (err)
                        return cb(err);
                    builder.addFileDataToDossier('/lines', JSON.stringify(orderLines.map(o => o.getIdentifier(true))), (err) => {
                        if (err)
                            return callback(err);
                        cb();
                    });
                });
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
            orderLineService.create(order.orderId, orderLine, (err, keySSI) => {
                if (err)
                    return callback(err);
                orderLines.push(keySSI);
                iterator(order, items, callback);
            });
        }
        // the slice() clones the array, so that the shitf() does not destroy it.
        iterator(order, order.orderLines.slice(), callback);
    }
}

module.exports = OrderService;