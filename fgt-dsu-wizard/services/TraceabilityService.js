const utils = require('../../pdm-dsu-toolkit/services/utils');

class Node {
    id = '';
    title = '';
    parents = undefined;
    children = undefined;

    constructor(node) {
        if (typeof node !== undefined)
            for (let prop in node)
                if (node.hasOwnProperty(prop) && this.hasOwnProperty(prop))
                    this[prop] = node[prop];
    }
}


/**
 * @param {ShipmentLineManager} shipmentLineManager
 * @param {ReceiptManager} receiptManager
 * @function TraceabilityService
 * @memberOf Services
 */
function TraceabilityService(shipmentLineManager, receiptManager){

    function IdTracker(gtin, batch){
        let count = 0;
        this.gtin = gtin;
        this.batch = batch;

        this.getNext = function(){
            return ++ count;
        }
    }

    const getAllShipmentsTo = function(node, tracker, callback){
        shipmentLineManager.getAll(true, {
            query: [
                '__timestamp > 0',
                `gtin == ${tracker.gtin}`,
                `batchNumber == ${tracker.batch}`
                `requesterId == ${node.id}`
            ],
            sort: 'dsc'
        }, (err, shipmentLines) => {
            if (err)
                return callback(err);
            const senders = [... (new Set(shipmentLines.map(sl => sl.senderId)))];
            callback(undefined, senders.map(s => {
                return new Node({
                    id: tracker.getNext(),
                    title: s
                });
            }));
        });
    }

    const trackFromNode = function(node, tracker, callback){

        const nodeIterator = function(nodes, callback){
            const node = nodes.shift();
            if (!node)
                return callback();

            getAllShipmentsTo(node, tracker, (err, parentNodes) => {
                if (err)
                    return callback(err);
                if (!parentNodes || !parentNodes.length)
                    return nodeIterator(nodes, callback);

                const parentNodeIterator = function(parentNodesCopy, callback){
                    const parentNode = parentNodesCopy.shift();
                    if (!parentNode)
                        return callback();
                    nodeIterator(parentNode.parents.slice(), (err) => {
                        if (err)
                            return callback(err);
                        callback();
                    });
                }

                node.parents = parentNodes;
                parentNodes.forEach(pn => {
                    pn.children = pn.children || [];
                    pn.children.push(node);
                });

                parentNodeIterator(parentNodes.slice(), (err) => {
                    if (err)
                        return callback(err);
                    nodeIterator(nodes, callback);
                });
            });
        }
        nodeIterator([node], (err) => {
            if (err)
                return callback(err);
            callback(undefined, node);
        });
    }

    /**
     *
     * @param {IndividualProduct} product
     * @param {function(err?, )} callback
     */
    this.fromProduct = function(product, callback){
        const {gtin, batchNumber, serialNumber} = product;
        const idTracker = new IdTracker(gtin, batchNumber);
        const productKey = `${gtin}-${batchNumber}-${serialNumber}`;

        receiptManager.getOne(productKey, true, (err, product) => {
            if (err)
                return callback(err);
            const endNode = new Node({
                id: idTracker.getNext(),
                title: product.sellerId,
                description: 'This is a description'
            });

            trackFromNode(endNode, idTracker,(err, startNode) => {
                if (err)
                    return callback(err);
                callback(undefined, startNode);
            });
        });
    }

}

module.exports = TraceabilityService;