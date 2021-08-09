const {ReceivedOrderManager, IssuedOrderManager, IssuedShipmentManager} = require('../../../fgt-dsu-wizard/managers');

function receivedOrderListener(participantManager){
    const receivedOrderManager = participantManager.getManager(ReceivedOrderManager);
    const issuedOrderManager = participantManager.getManager(IssuedOrderManager);
    const issuedShipmentManager = participantManager.getManager(IssuedShipmentManager);
    const stockManager = participantManager.stockManager;

    return function(message, callback){
        receivedOrderManager._getDSUInfo(message, (err, receivedOrder) => {
            if (err)
                return callback(err);

            const productIterator = function(products, callback){
                const product = products.shift();
                if (!product)
                    return callback();
                const [gtin, quantity] = product;
                stockManager.getOne(gtin, (err, stock) => {
                    if (err || !stock || !stock.getQuantity() || stock.getQuantity() < quantity)
                        return callback(`not rnough of ${gtin}. needed ${quantity}`);

                })
            }

            productIterator(receivedOrder.orderLines.map(ol => [ol.gtin, ol.quantity]), callback)
        })
    }
}