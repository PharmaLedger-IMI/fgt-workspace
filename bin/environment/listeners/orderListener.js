const {ReceivedOrderManager, IssuedOrderManager, IssuedShipmentManager, DirectoryManager, StockManager} = require('../../../fgt-dsu-wizard/managers');
const ModelUtils = require('../../../fgt-dsu-wizard/model/utils');
const {ANCHORING_DOMAIN} = require('../../../fgt-dsu-wizard/constants');
const ROLE = require('../../../fgt-dsu-wizard/model/DirectoryEntry').ROLE;
const Order = require('../../../fgt-dsu-wizard/model/Order');
const Shipment = require('../../../fgt-dsu-wizard/model/Shipment');
const OrderStatus = require('../../../fgt-dsu-wizard/model/OrderStatus');
const OrderLine = require('../../../fgt-dsu-wizard/model/OrderLine');
const ShipmentLine = require('../../../fgt-dsu-wizard/model/ShipmentLine');
const ShipmentStatus = require('../../../fgt-dsu-wizard/model/ShipmentStatus');

const shipmentStatusUpdater = function(issuedShipmentManager, shipment, timeout, callback){
    const identity = issuedShipmentManager.getIdentity();
    const possibleStatus = Shipment.getAllowedStatusUpdates(shipment.status).filter(os => [ShipmentStatus.REJECTED, ShipmentStatus.ON_HOLD].indexOf(os) === -1);
    if (!possibleStatus || !possibleStatus.length){
        console.log(`${identity.id} - Shipment ${shipment.shipmentId} has no possible status updates`);
        return callback();
    }

    if (possibleStatus.length > 1)
        return callback(`More that one status allowed...`);
    console.log(`${identity.id} - Updating Shipment ${shipment.shipmentId}'s status to ${possibleStatus[0]} in ${timeout} miliseconds`);
    setTimeout(() => {
        shipment.status = possibleStatus[0];
        issuedShipmentManager.update(shipment, (err, updatedShipment) => {
            if (err)
                return callback(err);
            console.log(`${identity.id} - Shipment ${updatedShipment.orderId}'s updated to ${updatedShipment.status}`);
            shipmentStatusUpdater(issuedShipmentManager, updatedShipment, timeout, callback);
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

                const splitOrder = Object.assign(order, {
                    orderLines: order.orderLines.filter(ol => gtinsPerMah[mah].indexOf(ol.gtin) !== -1)
                });

                issueOrder(participantManager, splitOrder, mah, (err, orderSSI) => {
                    if (err)
                        return callback(err);
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
    const issuedOrderManager = participantManager.getManager("IssuedOrderManager");
    const identity = issuedOrderManager.getIdentity();

    const boundOrder = new Order(Date.now(), identity.id, senderId, identity.address, OrderStatus.CREATED, order.orderLines.map(ol => {
        return new OrderLine(ol.gtin, ol.quantity, identity.id, senderId, OrderStatus.CREATED);
    }));

    issuedOrderManager.create(boundOrder, callback);
}

function fullfillOrder(participantManager, order, stocks, callback){
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
                quantity: b.getQuantity(),
                serialNumbers: b.serialNumbers,
                senderId: identity.id,
                requesterId: ol.requesterId,
                status: ShipmentStatus.CREATED
            });
        }));
        return accum;
    }, []);

    const shipment = new Shipment(Date.now(), order.requesterId, identity.id, order.shipToAddress, ShipmentStatus.CREATED, shipmentLines)

    issuedShipmentManager.create(order.orderId, shipment, callback);
}

function receivedOrderListener(participantManager, role, timeout = 1000){
    return function(message, callback){
        const receivedOrderManager = participantManager.getManager("ReceivedOrderManager");
        const stockManager = participantManager.stockManager;
        const identity = receivedOrderManager.getIdentity();
        receivedOrderManager._getDSUInfo(message.message, (err, receivedOrder) => {
            if (err)
                return callback(err);

            if (receivedOrder.status !== OrderStatus.CREATED){
                console.log(`${identity.id} - Skipping already handled Order ${receivedOrder.orderId} from ${receivedOrder.requesterId}`);
                return callback(undefined, message);
            }

            const confirmStockIterator = function(products, accumulator, callback){
                if (!callback){
                    callback = accumulator;
                    accumulator = {};
                }

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
                    return forwardOrder(participantManager, receivedOrder, role, callback);
                }
                console.log(`Stock confirmed for order:`, receivedOrder);
                fullfillOrder(participantManager, receivedOrder, stocks, (err, shipmentSSI) => {
                    if (err)
                        return callback(err);
                    const issuedShipmentManager = participantManager.getManager("IssuedShipmentManager");
                    issuedShipmentManager._getDSUInfo(shipmentSSI, (err, shipment) => {
                        if (err)
                            return callback(err);
                        shipmentStatusUpdater(issuedShipmentManager, shipment, timeout, callback);
                    })
                });
            });
        });
    }
}

module.exports = receivedOrderListener;