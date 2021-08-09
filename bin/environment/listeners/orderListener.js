const {ReceivedOrderManager, IssuedOrderManager, IssuedShipmentManager} = require('../../../fgt-dsu-wizard/managers');


const issueOrder = function(participantManager, order, callback){
    const issuedOrderManager = participantManager.getManager(IssuedOrderManager);
    const directoryManager = participantManager.directoryManager;
    directoryManager.getAll(false, {
        query: ''
    })
    issuedOrderManager.create(order, callback)
}


function receivedOrderListener(participantManager){
    const receivedOrderManager = participantManager.getManager(ReceivedOrderManager);
    const issuedOrderManager = participantManager.getManager(IssuedOrderManager);
    const issuedShipmentManager = participantManager.getManager(IssuedShipmentManager);
    const stockManager = participantManager.stockManager;

    return function(message, callback){
        receivedOrderManager._getDSUInfo(message, (err, receivedOrder) => {
            if (err)
                return callback(err);

            const confirmStockIterator = function(products, callback){
                const product = products.shift();
                if (!product)
                    return callback();
                const [gtin, quantity] = product;
                stockManager.getOne(gtin, (err, stock) => {
                    if (err || !stock || !stock.getQuantity() || stock.getQuantity() < quantity)
                        return callback(`not enough of ${gtin}. needed ${quantity}`);
                    confirmStockIterator(products, callback);
                });
            }

            const get

            confirmStockIterator(receivedOrder.orderLines.map(ol => [ol.gtin, ol.quantity]), (err) => {
                if (err)
                    return callback(err);

            });
        });
    }
}