process.env.NO_LOGS = true;

const { APPS } = require('../../bin/environment/credentials/credentials3');

const {create} = require('../../bin/environment/setupEnvironment');

const {IndividualProduct, Sale} = require('../../fgt-dsu-wizard/model');
const TraceabilityService = require('../../fgt-dsu-wizard/services/TraceabilityService');

const testOpts = {
    app: APPS.SIMPLE_TRACEABILITY,                              // defines the mode of the setup
    credentials: undefined,                     // allows for the setup of predefined credentials
    products: './products/productsRandom.js',   // allows for pre-generated product data
    batchCount: 11,
    serialQuantity: 100,
    expiryOffset: 100,
    trueStock: true,                           // makes stock managers actually remove products from available for others down the line,
    exportCredentials: false,                   // export credentials for use in the Api-hubs front page
    attachLogic: true,                         // attaches listeners to the proper managers to replicate business logic
    statusUpdateTimeout: 5000,                   // When attachLogic is true, sets the timeout between status updates
    timeoutMultiplier: 5                        // If attach logic is true, will wait x times the status update timeout until it ends the process
}

const cb = function(err, ...results){
    if (err)
        throw err;
    console.log(`Results:`, ...results);
    process.exit(0)
}

const issueSale = function(participantManager, batchesByProduct, callback){
    let saleManager, stockManager;

    try{
        saleManager = participantManager.getManager("SaleManager");
        stockManager = participantManager.stockManager;
    } catch (e) {
        return callback(e);
    }

    stockManager.getAll(true, (err, stocks) => {
        if (err)
            return callback(err);
        if (!stocks.length)
            return callback(`Nop stock`);
        const s = stocks[0];
        if (!s.batches || !s.batches.length)
            return callback(`No batches for ${s.gtin} found`);
        const batch = s.batches[0];
        const serial = batchesByProduct[s.gtin]
            .find(b => b.batchNumber === batch.batchNumber).serialNumbers[0];

        const product = new IndividualProduct({
            name: s.name,
            gtin: s.gtin,
            batchNumber: batch.batchNumber,
            serialNumber: serial,
            manufName: s.manufName,
            expiry: batch.expiry,
            status: batch.status
        });

        const sale = new Sale({
            id: Date.now(),
            sellerId: saleManager.getIdentity().id,
            productList: [product]
        });

        saleManager.create(sale, (err) => {
            if (err)
                return callback(err);
            callback(undefined, sale);
        });
    });
}

const calculateTraceability = function(mahParticipant, sale, callback){
    let shipmentLineManager, receiptManager;

    try {
        shipmentLineManager = mahParticipant.getManager("ShipmentLineManager");
        receiptManager = mahParticipant.getManager("ReceiptManager");
    } catch (e) {
        return callback(e);
    }

    const traceabilityService = new TraceabilityService(shipmentLineManager, receiptManager);
    const product = sale.productList[0];
    console.log(`Trying to calculate supply chain for product:`, product, ` in ${testOpts.statusUpdateTimeout} ms`)
    setTimeout(() => {
        traceabilityService.fromProduct(product, (err, startNode, endNode) => {
            if (err)
                return callback(err);
            callback(undefined, startNode, endNode);
        });
    }, testOpts.statusUpdateTimeout);

}

create(testOpts, (err, results) => {
    if (err)
        return cb(err);
    console.log(`Actros created: `, results);
    issueSale(results['fgt-pharmacy-wallet'][0].manager, results['fgt-mah-wallet'][0].results[1], (err, sale) => {
        if (err)
            return cb(err);
        calculateTraceability(results['fgt-mah-wallet'][0].manager, sale, (err, startNode, endNode) => {
            if (err)
                return cb(err);
            cb(undefined, results, startNode, endNode);
        })
    });
});
