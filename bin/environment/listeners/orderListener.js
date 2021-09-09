const ModelUtils = require('../../../fgt-dsu-wizard/model/utils');
const {ANCHORING_DOMAIN} = require('../../../fgt-dsu-wizard/constants');
const ROLE = require('../../../fgt-dsu-wizard/model/DirectoryEntry').ROLE;
const Order = require('../../../fgt-dsu-wizard/model/Order');
const Shipment = require('../../../fgt-dsu-wizard/model/Shipment');
const OrderStatus = require('../../../fgt-dsu-wizard/model/OrderStatus');
const OrderLine = require('../../../fgt-dsu-wizard/model/OrderLine');
const ShipmentLine = require('../../../fgt-dsu-wizard/model/ShipmentLine');
const ShipmentStatus = require('../../../fgt-dsu-wizard/model/ShipmentStatus');

const submitEvent = require('./eventHandler');

const shipmentStatusUpdater = function(issuedShipmentManager, shipment, timeout, callback){
    const identity = issuedShipmentManager.getIdentity();
    const possibleStatus = Shipment.getAllowedStatusUpdates(shipment.status.status).filter(os => [ShipmentStatus.REJECTED, ShipmentStatus.ON_HOLD].indexOf(os) === -1);
    if (!possibleStatus || !possibleStatus.length){
        console.log(`${identity.id} - Shipment ${shipment.shipmentId} has no possible status updates`);
        return callback();
    }

    if (possibleStatus.length > 1)
        return callback(`More that one status allowed...`);
    console.log(`${identity.id} - Updating Shipment ${shipment.shipmentId}'s status to ${possibleStatus[0]} in ${timeout} miliseconds`);
    setTimeout(() => {
        console.log(`\n${identity.id} - NOW UPDATING SHIPMENT STATUS FROM ${shipment.status.status} to ${possibleStatus[0]}\n`)

        shipment.status.status = possibleStatus[0];
        submitEvent()
        issuedShipmentManager.update(shipment, (err, updatedShipment) => {
            if (err)
                return callback(err);
            console.log(`${identity.id} - Shipment ${updatedShipment.orderId}'s updated to ${updatedShipment.status.status}`);

            console.log(`\n${identity.id} - UPDATED SHIPMENT STATUS to ${updatedShipment.status.status}\n`);
            setTimeout(() => {
                submitEvent()
                shipmentStatusUpdater(issuedShipmentManager, updatedShipment, timeout, callback);
            }, timeout)
        });
    }, timeout)
}

function forwardOrder(participantManager, order, role, callback){
    const directoryManager = participantManager.getManager("DirectoryManager");
    const productService = new (require('../../../fgt-dsu-wizard/services/ProductService'))(ANCHORING_DOMAIN);

    ModelUtils.getDirectorySuppliers(directoryManager, (err, suppliers) => {
        if (err)
            return callback(err);
        if (role === ROLE.PHA)
            suppliers = suppliers.filter(s => s.startsWith('WHS'));
        if (role === ROLE.WHS)
            suppliers = suppliers.filter(s => s.startsWith('MAH'));

        const productIterator = function(gtins, accumulator, callback){
            if (!callback){
                callback = accumulator;
                accumulator = [];
            }

            const gtin = gtins.shift();
            if (!gtin)
                return callback(undefined, accumulator.reduce((accum, product) => {
                    const {manufName, gtin} = product;
                    accum[manufName] = accum[manufName] || [];
                    accum[manufName].push(gtin);
                    return accum;
                }, {}));

            productService.getDeterministic(gtin, (err, product) => {
                if (err)
                    return callback(err);
                accumulator.push(product);
                productIterator(gtins, accumulator, callback);
            });
        }

        productIterator(order.orderLines.map(ol => ol.gtin), (err, gtinsPerMah) => {
            if (err)
                return callback(err);

            const orderRequestIterator = function(mahs, accumulator, callback){
                if (!callback){
                    callback = accumulator;
                    accumulator = [];
                }

                const mah = mahs.shift();
                if (!mah)
                    return callback(undefined, accumulator);

                const splitOrder = Object.assign(new Order(), order, {
                    orderLines: order.orderLines.filter(ol => gtinsPerMah[mah].indexOf(ol.gtin) !== -1)
                });

                const increasedQuantityOrder = Object.assign(new Order(), splitOrder, {
                    orderLines: splitOrder.orderLines.map(ol => {
                        ol.quantity = 4 * ol.quantity;
                        return ol;
                    })
                })

                issueOrder(participantManager, increasedQuantityOrder, mah, (err, orderSSI) => {
                    if (err)
                        return callback(err);
                    submitEvent();
                    console.log(`Order issued to ${mah} with SSI: ${orderSSI}\n`, splitOrder);
                    accumulator.push(orderSSI);
                    orderRequestIterator(mahs, accumulator, callback);
                });
            }

            orderRequestIterator(Object.keys(gtinsPerMah), (err, orderSSIs) => {
                if (err)
                    return callback(err);
                Object.keys(gtinsPerMah)
                    .forEach((mah, i) => console.log(`Order to ${mah} with ssi: ${orderSSIs[i]}`));
                callback(undefined, orderSSIs);
            });
        });
    });
}

