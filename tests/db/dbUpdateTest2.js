const {create} = require('../../bin/environment/createMah');
const {APPS, getCredentials} = require('../../bin/environment/credentials/credentials3');
const {getProductManager, getBatchManager} = require('../../fgt-dsu-wizard/managers');
const {Product, Batch, Stock, utils} = require('../../fgt-dsu-wizard/model');

const batchCount = 10;

const getManagers = function(participantManager, callback){
    getProductManager(participantManager, (err, productManager) => {
        if (err)
            return callback(err);
        getBatchManager(participantManager, (err, batchManager) => {
            if (err)
                return callback(err);
            callback(undefined, productManager, batchManager, participantManager.getManager('StockManager'));
        })
    })
}

const getProduct = function(id){
    return new Product({
        name: utils.generateProductName(),
        gtin: utils.generateGtin(),
        description: `This is the description`,
        manufName: id
    })
}

const getBatch = function(){
    const serialCount = Math.floor(Math.random() * 10) + 1;
    const serialNumbers = [];
    for (let i = 0; i <= serialCount; i++)
        serialNumbers.push(utils.generateGtin());

    return new Batch({
        batchNumber: utils.generateBatchNumber(),
        expiry: utils.genDate(Math.floor(Math.random() * 100)),
        serialNumbers: serialNumbers,
        quantity: serialNumbers.length
    })
}

create(getCredentials(APPS.MAH), (err, credentials, walletSSI, participantManager) => {
    if (err)
        throw err;
    console.log(`MAH created with SSI ${walletSSI.getIndentifier()}`);

    const mahID = credentials.id.secret;

    getManagers(participantManager, (err, productManager, batchManager, stockManager) => {
        if (err)
            throw err;
        console.log(`Instantiated relevant managers`);
        const product = getProduct(mahID);
        productManager.create(product, (err, productSSI, productPath) => {
            if (err)
                throw err;
            console.log(`Product ${product.gtin} created with SSI ${productSSI} stored at ${productPath}`);

            const createBatch = function(callback){
                const batch = getBatch();
                batchManager.create(product, batch, (err, batchSSI, batchPath) => {
                    if (err)
                        throw err;
                    console.log(`Batch ${batch.batchNumber} for product ${product.gtin} created with SSI ${batchSSI} stored at ${batchPath}`);
                    callback(undefined, batch);
                });
            }

            const batches = [];

            const batchIterator = function(batchCount, callback){
                batchCount = typeof batchCount === 'number' ? Array.from(new Array(batchCount)).map((a, i) => i) : batchCount;
                const count = batchCount.shift();
                if (!count)
                    return callback(undefined, batches);
                createBatch((err, batch) => {
                    if (err)
                        return callback(err);
                    batches.push(batch);
                    batchIterator(batchCount, callback);
                })
            }

            batchIterator(batchCount, (err, batches) => {
                if (err)
                    throw err;
                console.log(`${batchCount} batches added to product ${product.gtin}:\n${JSON.stringify(batches, undefined, 2)}`);
                process.exit(0);
            })
        })
    })
})
