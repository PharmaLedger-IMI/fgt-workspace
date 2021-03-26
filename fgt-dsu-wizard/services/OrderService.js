/**
 * @module fgt-dsu-wizard.services
 */
const utils = require('../../pdm-dsu-toolkit/services/utils');

/**
 * @param {string} domain: anchoring domain. defaults to 'default'
 * @param {strategy} strategy
 */
function OrderService(domain, strategy){
    const strategies = require("../../pdm-dsu-toolkit/services/strategy");
    const model = require('../model');
    const Order = model.Order;
    const OrderStatus = model.OrderStatus;
    const endpoint = 'order';

    domain = domain || "default";
    const orderLineService = new (require('./OrderLineService'))(domain, strategy);
    const statusService = new (require('./StatusService'))(domain, strategy);

    let isSimple = strategies.SIMPLE === (strategy || strategies.SIMPLE);

    /**
     * Creates an order
     * @param {Order} order
     * @param {function(err, keySSI)} callback
     */
    this.create = function(order, callback){
        // if product is invalid, abort immediatly.
        if (typeof order === 'object') {
            let err = order.validate();
            if (err)
                return callback(err);
        }

        if (isSimple){
            createSimple(order, callback);
        } else {
            createAuthorized(order, callback);
        }
    }

    /**
     * Creates the original OrderStatus DSU
     * @param {OrderStatus} [status]: defaults to OrderStatus.CREATED
     * @param {function(err, keySSI)} callback
     */
    let createOrderStatus = function(status, callback){
        if (typeof status === 'function'){
            callback = status;
            status = OrderStatus.CREATED;
        }
        statusService.create(status, (err, keySSI) => {
            if (err)
                return callback(err);
            console.log(`Status DSU created with SSI ${keySSI.getIdentifier(true)}`);
            callback(undefined, keySSI);
        });
    }

    let createSimple = function(order, callback){
        let keyGenFunction = require('../commands/setOrderSSI').createOrderSSI;
        let templateKeySSI = keyGenFunction(order, domain);
        utils.selectMethod(templateKeySSI)(templateKeySSI, (err, dsu) => {
            if (err)
                return callback(err);
            dsu.writeFile('/info', JSON.stringify(order), (err) => {
                if (err)
                    return callback(err);
                createOrderLines(order, (err, orderLines) => {
                    if (err)
                        return callback(err);
                    dsu.writeFile('/lines', JSON.stringify(orderLines.map(o => o.getIdentifier(true))), (err) => {
                        if (err)
                            return callback(err);
                        createOrderStatus((err, keySSI) => {
                            if (err)
                                return callback(err);
                            // Mount must take string version of keyssi
                            dsu.mount("/status", keySSI.getIdentifier(), (err) => {
                                if (err)
                                    return callback(err);
                                console.log(`Status DSU (${keySSI.getIdentifier(true)}) mounted at '/status'`);
                                dsu.getKeySSIAsObject((err, keySSI) => {
                                    if (err)
                                        return callback(err);
                                    callback(undefined, keySSI);
                                });
                            });
                        });
                    });
                });
            });
        });
    }

    let createAuthorized = function(order, callback){
        let getEndpointData = function (order){
            return {
                endpoint: endpoint,
                data: {
                    orderId: order.orderId,
                    requesterId: order.requesterId
                }
            }
        }

        utils.getDSUService().create(domain, getEndpointData(order), (builder, cb) => {
            builder.addFileDataToDossier("/info", JSON.stringify(order), (err)=> {
                if (err)
                    return cb(err);
                createOrderLines(order, (err, orderLines) => {
                    if (err)
                        return cb(err);
                    builder.addFileDataToDossier('/lines', JSON.stringify(orderLines.map(o => o.getIdentifier(true))), (err) => {
                        if (err)
                            return cb(err);
                        createOrderStatus((err, keySSI) => {
                            if (err)
                                return cb(err);
                            builder.mount('/status', keySSI.getIdentifier(), (err) => {
                                if (err)
                                    return cb(err);
                                cb();
                            })
                        });
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