function issueOrder(participantManager, order, senderId, callback){
    let issuedOrderManager;
    try {
        issuedOrderManager = participantManager.getManager("IssuedOrderManager");
    } catch (e) {
        return callback(e)
    }
    const identity = issuedOrderManager.getIdentity();

    const boundOrder = new Order(Date.now(), identity.id, senderId, identity.address, OrderStatus.CREATED, order.orderLines.map(ol => {
        return new OrderLine(ol.gtin, ol.quantity, identity.id, senderId, OrderStatus.CREATED);
    }));
    submitEvent();
    issuedOrderManager.create(boundOrder, callback);
}

function createShipment(participantManager, order, stocks, callback){
    const issuedShipmentManager = participantManager.getManager("IssuedShipmentManager");
    const identity = issuedShipmentManager.getIdentity();

    const selectFromStock = function(gtin, quantity){
        const productSortedBatches = ModelUtils.sortBatchesByExpiration(stocks[gtin].batches);
        return ModelUtils.splitStockByQuantity(productSortedBatches, quantity).selected;
    }

    const shipmentLines = order.orderLines.reduce((accum, ol) => {
        accum.push(...selectFromStock(ol.gtin, ol.quantity).map(b => {
            return new ShipmentLine({
                gtin: ol.gtin,
                batch: b.batchNumber,
                quantity: ol.quantity,
                senderId: identity.id,
                requesterId: ol.requesterId,
                status: ShipmentStatus.CREATED
            });
        }));
        return accum;
    }, []);

    const shipment = new Shipment(Date.now(), order.requesterId, identity.id, order.shipToAddress, ShipmentStatus.CREATED, shipmentLines)
    submitEvent();
    issuedShipmentManager.create(order.orderId, shipment, callback);
}

function fulFillOrder(participantManager, receivedOrder, role, timeout, useForward, callback){
    if (!callback){
        callback = useForward;
        useForward = true;
    }
    const confirmStockIterator = function(products, accumulator, callback){
        if (!callback){
            callback = accumulator;
            accumulator = {};
        }
        const stockManager = participantManager.getManager("StockManager");
        const product = products.shift();
        if (!product)
            return callback(undefined, accumulator);
        const [gtin, quantity] = product;
        stockManager.getOne(gtin, (err, stock) => {
            if (err || !stock || !stock.getQuantity() || stock.getQuantity() < quantity)
                return callback(`not enough of ${gtin}. needed ${quantity}`);
            accumulator[stock.gtin] = stock;
            confirmStockIterator(products, accumulator, callback);
        });
    }

    confirmStockIterator(receivedOrder.orderLines.map(ol => [ol.gtin, ol.quantity]), (err, stocks) => {
        if (err){
            console.log(`missing stock: `, err);
            return useForward ? forwardOrder(participantManager, receivedOrder, role, callback) : callback(err);
        }
        console.log(`Stock confirmed for order:`, receivedOrder);
        createShipment(participantManager, receivedOrder, stocks, (err, shipmentSSI) => {
            if (err)
                return callback(err);
            const issuedShipmentManager = participantManager.getManager("IssuedShipmentManager");
            issuedShipmentManager._getDSUInfo(shipmentSSI, (err, shipment) => {
                if (err)
                    return callback(err);
                shipmentStatusUpdater(issuedShipmentManager, shipment, timeout, callback);
            });
        });
    });
}

function orderListener(participantManager, role, timeout = 1000){
    return function(message, callback){
        const receivedOrderManager = participantManager.getManager("ReceivedOrderManager");
        const identity = receivedOrderManager.getIdentity();
        receivedOrderManager._getDSUInfo(message.message, (err, receivedOrder) => {
            if (err)
                return callback(err);

            if (receivedOrder.status.status !== OrderStatus.CREATED){
                console.log(`${identity.id} - Skipping already handled Order ${receivedOrder.orderId} from ${receivedOrder.requesterId}`);
                return callback(undefined, message);
            }

            fulFillOrder(participantManager, receivedOrder, role, timeout, callback);
        });
    }
}

module.exports = {
    orderListener,
    fulFillOrder
};