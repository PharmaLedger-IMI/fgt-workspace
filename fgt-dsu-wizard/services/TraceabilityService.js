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
 * @param {string} requesterId
 * @function TraceabilityService
 * @memberOf Services
 */
function TraceabilityService(shipmentLineManager, receiptManager, requesterId){

    class IdTracker{
        count = 0;

        constructor(gtin, batch) {
            this.gtin = gtin;
            this.batch = batch;
        }

        getNext(){
            return ++this.count;
        }
    }

    const getAllShipmentsTo = function(node, tracker, callback){
        shipmentLineManager.getAll(true, {
            query: [
                '__timestamp > 0',
                `gtin == ${tracker.gtin}`,
                `batch == ${tracker.batch}`,
                `requesterId == ${node.title}`
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

        const nodePool = {};
        let lastNode = undefined;

        const addToPool = function(node){
            if (node.title in nodePool){
                const n = nodePool[node];
                n.children = n.children || [];
                n.parents = n.parents || [];
                nodePool[node.title].children.push(...(node.children || []));
                nodePool[node.title].parents.push(...(node.parents || []));
                return nodePool[node.title];
            }

            if (!node.parents || !node.parents.length)
                lastNode = node;

            nodePool[node.title] = node;
            return node;
        }

        addToPool(node)

        const nodeIterator = function(nodes, callback){
            const node = nodes.shift();
            if (!node)
                return callback();

            getAllShipmentsTo(node, tracker, (err, parentNodes) => {
                if (err)
                    return callback(err);
                if (!parentNodes || !parentNodes.length)
                    return nodeIterator(nodes, callback);

                parentNodes = parentNodes.map(pn => {
                    pn.children = pn.children || [];
                    pn.children.push(node);
                    return addToPool(pn);
                });

                node.parents = parentNodes;

                nodeIterator(parentNodes.slice(), callback);
            });
        }

        nodeIterator([node], (err) => {
            if (err)
                return callback(err);

            callback(undefined, node, lastNode);
        });
    }

    /**
     *
     * @param {IndividualProduct} product
     * @param {function(err?, Node?, Node?)} callback
     */
    this.fromProduct = function(product, callback){
        const {gtin, batchNumber, serialNumber} = product;
        const idTracker = new IdTracker(gtin, batchNumber);
        const productKey = `${gtin}-${batchNumber}-${serialNumber}`;

        receiptManager.getOne(productKey, true, (err, product) => {
            if (err)
                return callback(`No information available`);
            const endNode = new Node({
                id: idTracker.getNext(),
                title: product.sellerId,
                description: 'This is a description'
            });

            trackFromNode(endNode, idTracker,(err, startNode, endNode) => {
                if (err)
                    return callback(err);
                callback(undefined, startNode, endNode);
            });
        });
    }

    this.fromBatch = function(product, callback){
        const {gtin, batchNumber} = product;
        const idTracker = new IdTracker(gtin, batchNumber);

        const endNode = new Node({
            id: idTracker.getNext(),
            title: requesterId,
            description: 'This is a description'
        });

        trackFromNode(endNode, idTracker,(err, startNode, endNode) => {
            if (err)
                return callback(err);
            callback(undefined, startNode, endNode);
        });
    }

}

module.exports = TraceabilityService;