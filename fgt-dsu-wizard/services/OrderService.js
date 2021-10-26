const Utils = require('../../pdm-dsu-toolkit/services/utils');
const {STATUS_MOUNT_PATH, INFO_PATH, SHIPMENT_PATH, ORDER_MOUNT_PATH} = require('../constants');
const {OrderStatus, Batch} = require("../model");


/**
 * @param {string} domain: anchoring domain. defaults to 'default'
 * @param {strategy} strategy
 * @function OrderService
 * @memberOf Services
 */
function OrderService(domain, strategy) {
    const strategies = require("../../pdm-dsu-toolkit/services/strategy");
    const {Order, OrderStatus, utils} = require('../model');
    const endpoint = 'order';

    domain = domain || "default";
    const statusService = new (require('./StatusService'))(domain, strategy);

    let isSimple = strategies.SIMPLE === (strategy || strategies.SIMPLE);


    this.resolveMAH = function(orderLine, callback){
        const keyGen = require('../commands/setProductSSI').createProductSSI;
        const productSSI = keyGen({gtin: orderLine.gtin}, domain);
        Utils.getResolver().loadDSU(productSSI, (err, dsu) => {
            if (err)
                return callback(`Could not load Product DSU ${err}`);
            dsu.readFile(INFO_PATH, (err, data) => {
                if (err)
                    return callback(`Could not read product from dsu ${err}`);
                let product;
                try{
                    product = JSON.parse(data);
                } catch (e){
                    return callback(`Could not parse Product data ${err}`)
                }
                callback(undefined, product.manufName);
            });
        });
    }

    /**
     * Resolves the DSU and loads the Order object with all its properties, mutable or not
     * @param {KeySSI} keySSI
     * @param {function(err?, Order?, Archive?, KeySSI?)} callback
     */
    this.get = function(keySSI, callback){
        Utils.getResolver().loadDSU(keySSI, {skipCache: true}, (err, dsu) => {
            if (err)
                return callback(err);
            dsu.readFile(INFO_PATH, (err, data) => {
                if (err)
                    return callback(err);
                let order;
                try {
                    order = JSON.parse(data);
                } catch (e) {
                    return callback(`Could not parse order in DSU ${keySSI}`);
                }
                order = new Order(order.orderId, order.requesterId, order.senderId, order.shipToAddress, order.status, order.orderLines);
                console.log('## OrderService.get order=', order);
                Utils.getMounts(dsu, '/', STATUS_MOUNT_PATH, (err, mounts) => {
                    if (err)
                        return callback(err);
                    statusService.get(mounts[STATUS_MOUNT_PATH], (err, status) => {
                        if (err)
                            return callback(err);
                        order.status = status;

                        if (order.status.status === OrderStatus.CREATED)
                            return callback(undefined, order, dsu, keySSI);
                        dsu.readFile(`${SHIPMENT_PATH}${INFO_PATH}`, (err, data) => {
                            if (err || !data)
                                return callback(undefined, order, dsu);
                            let shipment;
                            try {
                                shipment = JSON.parse(data);
                            } catch (e) {
                                return callback(e);
                            }
                            order.shipmentId = shipment.shipmentId;
                            callback(undefined, order, dsu, keySSI);
                        });
                    });
                });
            });
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

    const validateUpdate = function(orderFromSSI, updatedOrder, callback){
        if (!utils.isEqual(orderFromSSI, updatedOrder, "status", "orderLines", "shipmentSSI"))
            return callback('invalid update');
        return callback();
    }

    /**
     * updates an order DSU
     * @param {KeySSI} keySSI
     * @param {Order} order
     * @param {function(err?)} callback
     */
    this.update = function (keySSI, order, callback) {
        // if product is invalid, abort immediatly.
        const self = this;

        self.get(keySSI, (err, orderFromSSI, orderDsu) => {
            if (err)
                return callback(err);

            if (typeof order === 'object') {
                let err = order.validate();
                if (err)
                    return callback(err);
            }

            const cb = function(err, ...results){
                if (err)
                    return orderDsu.cancelBatch(err2 => {
                        callback(err);
                    });
                callback(undefined, ...results);
            }

            try{
                orderDsu.beginBatch();
            }catch(e){
                return callback(e);
            }

            validateUpdate(orderFromSSI, order, (err) => {
                if (err)
                    return cb(err);
                Utils.getMounts(orderDsu, '/', STATUS_MOUNT_PATH, SHIPMENT_PATH, (err, mounts) => {
                    if (err)
                        return cb(err);
                    if (!mounts[STATUS_MOUNT_PATH])
                        return cb(`Missing mount path ${STATUS_MOUNT_PATH}`);
                    statusService.update(mounts[STATUS_MOUNT_PATH], order.status, order.requesterId, (err) => {
                        if (err)
                            return cb(err);

                        if (!mounts[SHIPMENT_PATH] && order.shipmentSSI)
                            orderDsu.mount(SHIPMENT_PATH, order.shipmentSSI, (err) => {
                                if (err)
                                    return cb(err);
                                orderDsu.commitBatch((err) => {
                                    if(err)
                                        return cb(err);
                                    self.get(keySSI, callback);
                                });
                            });
                        else
                            self.get(keySSI, callback);
                    });
                });
            });
        });
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
        Utils.selectMethod(templateKeySSI)(templateKeySSI, (err, dsu) => {
            if (err)
                return callback(err);

            const cb = function(err, ...results){
                if (err)
                    return dsu.cancelBatch(err2 => {
                        callback(err);
                    });
                callback(undefined, ...results);
            }

            try {
                dsu.beginBatch();
            } catch (e) {
                return callback(e);
            }

            dsu.writeFile(INFO_PATH, JSON.stringify(order), (err) => {
                if (err)
                    return cb(err);
                console.log("Order /info ", JSON.stringify(order));
                createOrderStatus(order.requesterId, order.status,(err, statusSSI) => {
                    if (err)
                        return cb(err);
                    // Mount must take string version of keyssi
                    dsu.mount(STATUS_MOUNT_PATH, statusSSI.getIdentifier(), (err) => {
                        if (err)
                            return cb(err);
                        console.log(`OrderStatus DSU (${statusSSI.getIdentifier(true)}) mounted at '/status'`);
                        dsu.commitBatch((err) => {
                            if (err)
                                return cb(err);
                            dsu.getKeySSIAsObject((err, keySSI) => {
                                if (err)
                                    return callback(err);
                                console.log("Finished creating Order " + keySSI.getIdentifier(true));
                                callback(undefined, keySSI, order.orderLines);
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

        Utils.getDSUService().create(domain, getEndpointData(order), (builder, cb) => {
            builder.addFileDataToDossier(INFO_PATH, JSON.stringify(order), (err) => {
                if (err)
                    return cb(err);
                createOrderStatus(order.requesterId, (err, statusSSI) => {
                    if (err)
                        return cb(err);
                    builder.mount(STATUS_MOUNT_PATH, statusSSI.getIdentifier(), (err) => {
                        if (err)
                            return cb(err); 
                        cb();    
                    });
                });
            });
        }, callback);
    }
}

module.exports = OrderService;