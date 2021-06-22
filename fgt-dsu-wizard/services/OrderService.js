const utils = require('../../pdm-dsu-toolkit/services/utils');
const {STATUS_MOUNT_PATH, INFO_PATH} = require('../constants');

/**
 * @param {string} domain: anchoring domain. defaults to 'default'
 * @param {strategy} strategy
 * @namespace Services
 */
function OrderService(domain, strategy) {
    const strategies = require("../../pdm-dsu-toolkit/services/strategy");
    const {Order, OrderStatus} = require('../model');
    const endpoint = 'order';

    domain = domain || "default";
    const orderLineService = new (require('./OrderLineService'))(domain, strategy);
    const statusService = new (require('./StatusService'))(domain, strategy);

    let isSimple = strategies.SIMPLE === (strategy || strategies.SIMPLE);


    this.resolveMAH = function(orderLine, callback){
        const keyGen = require('../commands/setProductSSI').createProductSSI;
        const productSSI = keyGen({gtin: orderLine.gtin}, domain);
        utils.getResolver().loadDSU(productSSI, (err, dsu) => {
            if (err)
                return callback(`Could not load Product DSU ${err}`);
            dsu.readFile(INFO_PATH, (err, data) => {
                if (err)
                    return callback(`Could not read product from dsu ${err}`);
                try{
                    const product = JSON.parse(data);
                    callback(undefined, product.manufName);
                } catch (e){
                    return callback(`Could not parse Product data ${err}`)
                }
            });
        });
    }

    /**
     * Resolves the DSU and loads the Order object with all its properties, mutable or not
     * @param {KeySSI} keySSI
     * @param {function(err, Order)} callback
     */
    this.get = function(keySSI, callback){
        utils.getResolver().loadDSU(keySSI, (err, dsu) => {
            if (err)
                return callback(err);
            dsu.readFile(INFO_PATH, (err, data) => {
                if (err)
                    return callback(err);
                try{
                    const order = JSON.parse(data);
                    dsu.readFile(`${STATUS_MOUNT_PATH}${INFO_PATH}`, (err, status) => {
                        if (err)
                            return callback(`could not retrieve orderLine status`);
                        try{
                            order.status = JSON.parse(status);
                            callback(undefined, order);
                        } catch (e) {
                            callback(`unable to parse Order status: ${status}`);
                        }
                    });
                } catch (e){
                    callback(`Could not parse order in DSU ${keySSI.getIdentifier()}`);
                }
            })
        });
    }

    /**
     * Creates an order
     * @param {Order} order
     * @param {function(err, keySSI)} callback
     */
    this.create = function (order, callback) {
        // if product is invalid, abort immediatly.
        if (typeof order === 'object') {
            let err = order.validate();
            if (err)
                return callback(err);
        }

        if (isSimple) {
            createSimple(order, callback);
        } else {
            createAuthorized(order, callback);
        }
    }

    /**
     * Creates the original OrderStatus DSU
     * @param {string} id
     * @param {OrderStatus} [status]: defaults to OrderStatus.CREATED
     * @param {function(err, keySSI, orderLinesSSI)} callback
     */
    let createOrderStatus = function (id, status, callback) {
        if (typeof status === 'function') {
            callback = status;
            status = OrderStatus.CREATED;
        }
        statusService.create(status, id, (err, keySSI) => {
            if (err)
                return callback(err);
            console.log(`OrderStatus DSU created with SSI ${keySSI.getIdentifier(true)}`);
            callback(undefined, keySSI);
        });
    }

    let createSimple = function (order, callback) {
        let keyGenFunction = require('../commands/setOrderSSI').createOrderSSI;
        let templateKeySSI = keyGenFunction({data: order.orderId + order.requesterId}, domain);
        utils.selectMethod(templateKeySSI)(templateKeySSI, (err, dsu) => {
            if (err)
                return callback(err);
            dsu.writeFile(INFO_PATH, JSON.stringify(order), (err) => {
                if (err)
                    return callback(err);
                console.log("Order /info ", JSON.stringify(order));
                createOrderStatus(order.requesterId, (err, statusSSI) => {
                    if (err)
                        return callback(err);
                    // Mount must take string version of keyssi
                    dsu.mount(STATUS_MOUNT_PATH, statusSSI.getIdentifier(), (err) => {
                        if (err)
                            return callback(err);
                        console.log(`OrderStatus DSU (${statusSSI.getIdentifier(true)}) mounted at '/status'`);
                        createOrderLines(order, statusSSI, (err, orderLines) => {
                            if (err)
                                return callback(err);
                            const lines = JSON.stringify(orderLines.map(o => o.getIdentifier(true)));
                            dsu.writeFile('/lines', lines, (err) => {
                                if (err)
                                    return callback(err);
                                dsu.getKeySSIAsObject((err, keySSI) => {
                                    if (err)
                                        return callback(err);
                                    console.log("Finished creating Order " + keySSI.getIdentifier(true));
                                    callback(undefined, keySSI, orderLines);
                                });
                            });
                        });
                    });
                });
            });
        });
    }

    let createAuthorized = function (order, callback) {
        let getEndpointData = function (order) {
            return {
                endpoint: endpoint,
                data: {
                    data: order.orderId + order.requesterId
                }
            }
        }

        utils.getDSUService().create(domain, getEndpointData(order), (builder, cb) => {
            builder.addFileDataToDossier(INFO_PATH, JSON.stringify(order), (err) => {
                if (err)
                    return cb(err);
                createOrderStatus(order.requesterId, (err, statusSSI) => {
                    if (err)
                        return cb(err);
                    builder.mount(STATUS_MOUNT_PATH, statusSSI.getIdentifier(), (err) => {
                        if (err)
                            return cb(err);
                        createOrderLines(order, statusSSI, (err, orderLines) => {
                            if (err)
                                return cb(err);
                            builder.addFileDataToDossier('/lines', JSON.stringify(orderLines.map(o => o.getIdentifier(true))), (err) => {
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
     * @param {KeySSI} statusSSI keySSI to the OrderStatus DSU
     * @return {Object[]} keySSIs
     */
    let createOrderLines = function (order, statusSSI, callback) {
        let orderLines = [];

        statusSSI = statusSSI.derive();
        let iterator = function (order, items, callback) {
            let orderLine = items.shift();
            if (!orderLine)
                return callback(undefined, orderLines);
            orderLineService.create(order.orderId, orderLine, statusSSI, (err, keySSI) => {
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